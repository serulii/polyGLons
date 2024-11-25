use bytemuck::{allocation::cast_vec, Pod, Zeroable};
use nalgebra::{Matrix4, Unit};

use crate::mesh::buf::{Triangle, TriangleBuf};

#[derive(Default, Debug, Clone)]
pub struct VertexEntryBuf {
    buf: Vec<VertexEntry>,
}

impl VertexEntryBuf {
    pub fn vertex_count(&self) -> usize {
        self.buf.len()
    }

    pub fn into_raw_data(self) -> Vec<f32> {
        cast_vec(self.buf)
    }
}

#[derive(Default, Debug, Copy, Clone, Pod, Zeroable)]
#[repr(C)]
pub struct VertexEntry {
    pub position: [f32; 3],
    pub color: [f32; 3],
}

pub struct ObjectBuf<'a> {
    pub buf: &'a mut VertexEntryBuf,
    pub transform: &'a Matrix4<f32>,
}

impl TriangleBuf for ObjectBuf<'_> {
    fn push_triangle(&mut self, triangle: &Triangle) {
        self.buf
            .buf
            .extend(triangle.iter().map(|vertex| VertexEntry {
                position: self.transform.transform_point(&vertex.point).into(),
                color: vertex.color.into_rgb_array(),
            }));
    }
}
