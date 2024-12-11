use nalgebra::{Point3};
use noise::NoiseFn;

#[derive(Default)]
pub struct Perlin3d {
    perlin: noise::Perlin,
}

impl Perlin3d {
    pub fn get(&self, point: &Point3<f32>, _why: &str) -> f32 {
        let point: [f64; 3] = point.cast::<f64>().into();
        self.perlin.get(point) as f32
    }
}
