use crate::mesh::attribute::{ObjectBuf, VertexEntry, VertexEntryBuf};
use crate::mesh::buf::{Color, ExtendTriangleBuf, Vertex};
use crate::water::shapes::DynamicResolutionMesh;
use nalgebra::{distance_squared, Matrix4, Point2, Point3, Vector2};
use std::mem;
use wasm_bindgen::prelude::wasm_bindgen;

mod mesh;
mod water;

use crate::mesh::perlin;

/// Gets a raw mesh representing water in a scene.
///
/// Has interleaved position (floatx3), and color (floatx3) attributes.
#[wasm_bindgen]
pub fn water_buf() -> Vec<f32> {
    let mut vertex_entry_buf = VertexEntryBuf::default();
    let transform = Matrix4::identity();
    let mut object_buf = ObjectBuf {
        buf: &mut vertex_entry_buf,
        transform: &transform,
    };
    let center = Point2::new(0.0, 0.0);
    let down = Vector2::new(100.0, 0.0);
    let right = Vector2::new(0.0, 100.0);
    let top_left = center - down.scale(0.5) - right.scale(0.5);
    let divide_height = 10;
    let divide_width = 10;

    let mut get_color = |point: &Point2<f32>| -> Color { Color::new([0.2; 3]) };
    let mut get_height = |point: &Point2<f32>| -> f32 {
        let point = point.map(|x| x * 300.0);
        perlin::get(&Point3::new(point[0], point[1], 0.0), "water height")
    };

    let mut divide = |point: &Point2<f32>| -> (usize, usize) {
        let distance = distance_squared(&point, &Point2::origin());
        match distance {
            ..100.0 => (100, 100),
            ..250.0 => (10, 10),
            _ => (1, 1),
        }
    };

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

macro_rules! define_attributes {
    ($size:ident, $offset:ident, $attribute:ident) => {
        #[wasm_bindgen]
        pub fn $size() -> usize {
            let size_example = VertexEntry::default();
            size_example.$attribute.len()
        }

        #[wasm_bindgen]
        pub fn $offset() -> usize {
            mem::offset_of!(VertexEntry, $attribute) / mem::size_of::<f32>()
        }
    };
}

#[wasm_bindgen]
pub fn water_buf_stride_floats() -> usize {
    mem::size_of::<VertexEntry>() / mem::size_of::<f32>()
}

define_attributes! { water_buf_position_size, water_buf_position_offset, position}
define_attributes! { water_buf_color_size, water_buf_color_offset, color}
