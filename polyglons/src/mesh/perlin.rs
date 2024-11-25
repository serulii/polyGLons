use nalgebra::{Point, Point3, Scalar, Unit, Vector3};
use rand::{distributions::Standard, rngs::SmallRng, Rng, SeedableRng};
use rustc_hash::FxHasher;
use std::hash::{Hash, Hasher};

fn point_rng<T: Hash + Scalar, const N: usize>(point: &Point<T, N>, why: &str) -> SmallRng {
    let mut hasher = FxHasher::default();
    point.hash(&mut hasher);
    why.hash(&mut hasher);
    SmallRng::seed_from_u64(hasher.finish())
}

pub fn get(point: &Point3<f32>, why: &str) -> f32 {
    let point = point.map(|x| x as i32);
    let mut rng = point_rng(&point, why);
    //    let axis = Vector3::<f32>::from_distribution(&Standard, &mut rng);
    //    let axis = Unit::new_normalize(axis);

    rng.gen()
}
