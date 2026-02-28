use crate::models::{InputData, Schedule, ClassAssignment, Room, Faculty, Section, TimeSlot, Course};
use rand::prelude::*;
use rayon::prelude::*;
use std::collections::HashMap;

// ==========================================
// CONFIGURATION
// ==========================================
const POPULATION_SIZE: usize = 150;
const MAX_GENERATIONS: usize =2500;
const MUTATION_RATE: f64 = 0.1;
const ELITISM_COUNT: usize = 4;
const BASE_SCORE: f64 = 10_000.0; 

// ==========================================
// PUBLIC INTERFACE
// ==========================================

pub fn solve(input: InputData) -> Schedule {
    // 1. Pre-process data for fast lookups
    let room_map: HashMap<String, Room> = input.rooms.iter().map(|r| (r.id.clone(), r.clone())).collect();
    let faculty_map: HashMap<String, Faculty> = input.faculty.iter().map(|f| (f.id.clone(), f.clone())).collect();
    let section_map: HashMap<String, Section> = input.sections.iter().map(|s| (s.id.clone(), s.clone())).collect();
    let slot_map: HashMap<u8, TimeSlot> = input.slots.iter().map(|s| (s.id, s.clone())).collect();
    let course_map: HashMap<String, Course> = input.courses.iter().map(|c| (c.id.clone(), c.clone())).collect();

    // Pre-compute consecutive slot pairs (non-break) per day for lab scheduling
    let consecutive_pairs = build_consecutive_pairs(&input.slots);
    // Pre-compute consecutive triples for CIR scheduling
    let consecutive_triples = build_consecutive_triples(&input.slots);

    // 2. Initialize Population
    let mut population: Vec<Schedule> = (0..POPULATION_SIZE)
        .into_par_iter()
        .map(|_| generate_random_schedule(&input, &consecutive_pairs, &consecutive_triples))
        .collect();

    // 3. Evolution Loop
    for generation in 0..MAX_GENERATIONS {
        
        // Calculate Fitness in Parallel
        population.par_iter_mut().for_each(|sched| {
            sched.fitness = calculate_fitness(
                sched, &input, &room_map, &faculty_map, &section_map, 
                &slot_map, &course_map, &consecutive_pairs
            );
        });

        // Sort by fitness (Higher is better)
        population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());

        // DEBUG LOG: Print progress every 50 generations
        if generation % 50 == 0 {
            eprintln!("Generation {}: Best Score = {:.1}", generation, population[0].fitness);
        }

        // Check for near-perfect solution
        if population[0].fitness >= (BASE_SCORE - 1.0) {
            break;
        }

        // Create Next Generation
        let mut new_pop = Vec::with_capacity(POPULATION_SIZE);

        // Elitism: Keep best schedules
        for i in 0..ELITISM_COUNT {
            new_pop.push(population[i].clone());
        }

        // Breed new children
        while new_pop.len() < POPULATION_SIZE {
            let parent_a = select_parent(&population);
            let parent_b = select_parent(&population);
            
            let (mut child_1, mut child_2) = crossover(parent_a, parent_b);
            
            mutate(&mut child_1, &input, &consecutive_pairs, &consecutive_triples);
            mutate(&mut child_2, &input, &consecutive_pairs, &consecutive_triples);

            new_pop.push(child_1);
            if new_pop.len() < POPULATION_SIZE {
                new_pop.push(child_2);
            }
        }

        population = new_pop;
    }

    // Return the best found
    population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());
    population[0].clone()
}

// ==========================================
// HELPER: Build consecutive non-break slot pairs per day
// ==========================================
fn build_consecutive_pairs(slots: &[TimeSlot]) -> Vec<(u8, u8, String)> {
    let mut pairs = Vec::new();
    let mut by_day: HashMap<String, Vec<&TimeSlot>> = HashMap::new();
    
    for slot in slots {
        by_day.entry(slot.day.clone()).or_default().push(slot);
    }
    
    for (day, mut day_slots) in by_day {
        day_slots.sort_by_key(|s| s.id);
        for i in 0..day_slots.len().saturating_sub(1) {
            let a = day_slots[i];
            let b = day_slots[i + 1];
            // Both must be non-break and on the same day
            if !a.is_break && !b.is_break && a.end_time == b.start_time {
                pairs.push((a.id, b.id, day.clone()));
            }
        }
    }
    pairs
}

