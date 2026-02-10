use crate::models::{InputData, Schedule, ClassAssignment, Room, Faculty, Section, TimeSlot};
use rand::prelude::*;
use rayon::prelude::*;
use std::collections::HashMap;

// ==========================================
// CONFIGURATION
// ==========================================
const POPULATION_SIZE: usize = 100;
const MAX_GENERATIONS: usize = 500;
const MUTATION_RATE: f64 = 0.02;
const ELITISM_COUNT: usize = 2;
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

    // 2. Initialize Population
    // CRITICAL FIX: Init fitness to VERY LOW number so uncalculated schedules never win
    let mut population: Vec<Schedule> = (0..POPULATION_SIZE)
        .into_par_iter()
        .map(|_| generate_random_schedule(&input))
        .collect();

    // 3. Evolution Loop
    // FIX: Renamed 'gen' to 'generation' to avoid keyword conflict
    for generation in 0..MAX_GENERATIONS {
        
        // Calculate Fitness in Parallel
        population.par_iter_mut().for_each(|sched| {
            sched.fitness = calculate_fitness(sched, &input, &room_map, &faculty_map, &section_map, &slot_map);
        });

        // Sort by fitness (Higher is better)
        population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());

        // DEBUG LOG: Print progress every 50 generations to Terminal (stderr)
        if generation % 50 == 0 {
            eprintln!("Generation {}: Best Score = {:.1}", generation, population[0].fitness);
        }

        // Check for perfect solution
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
            
            mutate(&mut child_1, &input);
            mutate(&mut child_2, &input);

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
// CORE ALGORITHMS
// ==========================================

fn generate_random_schedule(input: &InputData) -> Schedule {
    let mut classes = Vec::new();
    let mut rng = thread_rng();

    for course in &input.courses {
        // Iterate sections to assign courses
        for section in &input.sections {
            let random_room = input.rooms.choose(&mut rng).unwrap();
            
            let random_faculty = if let Some(fid) = &course.faculty_id {
                input.faculty.iter().find(|f| f.id == *fid).unwrap()
            } else {
                input.faculty.choose(&mut rng).unwrap()
            };
            
            let random_slot = input.slots.choose(&mut rng).unwrap();

            classes.push(ClassAssignment {
                course_id: course.id.clone(),
                section_id: section.id.clone(),
                faculty_id: random_faculty.id.clone(),
                room_id: random_room.id.clone(),
                slot_id: random_slot.id,
                day: random_slot.day.clone(),
            });
        }
    }

    Schedule { fitness: -1_000_000.0, classes }
}

fn calculate_fitness(
    schedule: &Schedule,
    input: &InputData,
    rooms: &HashMap<String, Room>,
    faculty: &HashMap<String, Faculty>,
    sections: &HashMap<String, Section>,
    slots: &HashMap<u8, TimeSlot>
) -> f64 {
    let mut score = BASE_SCORE; 
    
    // Maps to track overlaps: key = "Day_Slot"
    let mut room_occupancy: HashMap<String, String> = HashMap::new(); 
    let mut faculty_occupancy: HashMap<String, String> = HashMap::new(); 
    let mut section_occupancy: HashMap<String, String> = HashMap::new(); 

    for class in &schedule.classes {
        let key_base = format!("{}_{}", class.day, class.slot_id);
        
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
            if let Some(course) = input.courses.iter().find(|c| c.id == class.course_id) {
                if course.subject_type == "Lab" && room.r#type != "Lab" {
                    score -= 50.0;
                }
            }
        }

        // 7. Faculty Availability
        if let Some(prof) = faculty.get(&class.faculty_id) {
            if prof.unavailable.contains(&class.slot_id) {
                score -= 50.0;
            }
            // 8. Contract Days
            if !prof.contracted_days.is_empty() && !prof.contracted_days.contains(&class.day) {
                score -= 50.0;
            }
        }

        // 9. Break Times
        if let Some(slot) = slots.get(&class.slot_id) {
            if slot.is_break {
                score -= 100.0; 
            }
        }
    }

    score
}

fn select_parent(population: &Vec<Schedule>) -> &Schedule {
    let mut rng = thread_rng();
    let p1 = population.choose(&mut rng).unwrap();
    let p2 = population.choose(&mut rng).unwrap();
    
    if p1.fitness > p2.fitness { p1 } else { p2 }
}

fn crossover(parent_a: &Schedule, parent_b: &Schedule) -> (Schedule, Schedule) {
    let split = parent_a.classes.len() / 2;
    
    let mut child1_classes = parent_a.classes.clone();
    let mut child2_classes = parent_b.classes.clone();

    for i in split..parent_a.classes.len() {
        child1_classes[i] = parent_b.classes[i].clone();
        child2_classes[i] = parent_a.classes[i].clone();
    }

    (
        Schedule { fitness: -1_000_000.0, classes: child1_classes },
        Schedule { fitness: -1_000_000.0, classes: child2_classes }
    )
}

fn mutate(schedule: &mut Schedule, input: &InputData) {
    let mut rng = thread_rng();
    // Using r#gen to escape the keyword is fine, but renaming the variable is cleaner.
    if rng.r#gen::<f64>() < MUTATION_RATE {
        if let Some(class) = schedule.classes.choose_mut(&mut rng) {
            let new_slot = input.slots.choose(&mut rng).unwrap();
            let new_room = input.rooms.choose(&mut rng).unwrap();
            
            class.slot_id = new_slot.id;
            class.day = new_slot.day.clone();
            class.room_id = new_room.id.clone();
        }
    }
}