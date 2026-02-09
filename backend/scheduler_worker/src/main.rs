mod models;
mod genetic;

use std::io::{self, Read}; // Changed 'BufRead' to 'Read'
use serde_json::{json, Error};
use models::InputData;

fn main() {
    let stdin = io::stdin();
    let mut handle = stdin.lock();
    let mut input_string = String::new(); // Changed variable name for clarity

    // 1. Read ENTIRE Input (not just one line)
    // read_to_string reads until the input stream closes (EOF)
    match handle.read_to_string(&mut input_string) {
        Ok(_) => {
            // 2. Parse the complete JSON string
            let parse_result: Result<InputData, Error> = serde_json::from_str(&input_string);

            match parse_result {
                Ok(data) => {
                    // 3. Solve using Genetic Algorithm
                    let solution = genetic::solve(data);
                    
                    // 4. Output Result as single-line JSON
                    println!("{}", serde_json::to_string(&solution).unwrap());
                }
                Err(e) => {
                    let error_msg = json!({ 
                        "error": "Failed to parse input data", 
                        "details": format!("{}", e) 
                    });
                    eprintln!("{}", error_msg); 
                }
            }
        }
        Err(e) => {
            eprintln!("{}", json!({ "error": "Failed to read stdin", "details": e.to_string() }));
        }
    }
}