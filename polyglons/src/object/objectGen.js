import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { DENSITY } from '../utils/constants';
import seedrandom from 'seedrandom';

// model loading helper
const loader = new GLTFLoader();
export async function loadModel(path) {
    return new Promise((resolve, reject) => {
        loader.load(path, (data) => resolve(data), null, reject);
    });
}

// load models for different biome types
const models = {
    FOREST: [
        await loadModel('models/tree.glb'),
        await loadModel('models/tree2.glb'),
        await loadModel('models/rock1.gltf'),
        await loadModel('models/rock2.gltf'),
        await loadModel('models/rock3.gltf'),
    ],
    DESERT: [
        await loadModel('models/cactus1.glb'),
        await loadModel('models/ruins.gltf'),
        await loadModel('models/prickly_pear.gltf'),
        await loadModel('models/rock3.gltf'),
    ],
    SNOWY: [await loadModel('models/snowy_tree_1.gltf')],
    BLOSSOM: [
        await loadModel('models/sakura_1.gltf'),
        await loadModel('models/petals.gltf'),
    ],
};

export function generateObj(pos, biomeType, seed) {
    // error-check
    const biomeModels = models[biomeType];
    if (!biomeModels || biomeModels.length === 0) {
        console.warn(`No models available for biome type: ${biomeType}`);
        return null;
    }

    const rng = seedrandom(seed);
    if (rng() > DENSITY[biomeType]) {
        return null;
    }
    // pick random model
    const randIdx = Math.floor(rng() * biomeModels.length);
    const model = biomeModels[randIdx].scene.clone();

    // randomly scale
    const scale = rng() * 0.2 + 0.3; // Scale between 0.3 and 0.5
    model.scale.set(scale, scale, scale);

    // randomly rotate around y-axis
    model.rotation.y = rng() * 2 * Math.PI;

    // set position
    model.position.set(pos.x, pos.y, pos.z);

    return model;
}
