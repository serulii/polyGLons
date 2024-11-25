use nalgebra::{Point2, Point3, Unit, Vector3};
use std::f32::consts::FRAC_PI_2;
use std::f32::consts::{PI, TAU};
use std::mem;
use wasm_bindgen::prelude::*;

use crate::mesh::buf::{ExtendTriangleBuf, Triangle, TriangleBuf, Color, Vertex};

pub struct Water {
    
}

impl ExtendTriangleBuf for Water {
    fn write_into<B: TriangleBuf>(&self, buf: &mut B) {
    }
}

struct Tile<F, G> {
    top_left: Point2<f32>,
    top_right: Point2<f32>,
    bottom_left: Point2<f32>,
    bottom_right: Point2<f32>,
    get_height: F,
    get_color: G,
}

impl<F, G> ExtendTriangleBuf for Tile<F, G>
where
    F: Fn(&'_ Point2<f32>) -> f32,
    G: Fn(&'_ Point2<f32>) -> Color,
{
    fn write_into<B: TriangleBuf>(&self, buf: &mut B) {
        let triangle = [
            self.bottom_left,
            self.bottom_right,
            self.top_left,
        ];
        let triangle = [
            self.top_right,
            self.top_left,
            self.bottom_right,
        ];
    }
}
