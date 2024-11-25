use nalgebra::{Point3, Unit, Vector3};

pub trait TriangleBuf {
    fn push_triangle(&mut self, triangle: &Triangle);
}

pub trait ExtendTriangleBuf {
    fn write_into<B: TriangleBuf>(&mut self, buf: &mut B);
}

pub struct Triangle {
    vertices: [Vertex; 3],
}

impl Triangle {
    pub fn from_array(vertices: [Vertex; 3]) -> Self {
        Self { vertices }
    }

    pub fn new(v1: Vertex, v2: Vertex, v3: Vertex) -> Self {
        Self {
            vertices: [v1, v2, v3],
        }
    }

    pub fn iter(&self) -> impl Iterator<Item = &Vertex> {
        self.vertices.iter()
    }
}

impl ExtendTriangleBuf for Triangle {
    fn write_into<B: TriangleBuf>(&mut self, buf: &mut B) {
        buf.push_triangle(self);
    }
}

pub struct Vertex {
    pub point: Point3<f32>,
    pub color: Color,
}

#[derive(Copy, Clone, Debug)]
pub struct Color {
    pub rgb: [f32; 3],
}

impl Color {
    pub fn new(rgb: [f32; 3]) -> Self {
        Self { rgb }
    }

    pub fn into_rgb_array(self) -> [f32; 3] {
        self.rgb
    }
}
