use serde::{Deserialize, Serialize};

// ==========================================
// 1. INPUT DATA (Received from Node.js)
// ==========================================

#[derive(Debug, Clone, Deserialize)]
pub struct InputData {
    pub rooms: Vec<Room>,
    pub faculty: Vec<Faculty>,
    pub courses: Vec<Course>,
    pub sections: Vec<Section>,
    pub slots: Vec<TimeSlot>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Room {
    pub id: String,
    pub capacity: u32,
    pub r#type: String,      // "Lecture" or "Lab" [cite: 54]
    pub building: String,    // For travel time calculation (US 13) [cite: 67]
    pub is_accessible: bool, // "Ground floor" or "Elevator" for mobility issues (US 11) 
}

#[derive(Debug, Clone, Deserialize)]
pub struct Faculty {
    pub id: String,
    pub name: String,
    pub rank: String,             // "Professor", "Adjunct" for Max Hours logic (US 1) 
    pub max_load: u32,            // Maximum teaching hours per week (US 1) 
    pub contracted_days: Vec<String>, // e.g., ["Monday", "Tuesday"] for Adjuncts (US 8) [cite: 20]
    
    pub unavailable: Vec<u8>,     // List of blocked Slot IDs (US 5) [cite: 13]
    pub preferred_slots: Vec<u8>, // List of preferred Slot IDs (US 12 - Sprint 0) 
    
    pub expertise: Vec<String>,   // Keywords like "Network Security" (US 4) 
    pub preferred_courses: Vec<String>, // List of Course IDs they want to teach (US 2) 
    pub teaching_history: Vec<String>,  // List of Course IDs previously taught (US 14 - New Prep) 
}

#[derive(Debug, Clone, Deserialize)]
pub struct Course {
    pub id: String,
    pub name: String,
    pub duration: u8,           // 1 = 1 hour, 3 = 3 hour block (US 9 - Fatigue Risk) [cite: 23]
    pub subject_type: String,   // "Theory" or "Lab" (US 6 - Sprint 0) [cite: 53]
    pub faculty_id: Option<String>, // Pre-assigned faculty (US 10 - Manual Override/Swap) [cite: 27]
    
    // For handling Electives that happen at the same time:
    pub parallel_group: Option<String>, // If two courses share this ID, they can be scheduled together (US 7 - Sprint 0) 
}

#[derive(Debug, Clone, Deserialize)]
pub struct Section {
    pub id: String,
    pub size: u32,             // To check against Room Capacity (US 2 - Sprint 0) [cite: 43]
    pub year: String,          // e.g., "3rd Year"
    pub requires_access: bool, // True if batch has students with mobility issues (US 11 - Sprint 0) 
}

#[derive(Debug, Clone, Deserialize)]
pub struct TimeSlot {
    pub id: u8,
    pub day: String,   // "Monday", etc.
    pub start_time: String, // "09:00"
    pub end_time: String,   // "10:00"
    pub is_break: bool,     // True for Lunch/Interval (US 5 - Sprint 0) [cite: 51]
}

// ==========================================
// 2. OUTPUT DATA (The Solution)
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub fitness: f64,
    pub classes: Vec<ClassAssignment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassAssignment {
    pub section_id: String,
    pub course_id: String,
    pub faculty_id: String,
    pub room_id: String,
    pub slot_id: u8,
    pub day: String,
}