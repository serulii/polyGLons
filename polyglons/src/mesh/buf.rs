use nalgebra::Point2;

pub trait TileBuf {
    fn push_tile(&mut self, tile: &Tile);
}

pub trait ExtendTileBuf {
    fn write_into<B: TileBuf>(&mut self, buf: &mut B);
}

pub struct Tile {
    pub top_left: Point2<i32>,
    pub width: i32,
}

impl ExtendTileBuf for Tile {
    fn write_into<B: TileBuf>(&mut self, buf: &mut B) {
        buf.push_tile(self);
    }
}
