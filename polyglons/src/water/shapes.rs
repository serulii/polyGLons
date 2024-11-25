use nalgebra::{Point2, Point3, Unit, Vector2, Vector3};

use crate::mesh::buf::{Color, ExtendTriangleBuf, Triangle, TriangleBuf, Vertex};

pub struct DynamicResolutionMesh<F, G, H> {
    pub top_left: Point2<f32>,
    pub down: Vector2<f32>,
    pub right: Vector2<f32>,
    pub divide_height: usize,
    pub divide_width: usize,
    pub divide: H,
    pub get_height: F,
    pub get_color: G,
}

impl<F, G, H> ExtendTriangleBuf for DynamicResolutionMesh<F, G, H>
where
    F: FnMut(&'_ Point2<f32>) -> f32,
    G: FnMut(&'_ Point2<f32>) -> Color,
    H: FnMut(&'_ Point2<f32>) -> (usize, usize),
{
    fn write_into<B: TriangleBuf>(&mut self, buf: &mut B) {
        let step_height = self.down.scale(1.0 / self.divide_height as f32);
        let step_width = self.down.scale(1.0 / self.divide_width as f32);
        for r in 0..self.divide_height {
            for c in 0..self.divide_width {
                let top_left =
                    self.top_left + step_height.scale(r as f32) + step_width.scale(c as f32);
                let (resolution_height, resolution_width) = (self.divide)(&top_left);
                FlatMesh {
                    top_left,
                    down: step_height,
                    right: step_width,
                    resolution_height,
                    resolution_width,
                    get_height: &mut self.get_height,
                    get_color: &mut self.get_color,
                }
                .write_into(buf);
            }
        }
    }
}

struct FlatMesh<F, G> {
    top_left: Point2<f32>,
    down: Vector2<f32>,
    right: Vector2<f32>,
    resolution_height: usize,
    resolution_width: usize,
    get_height: F,
    get_color: G,
}

impl<F, G> ExtendTriangleBuf for FlatMesh<F, G>
where
    F: FnMut(&'_ Point2<f32>) -> f32,
    G: FnMut(&'_ Point2<f32>) -> Color,
{
    fn write_into<B: TriangleBuf>(&mut self, buf: &mut B) {
        let step_height = self.down.scale(1.0 / self.resolution_height as f32);
        let step_width = self.down.scale(1.0 / self.resolution_width as f32);
        for r in 0..self.resolution_height {
            for c in 0..self.resolution_width {
                Tile {
                    top_left: self.top_left
                        + step_height.scale(r as f32)
                        + step_width.scale(c as f32),
                    down: step_height,
                    right: step_width,
                    get_height: &mut self.get_height,
                    get_color: &mut self.get_color,
                }
                .write_into(buf);
            }
        }
    }
}

struct Tile<F, G> {
    top_left: Point2<f32>,
    down: Vector2<f32>,
    right: Vector2<f32>,
    get_height: F,
    get_color: G,
}

impl<F, G> ExtendTriangleBuf for Tile<F, G>
where
    F: FnMut(&'_ Point2<f32>) -> f32,
    G: FnMut(&'_ Point2<f32>) -> Color,
{
    fn write_into<B: TriangleBuf>(&mut self, buf: &mut B) {
        TriangleTile {
            vertexes: [
                self.top_left + self.down,
                self.top_left + self.down + self.right,
                self.top_left,
            ],
            get_height: &mut self.get_height,
            get_color: &mut self.get_color,
        }
        .write_into(buf);

        TriangleTile {
            vertexes: [
                self.top_left + self.right,
                self.top_left,
                self.top_left + self.down + self.right,
            ],
            get_height: &mut self.get_height,
            get_color: &mut self.get_color,
        }
        .write_into(buf);
    }
}

struct TriangleTile<F, G> {
    vertexes: [Point2<f32>; 3],
    get_height: F,
    get_color: G,
}

impl<F, G> ExtendTriangleBuf for TriangleTile<F, G>
where
    F: FnMut(&'_ Point2<f32>) -> f32,
    G: FnMut(&'_ Point2<f32>) -> Color,
{
    fn write_into<B: TriangleBuf>(&mut self, buf: &mut B) {
        let center = self
            .vertexes
            .iter()
            .map(|p| p.coords)
            .sum::<Vector2<f32>>()
            .scale(1.0 / 3.0);
        let center = Point2 { coords: center };
        let color = (self.get_color)(&center);
        let triangle = self
            .vertexes
            .map(|point| Point3::new(point[0], (self.get_height)(&point), point[1]));
        let normal = (triangle[0] - triangle[1]).cross(&(triangle[2] - triangle[1]));
        let normal = Unit::new_normalize(normal);
        let triangle = triangle.map(|point| Vertex {
            point,
            normal,
            color,
        });
        Triangle::from_array(triangle).write_into(buf);
    }
}