// ==========================================
// HELPER: Build consecutive non-break slot triples per day (for CIR)
// Finds 3 consecutive TEACHING slots (skips breaks) on the same day
// ==========================================
fn build_consecutive_triples(slots: &[TimeSlot]) -> Vec<(u8, u8, u8, String)> {
    let mut triples = Vec::new();
    let mut by_day: HashMap<String, Vec<&TimeSlot>> = HashMap::new();
    
    for slot in slots {
        by_day.entry(slot.day.clone()).or_default().push(slot);
    }
    
    for (day, mut day_slots) in by_day {
        day_slots.sort_by_key(|s| s.id);
        // Filter to only teaching (non-break) slots
        let teaching_slots: Vec<&&TimeSlot> = day_slots.iter()
            .filter(|s| !s.is_break)
            .collect();
        
        // Any 3 consecutive teaching slots form a valid CIR triple
        for i in 0..teaching_slots.len().saturating_sub(2) {
            let a = teaching_slots[i];
            let b = teaching_slots[i + 1];
            let c = teaching_slots[i + 2];
            triples.push((a.id, b.id, c.id, day.clone()));
        }
    }
    triples
}

// ==========================================
// CORE: Generate an initial random schedule
// ==========================================
fn generate_random_schedule(
    input: &InputData, 
    consecutive_pairs: &[(u8, u8, String)],
    consecutive_triples: &[(u8, u8, u8, String)]
) -> Schedule {
    let mut classes = Vec::new();
    let mut rng = thread_rng();

    // Separate CIR and non-CIR courses
    let cir_courses: Vec<&Course> = input.courses.iter()
        .filter(|c| c.subject_type == "CIR")
        .collect();
    let non_cir_courses: Vec<&Course> = input.courses.iter()
        .filter(|c| c.subject_type != "CIR")
        .collect();

    // Find CIR faculty
    let cir_faculty: Vec<&Faculty> = input.faculty.iter()
        .filter(|f| f.is_cir_only)
        .collect();

    // Non-CIR faculty (regular + lab assistants)
    let regular_faculty: Vec<&Faculty> = input.faculty.iter()
        .filter(|f| !f.is_cir_only && f.role == "Faculty")
        .collect();
    let lab_assistants: Vec<&Faculty> = input.faculty.iter()
        .filter(|f| f.role == "LabAssistant")
        .collect();

    // Schedule CIR courses for each section (3 consecutive slots)
    for section in &input.sections {
        if !consecutive_triples.is_empty() && cir_courses.len() == 3 {
            let triple = consecutive_triples.choose(&mut rng).unwrap();
            let random_room = input.rooms.choose(&mut rng).unwrap();

            // Sort CIR courses by sub-type: Verbal->Technical->Aptitude
            let verbal = cir_courses.iter().find(|c| c.cir_sub_type.as_deref() == Some("Verbal"));
            let technical = cir_courses.iter().find(|c| c.cir_sub_type.as_deref() == Some("Technical"));
            let aptitude = cir_courses.iter().find(|c| c.cir_sub_type.as_deref() == Some("Aptitude"));
            
            let cir_ordered = [verbal, technical, aptitude];
            let slot_ids = [triple.0, triple.1, triple.2];

            for (i, cir_c) in cir_ordered.iter().enumerate() {
                if let Some(course) = cir_c {
                    // Find matching CIR faculty
                    let fac = cir_faculty.iter()
                        .find(|f| f.cir_sub_type == course.cir_sub_type)
                        .unwrap_or_else(|| cir_faculty.choose(&mut rng).unwrap());
                    
                    classes.push(ClassAssignment {
                        course_id: course.id.clone(),
                        section_id: section.id.clone(),
                        faculty_id: fac.id.clone(),
                        room_id: random_room.id.clone(),
                        slot_id: slot_ids[i],
                        day: triple.3.clone(),
                        lab_assistant_id: None,
                    });
                }
            }
        }
    }

    // Schedule non-CIR courses for each section
    for course in &non_cir_courses {
        for section in &input.sections {
            if course.subject_type == "Lab" && course.duration >= 2 {
                // Lab: pick a consecutive pair
                let room = input.rooms.iter()
                    .filter(|r| r.r#type == "Lab")
                    .choose(&mut rng)
                    .unwrap_or_else(|| input.rooms.choose(&mut rng).unwrap());

                let fallback_faculty = input.faculty.choose(&mut rng).unwrap();
                let faculty = if let Some(fid) = &course.faculty_id {
                    input.faculty.iter().find(|f| f.id == *fid).unwrap_or(fallback_faculty)
                } else if let Some(rf) = regular_faculty.choose(&mut rng) {
                    rf
                } else {
                    fallback_faculty
                };

                if !consecutive_pairs.is_empty() {
                    let pair = consecutive_pairs.choose(&mut rng).unwrap();
                    
                    // Use designated lab assistant from course, fallback to random
                    let la_id = if let Some(ref designated) = course.lab_assistant_id {
                        Some(designated.clone())
                    } else if !lab_assistants.is_empty() {
                        Some(lab_assistants.choose(&mut rng).unwrap().id.clone())
                    } else {
                        None
                    };

                    // First slot - teacher + lab assistant
                    classes.push(ClassAssignment {
                        course_id: course.id.clone(),
                        section_id: section.id.clone(),
                        faculty_id: faculty.id.clone(),
                        room_id: room.id.clone(),
                        slot_id: pair.0,
                        day: pair.2.clone(),
                        lab_assistant_id: la_id.clone(),
                    });
                    // Second slot - same teacher + same lab assistant
                    classes.push(ClassAssignment {
                        course_id: course.id.clone(),
                        section_id: section.id.clone(),
                        faculty_id: faculty.id.clone(),
                        room_id: room.id.clone(),
                        slot_id: pair.1,
                        day: pair.2.clone(),
                        lab_assistant_id: la_id,
                    });
                }
            } else {
                // Theory: single slot
                let random_room = input.rooms.iter()
                    .filter(|r| r.r#type == "Lecture")
                    .choose(&mut rng)
                    .unwrap_or_else(|| input.rooms.choose(&mut rng).unwrap());
                
                let fallback_faculty = input.faculty.choose(&mut rng).unwrap();
                let faculty = if let Some(fid) = &course.faculty_id {
                    input.faculty.iter().find(|f| f.id == *fid).unwrap_or(fallback_faculty)
                } else if let Some(rf) = regular_faculty.choose(&mut rng) {
                    rf
                } else {
                    fallback_faculty
                };
                
                let non_break_slots: Vec<&TimeSlot> = input.slots.iter()
                    .filter(|s| !s.is_break)
                    .collect();
                let random_slot = non_break_slots.choose(&mut rng).unwrap();

                classes.push(ClassAssignment {
                    course_id: course.id.clone(),
                    section_id: section.id.clone(),
                    faculty_id: faculty.id.clone(),
                    room_id: random_room.id.clone(),
                    slot_id: random_slot.id,
                    day: random_slot.day.clone(),
                    lab_assistant_id: None,
                });
            }
        }
    }

    Schedule { fitness: -1_000_000.0, classes }
}

// ==========================================
// CORE: FITNESS FUNCTION
// ==========================================
fn calculate_fitness(
    schedule: &Schedule,
    input: &InputData,
    rooms: &HashMap<String, Room>,
    faculty: &HashMap<String, Faculty>,
    sections: &HashMap<String, Section>,
    slots: &HashMap<u8, TimeSlot>,
    courses: &HashMap<String, Course>,
    consecutive_pairs: &[(u8, u8, String)]
) -> f64 {
    let mut score = BASE_SCORE; 
    
    // Maps to track overlaps
    let mut room_occupancy: HashMap<String, String> = HashMap::new(); 
    let mut faculty_occupancy: HashMap<String, String> = HashMap::new(); 
    let mut section_occupancy: HashMap<String, String> = HashMap::new(); 

    // Track per-section lab hours and theory hours for equal distribution
    let mut section_lab_hours: HashMap<String, u32> = HashMap::new();
    let mut section_theory_hours: HashMap<String, u32> = HashMap::new();

    // Track course weekly assignments per section
    let mut course_section_count: HashMap<String, u32> = HashMap::new();

    // Track CIR assignments per section for contiguity check
    let mut cir_assignments: HashMap<String, Vec<(u8, String, String)>> = HashMap::new(); // section -> (slot_id, day, cir_sub_type)

    // Track faculty total load
    let mut faculty_load: HashMap<String, u32> = HashMap::new();

    // Track section's slots per day for compaction and lab-per-day checks
    let mut section_day_slots: HashMap<String, Vec<u8>> = HashMap::new(); // "section_day" -> [slot_ids]
    let mut section_day_labs: HashMap<String, u32> = HashMap::new(); // "section_day" -> lab_count

    for class in &schedule.classes {
        let key_base = format!("{}_{}", class.day, class.slot_id);
        let course = courses.get(&class.course_id);
        let prof = faculty.get(&class.faculty_id);
        
        // --- HARD CONSTRAINTS (Big Penalties) ---

        // 1. Double Booking: Room
        let room_key = format!("{}_{}", key_base, class.room_id);
        if room_occupancy.contains_key(&room_key) {
            score -= 100.0;
        } else {
            room_occupancy.insert(room_key, class.room_id.clone());
        }

        // 2. Double Booking: Faculty
        let faculty_key = format!("{}_{}", key_base, class.faculty_id);
        if faculty_occupancy.contains_key(&faculty_key) {
            score -= 100.0;
        } else {
            faculty_occupancy.insert(faculty_key, class.faculty_id.clone());
        }

        // 3. Double Booking: Student Section
        let section_key = format!("{}_{}", key_base, class.section_id);
        if section_occupancy.contains_key(&section_key) {
            score -= 100.0;
        } else {
            section_occupancy.insert(section_key, class.section_id.clone());
        }

        // 4. Room Capacity
        if let (Some(room), Some(section)) = (rooms.get(&class.room_id), sections.get(&class.section_id)) {
            if room.capacity < section.size {
                score -= 50.0;
            }
            // 5. Accessibility
            if section.requires_access && !room.is_accessible {
                score -= 50.0;
            }
            // 6. Room Type Mismatch (Lab vs Lecture)
            if let Some(c) = course {
                if c.subject_type == "Lab" && room.r#type != "Lab" {
                    score -= 50.0;
                }
            }
        }

        // 7. Faculty Availability (reduced weight — workload optimization takes priority)
        if let Some(p) = prof {
            if p.unavailable.contains(&class.slot_id) {
                score -= 10.0; // Reduced from 50 — low priority vs workload
            }
            // 8. Contract Days
            if !p.contracted_days.is_empty() && !p.contracted_days.contains(&class.day) {
                score -= 50.0;
            }
            
            // 9. CIR Teacher Exclusivity: CIR-only teachers must NOT teach non-CIR courses
            if let Some(c) = course {
                if p.is_cir_only && c.subject_type != "CIR" {
                    score -= 150.0;
                }
                // Non-CIR faculty should not teach CIR
                if !p.is_cir_only && c.subject_type == "CIR" {
                    score -= 150.0;
                }
            }

            // 10. Lab Assistant should only teach Lab courses
            if p.role == "LabAssistant" {
                if let Some(c) = course {
                    if c.subject_type != "Lab" {
                        score -= 100.0;
                    }
                }
            }
        }

        // 11. Break Times - no classes during breaks
        if let Some(slot) = slots.get(&class.slot_id) {
            if slot.is_break {
                score -= 100.0; 
            }
        }

        // --- TRACKING for aggregate constraints ---
        
        if let Some(c) = course {
            // Track lab/theory hours per section
            if c.subject_type == "Lab" {
                *section_lab_hours.entry(class.section_id.clone()).or_insert(0) += 1;
            } else if c.subject_type == "Theory" {
                *section_theory_hours.entry(class.section_id.clone()).or_insert(0) += 1;
            }

            // Track course assignments per section
            let cs_key = format!("{}_{}", class.course_id, class.section_id);
            *course_section_count.entry(cs_key).or_insert(0) += 1;

            // Track CIR assignments per section
            if c.subject_type == "CIR" {
                let sub_type = c.cir_sub_type.clone().unwrap_or_default();
                cir_assignments.entry(class.section_id.clone())
                    .or_default()
                    .push((class.slot_id, class.day.clone(), sub_type));
            }
        }

        // Track faculty load
        *faculty_load.entry(class.faculty_id.clone()).or_insert(0) += 1;

        // Track section daily slots for compaction
        let section_day_key = format!("{}_{}", class.section_id, class.day);
        section_day_slots.entry(section_day_key.clone()).or_default().push(class.slot_id);

        // Track labs per day per section
        if let Some(c) = course {
            if c.subject_type == "Lab" {
                let lab_key = format!("{}_{}", class.section_id, class.day);
                *section_day_labs.entry(lab_key).or_insert(0) += 1;
            }
        }
    }

    // --- AGGREGATE CONSTRAINTS ---

    // 12. Equal Lab/Theory hours across sections (HARD CONSTRAINT)
    if !section_lab_hours.is_empty() {
        let lab_values: Vec<u32> = section_lab_hours.values().copied().collect();
        let avg_lab = lab_values.iter().sum::<u32>() as f64 / lab_values.len() as f64;
        for &val in &lab_values {
            let deviation = (val as f64 - avg_lab).abs();
            score -= deviation * 200.0; // Hard constraint
        }
    }
    if !section_theory_hours.is_empty() {
        let theory_values: Vec<u32> = section_theory_hours.values().copied().collect();
        let avg_theory = theory_values.iter().sum::<u32>() as f64 / theory_values.len() as f64;
        for &val in &theory_values {
            let deviation = (val as f64 - avg_theory).abs();
            score -= deviation * 200.0; // Hard constraint
        }
    }

    // 13. Lab contiguity: Lab courses (duration >= 2) must be on consecutive non-break slots
    // Group lab assignments by (section, course, day)
    let mut lab_groups: HashMap<String, Vec<u8>> = HashMap::new();
    for class in &schedule.classes {
        if let Some(c) = courses.get(&class.course_id) {
            if c.subject_type == "Lab" && c.duration >= 2 {
                let key = format!("{}_{}_{}", class.section_id, class.course_id, class.day);
                lab_groups.entry(key).or_default().push(class.slot_id);
            }
        }
    }
    for (_key, mut slot_ids) in lab_groups {
        slot_ids.sort();
        if slot_ids.len() >= 2 {
            for i in 0..slot_ids.len() - 1 {
                let s1 = slot_ids[i];
                let s2 = slot_ids[i + 1];
                // Check if they form a valid consecutive pair
                let is_valid = consecutive_pairs.iter().any(|(a, b, _)| *a == s1 && *b == s2);
                if !is_valid {
                    score -= 500.0; // Heavy penalty for non-contiguous lab
                }
            }
        }
    }

    // 14. CIR HARD CONSTRAINT: All 3 CIR classes MUST be on the SAME DAY + consecutive slots
    for (_section_id, mut cir_assigns) in cir_assignments {
        if cir_assigns.len() != 3 {
            score -= 1000.0; // HARD: Missing CIR classes
        } else {
            // Check they're all on the same day
            let days: Vec<&String> = cir_assigns.iter().map(|(_, d, _)| d).collect();
            if days[0] != days[1] || days[1] != days[2] {
                score -= 1000.0; // HARD: CIR not on same day
            }
            
            // Check consecutive slots
            cir_assigns.sort_by_key(|(sid, _, _)| *sid);
            let s1 = cir_assigns[0].0;
            let s2 = cir_assigns[1].0;
            let s3 = cir_assigns[2].0;
            
            // Check if s1->s2 and s2->s3 are consecutive non-break pairs
            let pair_12 = consecutive_pairs.iter().any(|(a, b, _)| *a == s1 && *b == s2);
            let pair_23 = consecutive_pairs.iter().any(|(a, b, _)| *a == s2 && *b == s3);
            
            if !pair_12 || !pair_23 {
                score -= 1000.0; // HARD: CIR slots not contiguous
            }

            // Check ordering: Verbal -> Technical -> Aptitude
            let expected_order = ["Verbal", "Technical", "Aptitude"];
            for (i, (_, _, sub_type)) in cir_assigns.iter().enumerate() {
                if sub_type != expected_order[i] {
                    score -= 500.0; // Strong penalty for wrong CIR order
                }
            }
        }
    }

    // 15. Mentor priority: Faculty teaching their mentored section gets a bonus
    for class in &schedule.classes {
        if let Some(p) = faculty.get(&class.faculty_id) {
            if let Some(ref mentor_sec) = p.mentor_section {
                if mentor_sec == &class.section_id {
                    score += 20.0; // Bonus for mentor teaching their section
                }
            }
        }
    }

    // 16. Minimum weekly hours per course: Each course needs min_weekly_hours assignments per section
    for course in &input.courses {
        if course.subject_type == "CIR" { continue; } // CIR has its own constraint
        for section in &input.sections {
            let cs_key = format!("{}_{}", course.id, section.id);
            let count = course_section_count.get(&cs_key).copied().unwrap_or(0);
            if count < course.min_weekly_hours as u32 {
                let deficit = course.min_weekly_hours as u32 - count;
                score -= deficit as f64 * 25.0;
            }
        }
    }

    // 17. Faculty max load
    for (fid, load) in &faculty_load {
        if let Some(p) = faculty.get(fid) {
            if *load > p.max_load {
                score -= (*load - p.max_load) as f64 * 30.0;
            }
        }
    }

    // 18. WORKLOAD OPTIMIZATION: Consecutive class compaction
    // Reward sections that have classes packed together with minimal gaps
    // Penalize gaps between classes on the same day
    for (_key, mut day_slot_ids) in section_day_slots.clone() {
        if day_slot_ids.len() < 2 { continue; }
        day_slot_ids.sort();
        
        // Count gaps between consecutive assigned slots
        for i in 0..day_slot_ids.len() - 1 {
            let current = day_slot_ids[i];
            let next = day_slot_ids[i + 1];
            let gap = next as i32 - current as i32;
            
            if gap == 1 {
                // Perfectly consecutive — bonus!
                score += 15.0;
            } else if gap == 2 {
                // One slot gap (could be a break) — small penalty
                score -= 20.0;
            } else if gap > 2 {
                // Large gap — heavy penalty for workload optimization
                score -= (gap as f64 - 1.0) * 80.0;
            }
        }
    }

    // 19. LATE SLOT PENALTY: Discourage slots 11 and 12 (per-day IDs)
    // Per-day slot ID = ((global_slot_id - 1) % 13) + 1
    for class in &schedule.classes {
        let per_day_slot = ((class.slot_id as u32 - 1) % 13) + 1;
        if per_day_slot == 12 {
            score -= 150.0; // Slot 12 — very heavily penalized
        } else if per_day_slot == 11 {
            score -= 120.0; // Slot 11 — heavily penalized
        } else if per_day_slot == 10 {
            score -= 40.0;  // Slot 10 — mild penalty
        }
    }

    // 20. MAX 1 LAB PER DAY PER SECTION (lab = 2 periods, so count > 2 means multiple labs)
    for (_key, lab_slot_count) in &section_day_labs {
        if *lab_slot_count > 2 {
            score -= 500.0; // Hard constraint: only 1 lab per day
        }
    }

    // 21. LABS MUST BE EXACTLY 2 PERIODS - penalize single-period labs
    let mut lab_section_day_count: HashMap<String, u32> = HashMap::new();
    for class in &schedule.classes {
        if let Some(c) = courses.get(&class.course_id) {
            if c.subject_type == "Lab" && c.duration >= 2 {
                let key = format!("{}_{}_{}", class.section_id, class.course_id, class.day);
                *lab_section_day_count.entry(key).or_insert(0) += 1;
            }
        }
    }
    for (_key, count) in &lab_section_day_count {
        if *count == 1 {
            score -= 500.0; // Single-period lab is WRONG - must be 2 consecutive
        }
    }

    // 22. Lab must have a lab assistant assigned
    for class in &schedule.classes {
        if let Some(c) = courses.get(&class.course_id) {
            if c.subject_type == "Lab" && class.lab_assistant_id.is_none() {
                score -= 100.0; // Penalize lab without assistant
            }
        }
    }

    // 23. EARLY START CONSTRAINT: Classes should fill earliest slots first
    // For each section on each day, penalize classes in later slots when earlier slots are free
    // This uses the per-day slot position (1-13), where lower = earlier
    for (_key, day_slot_ids) in &section_day_slots {
        if day_slot_ids.is_empty() { continue; }
        
        for &slot_id in day_slot_ids {
            // Convert global slot to per-day position (1-13)
            let per_day = ((slot_id as u32 - 1) % 13) + 1;
            
            // Skip break slots (4 and 8)
            if per_day == 4 || per_day == 8 { continue; }
            
            // Map to teaching order: 1,2,3,5,6,7,9,10,11,12,13 → order 1-10
            let teaching_order = match per_day {
                1 => 1, 2 => 2, 3 => 3,
                5 => 4, 6 => 5, 7 => 6,
                9 => 7, 10 => 8, 11 => 9, 12 => 10, 13 => 11,
                _ => 6, // fallback
            };
            
            // Reward early slots, penalize late slots progressively
            if teaching_order <= 3 {
                score += 25.0;  // Strong bonus for first 3 morning slots
            } else if teaching_order <= 6 {
                score += 10.0;  // Mild bonus for mid-day slots
            } else if teaching_order <= 8 {
                score -= 15.0;  // Mild penalty for afternoon
            } else {
                score -= 60.0;  // Heavy penalty for late afternoon (slots 9-11)
            }
        }
    }

    score
}

// ==========================================
// SELECTION (Tournament)
// ==========================================
fn select_parent(population: &Vec<Schedule>) -> &Schedule {
    let mut rng = thread_rng();
    let p1 = population.choose(&mut rng).unwrap();
    let p2 = population.choose(&mut rng).unwrap();
    
    if p1.fitness > p2.fitness { p1 } else { p2 }
}

// ==========================================
// CROSSOVER
// ==========================================
fn crossover(parent_a: &Schedule, parent_b: &Schedule) -> (Schedule, Schedule) {
    let split = parent_a.classes.len() / 2;
    
    let mut child1_classes = parent_a.classes.clone();
    let mut child2_classes = parent_b.classes.clone();

    let min_len = parent_a.classes.len().min(parent_b.classes.len());
    for i in split..min_len {
        child1_classes[i] = parent_b.classes[i].clone();
        child2_classes[i] = parent_a.classes[i].clone();
    }

    (
        Schedule { fitness: -1_000_000.0, classes: child1_classes },
        Schedule { fitness: -1_000_000.0, classes: child2_classes }
    )
}

// ==========================================
// MUTATION (Improved for new constraints)
// ==========================================
fn mutate(
    schedule: &mut Schedule, 
    input: &InputData, 
    consecutive_pairs: &[(u8, u8, String)],
    consecutive_triples: &[(u8, u8, u8, String)]
) {
    let mut rng = thread_rng();
    if rng.r#gen::<f64>() < MUTATION_RATE {
        if let Some(class) = schedule.classes.choose_mut(&mut rng) {
            let course = input.courses.iter().find(|c| c.id == class.course_id);
            
            if let Some(c) = course {
                if c.subject_type == "Lab" && c.duration >= 2 {
                    // For lab: mutate to a new consecutive pair
                    if !consecutive_pairs.is_empty() {
                        let pair = consecutive_pairs.choose(&mut rng).unwrap();
                        let lab_rooms: Vec<&Room> = input.rooms.iter()
                            .filter(|r| r.r#type == "Lab")
                            .collect();
                        if let Some(room) = lab_rooms.choose(&mut rng) {
                            class.slot_id = pair.0;
                            class.day = pair.2.clone();
                            class.room_id = room.id.clone();
                        }
                    }
                } else if c.subject_type == "CIR" {
                    // For CIR: mutate to a new triple slot
                    if !consecutive_triples.is_empty() {
                        let triple = consecutive_triples.choose(&mut rng).unwrap();
                        // Find the CIR sub-type position
                        let pos = match c.cir_sub_type.as_deref() {
                            Some("Verbal") => 0,
                            Some("Technical") => 1,
                            Some("Aptitude") => 2,
                            _ => 0,
                        };
                        let slot_ids = [triple.0, triple.1, triple.2];
                        class.slot_id = slot_ids[pos];
                        class.day = triple.3.clone();
                    }
                } else {
                    // Theory: standard mutation
                    let non_break_slots: Vec<&TimeSlot> = input.slots.iter()
                        .filter(|s| !s.is_break)
                        .collect();
                    if let Some(new_slot) = non_break_slots.choose(&mut rng) {
                        let lecture_rooms: Vec<&Room> = input.rooms.iter()
                            .filter(|r| r.r#type == "Lecture")
                            .collect();
                        if let Some(room) = lecture_rooms.choose(&mut rng) {
                            class.slot_id = new_slot.id;
                            class.day = new_slot.day.clone();
                            class.room_id = room.id.clone();
                        }
                    }
                }
            }
        }
    }
}