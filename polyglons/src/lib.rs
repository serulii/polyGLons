use wasm_bindgen::prelude::wasm_bindgen;
use nalgebra::{Vector3};

mod water;
mod mesh;

/// This gets a nice number.
#[wasm_bindgen]
pub fn get_number() -> i32 {
    5
}


