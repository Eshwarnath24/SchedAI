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
    pub r#type: String,      // "Lecture" or "Lab"
    pub building: String,
    pub is_accessible: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Faculty {
    pub id: String,
    pub name: String,
    pub rank: String,
    pub max_load: u32,
    pub contracted_days: Vec<String>,
    
    pub unavailable: Vec<u8>,
    pub preferred_slots: Vec<u8>,
    
    pub expertise: Vec<String>,
    pub preferred_courses: Vec<String>,
    pub teaching_history: Vec<String>,

    // New fields
    pub role: String,                        // "Faculty", "LabAssistant"
    pub mentor_section: Option<String>,      // Section ID this faculty mentors
    pub is_cir_only: bool,                   // True if this teacher ONLY teaches CIR
    pub cir_sub_type: Option<String>,        // "Verbal", "Technical", "Aptitude"
}

#[derive(Debug, Clone, Deserialize)]
pub struct Course {
    pub id: String,
    pub name: String,
    pub duration: u8,
    pub subject_type: String,   // "Theory", "Lab", or "CIR"
    pub faculty_id: Option<String>,
    pub parallel_group: Option<String>,
    
    // New fields
    pub cir_sub_type: Option<String>,   // "Verbal", "Technical", "Aptitude"
    pub min_weekly_hours: u8,           // target hrs/week (60hrs/20wks = 3)
    pub lab_assistant_id: Option<String>, // designated lab assistant
}

#[derive(Debug, Clone, Deserialize)]
pub struct Section {
    pub id: String,
    pub size: u32,
    pub year: String,
    pub requires_access: bool,
    
    // New field
    pub mentor_id: Option<String>,  // Faculty ID of the mentor
}

#[derive(Debug, Clone, Deserialize)]
pub struct TimeSlot {
    pub id: u8,
    pub day: String,
    pub start_time: String,
    pub end_time: String,
    pub is_break: bool,
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lab_assistant_id: Option<String>,
}