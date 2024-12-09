import { loadModel } from '../utils/utils';
import { DENSITY } from '../utils/constants';
import seedrandom from 'seedrandom';

const modelData = await loadModel('/models/tree.glb')

export function generateObj(pos, biomeType, seed) {
    // TODO: semi-randomly choose an object based on biomeType (use seed)
    const rng = seedrandom(seed);
    if (rng() > DENSITY) {
        return null;
    }
    const model = modelData.scene.clone();

    // randomly scale
    const scale = rng() * 0.2 + 0.3; // scale between 0.3 and 0.5
    model.scale.set(scale, scale, scale);

    // randomly rotate around y-axis
    model.rotation.y = rng() * 2 * Math.PI;

    // set position
    model.position.set(pos.x, pos.y, pos.z);

    return model;
}