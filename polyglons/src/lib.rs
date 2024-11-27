use crate::mesh::buf::ExtendTileBuf;
use crate::mesh::buf::{Tile, TileBuf};
use crate::water::shapes::Mesh;
use bytemuck::{cast_vec, Pod, Zeroable};
use nalgebra::{distance, Point2, Point3, Vector2, Vector3};
use rustc_hash::FxHashMap;
use std::mem;
use wasm_bindgen::prelude::wasm_bindgen;

mod mesh;
mod water;

use crate::mesh::perlin::Perlin3d;

/// Gets a raw mesh representing water in a scene.
///
/// Has interleaved position (floatx3), and color (floatx3) attributes.
#[wasm_bindgen]
pub fn water_buf(time_millis: f32) -> Vec<f32> {
    let max_level_of_detail = 5; // logarithmic units
    let water_radius = 30.0;
    let block_count = 10;

    // have 2 * water_radius == scale_factor * block_count * 2 ^ max_level_of_detail
    // so scene_pos = water_pos * scale_factor - water_radius
    // and water_pos = (scene_pos + water_radius) / scale_factor
    let scale_factor = 2.0 * water_radius / (block_count * 2i32.pow(max_level_of_detail)) as f32;

    let get_level_of_detail = |water_point: &Point2<i32>| -> u32 {
        let scene_point = water_point.map(|x| x as f32 * scale_factor - water_radius);
        match distance(&scene_point, &Point2::origin()) / water_radius {
            ..0.1 => 5,
            ..0.2 => 4,
            ..0.5 => 3,
            ..0.7 => 2,
            _ => 0,
        }
    };
    let perlin = Perlin3d::default();
    let get_position = |water_point: &Point2<i32>| -> Point3<f32> {
        let scene_point = water_point.map(|x| x as f32 * scale_factor - water_radius);
        let perlin_point = scene_point.coords.scale(0.3);
        let height = perlin.get(
            &Point3::new(perlin_point.x, perlin_point.y, time_millis / 3e3),
            "height",
        );
        Point3::new(scene_point[0], height * 2.0, scene_point[1])
    };
    let get_color = |scene_point: &Point3<f32>| -> Color {
        let perlin_point = scene_point.coords.scale(0.3);
        let alpha = perlin.get(
            &(Point3::new(perlin_point.x, perlin_point.z, time_millis / 3e3)
                - Vector3::from_element(1e3)),
            "color",
        );
        let green = Vector3::from([0.0, 0.5, 0.8]);
        let blue = Vector3::from([0.0, 0.0, 0.8]);
        let color = blue.lerp(&green, alpha);
        Color { rgb: color.into() }
    };

    let buf = Vec::default();
    let fixup_height = FxHashMap::default();
    let mut buf = Buf {
        buf,
        get_color,
        get_position,
        fixup_height,
    };

    let top_left = Point2::new(0, 0);
    Mesh {
        top_left,
        block_count,
        get_level_of_detail,
        max_level_of_detail,
    }
    .write_into(&mut buf);

    buf.into_raw_data()
}

#[derive(Copy, Clone, Debug)]
pub struct Color {
    pub rgb: Point3<f32>,
}

impl Color {
    pub fn new(rgb: [f32; 3]) -> Self {
        Self { rgb: rgb.into() }
    }

    pub fn into_rgb_array(self) -> [f32; 3] {
        self.rgb.into()
    }
}

#[derive(Default, Debug, Copy, Clone, Pod, Zeroable)]
#[repr(C)]
pub struct VertexEntry {
    pub position: [f32; 3],
    pub color: [f32; 3],
}

pub struct Buf<F, G> {
    pub buf: Vec<VertexEntry>,
    pub fixup_height: FxHashMap<Point2<i32>, Point3<f32>>,
    pub get_position: F,
    pub get_color: G,
}

impl<F, G> Buf<F, G> {
    pub fn into_raw_data(self) -> Vec<f32> {
        cast_vec(self.buf)
    }
}

impl<F, G> TileBuf for Buf<F, G>
where
    F: FnMut(&Point2<i32>) -> Point3<f32>,
    G: FnMut(&Point3<f32>) -> Color,
{
    fn push_tile(&mut self, tile: &Tile) {
        let Tile { top_left, width } = *tile;

        let down = Vector2::<i32>::y_axis().into_inner();
        let right = Vector2::<i32>::x_axis().into_inner();
        let bottom_right = top_left + scale(&down, width) + scale(&right, width);

        let mut get_position = |point: Point2<i32>| -> Point3<f32> {
            self.fixup_height
                .get(&point)
                .copied()
                .unwrap_or_else(|| (self.get_position)(&point))
        };
        let fbottom_left = get_position(top_left + scale(&down, width));
        let ftop_right = get_position(top_left + scale(&right, width));
        let fbottom_right = get_position(bottom_right);
        let ftop_left = get_position(top_left);

        for d in 0..=width {
            let df = d as f32 / width as f32;

            let point = top_left + scale(&down, d);
            self.fixup_height
                .insert(point, ftop_left.lerp(&fbottom_left, df));

            let point = top_left + scale(&right, d);
            self.fixup_height
                .insert(point, ftop_left.lerp(&ftop_right, df));

            let point = bottom_right - scale(&right, d);
            self.fixup_height
                .insert(point, fbottom_right.lerp(&fbottom_left, df));

            let point = bottom_right - scale(&down, d);
            self.fixup_height
                .insert(point, fbottom_right.lerp(&ftop_right, df));
        }

        let color = (self.get_color)(&ftop_left).into_rgb_array();
        let vertices = [
            fbottom_right,
            ftop_left,
            fbottom_left,
            ftop_left,
            fbottom_right,
            ftop_right,
        ];
        self.buf.extend(vertices.into_iter().map(|position| {
            let position = position.coords.into();
            VertexEntry { position, color }
        }));
    }
}

#[inline]
fn scale(p: &Vector2<i32>, by: i32) -> Vector2<i32> {
    p.map(|x| x * by)
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
