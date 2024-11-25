use nalgebra::{Point, Point3, Scalar, Unit, Vector3};
use rand::{distributions::Standard, rngs::SmallRng, Rng, SeedableRng};
use rustc_hash::FxHasher;
use std::hash::{Hash, Hasher};

pub struct Perlin3 {}

fn point_rng<T: Hash + Scalar, const N: usize>(point: &Point<T, N>, why: &str) -> SmallRng {
    let mut hasher = FxHasher::default();
    point.hash(&mut hasher);
    why.hash(&mut hasher);
    SmallRng::seed_from_u64(hasher.finish())
}

impl Perlin3 {
    fn sample(from: &Point3<f32>, why: &str) {
        let point = from.map(|x| x as u32);
        let mut rng = point_rng(&point, why);
        let axis = Vector3::<f32>::from_distribution(&Standard, &mut rng);
        let axis = Unit::new_normalize(axis);

        //        let grid =
    }
}
