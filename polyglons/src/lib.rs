use wasm_bindgen::prelude::wasm_bindgen;

/// This gets a nice number.
#[wasm_bindgen]
pub fn get_number() -> i32 {
    5
}
