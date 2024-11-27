use crate::mesh::buf::{ExtendTileBuf, Tile, TileBuf};
use nalgebra::{Point2, Vector2};

pub struct Mesh<F> {
    pub top_left: Point2<i32>,
    pub block_count: i32,
    pub get_level_of_detail: F,
    pub max_level_of_detail: u32,
}

impl<F> ExtendTileBuf for Mesh<F>
where
    F: FnMut(&'_ Point2<i32>) -> u32,
{
    fn write_into<B: TileBuf>(&mut self, buf: &mut B) {
        let block_width = 2i32.pow(self.max_level_of_detail);
        let down = scale(&Vector2::y_axis().into_inner(), block_width);
        let right = scale(&Vector2::x_axis().into_inner(), block_width);
        let mut blocks = Vec::default();
        for r in 0..self.block_count {
            for c in 0..self.block_count {
                let top_left = self.top_left + scale(&down, r) + scale(&right, c);
                let center = top_left + &Vector2::from_element(block_width / 2);
                let tiles_per_block = (self.get_level_of_detail)(&center);
                let tiles_per_block = 2i32.pow(tiles_per_block);
                let tile_width = block_width / tiles_per_block;
                blocks.push(Block {
                    top_left,
                    tiles_per_block,
                    tile_width,
                });
            }
        }
        // draw the low resolution tiles first
        blocks.sort_by_key(|block| block.tiles_per_block);
        for block in blocks.iter_mut() {
            block.write_into(buf);
        }
    }
}

pub struct Block {
    pub top_left: Point2<i32>,
    pub tiles_per_block: i32,
    pub tile_width: i32,
}

impl ExtendTileBuf for Block {
    fn write_into<B: TileBuf>(&mut self, buf: &mut B) {
        let down = scale(&Vector2::y_axis().into_inner(), self.tile_width);
        let right = scale(&Vector2::x_axis().into_inner(), self.tile_width);
        for r in 0..self.tiles_per_block {
            for c in 0..self.tiles_per_block {
                let top_left = self.top_left + scale(&down, r) + scale(&right, c);
                Tile {
                    top_left,
                    width: self.tile_width,
                }
                .write_into(buf);
            }
        }
    }
}

fn scale(p: &Vector2<i32>, by: i32) -> Vector2<i32> {
    p.map(|x| x * by)
}
