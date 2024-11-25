use crate::mesh::attribute::{ObjectBuf, VertexEntryBuf};
use crate::mesh::buf::{Color, ExtendTriangleBuf, Vertex};
use crate::water::shapes::DynamicResolutionMesh;
use nalgebra::{Matrix4, Point2, Vector2};
use wasm_bindgen::prelude::wasm_bindgen;

mod mesh;
mod water;

/// Gets a raw mesh representing water in a scene.
///
/// Has interleaved position (floatx3), normal (floatx3), and color (floatx3) attributes.
#[wasm_bindgen]
pub fn get_water_mesh() -> Vec<u8> {
    let mut vertex_entry_buf = VertexEntryBuf::default();
    let transform = Matrix4::identity();
    let mut object_buf = ObjectBuf {
        buf: &mut vertex_entry_buf,
        transform: &transform,
    };
    let top_left = Point2::new(-10.0, -10.0);
    let down = Vector2::new(10.0, 0.0);
    let right = Vector2::new(0.0, 10.0);
    let divide_height = 100;
    let divide_width = 100;

    let mut get_color = |point: &Point2<f32>| -> Color { Color::new([1.0; 3]) };
    let mut get_height = |point: &Point2<f32>| -> f32 { 5.0 };

    let mut divide = |point: &Point2<f32>| -> (usize, usize) { (1, 1) };

    DynamicResolutionMesh {
        top_left,
        down,
        right,
        divide_height,
        divide_width,
        divide,
        get_height,
        get_color,
    }
    .write_into(&mut object_buf);

    vertex_entry_buf.into_raw_data()
}
