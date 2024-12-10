import * as THREE from 'three';

export const BIOME_COLORS = {
    FOREST: [
        { height: 0.0, color: new THREE.Color(0.2, 0.5, 0.1) },
        { height: 0.5, color: new THREE.Color(1.0, 1.0, 0.4) },
        { height: 1.5, color: new THREE.Color(0.2, 0.5, 0.1) },
        { height: 2.0, color: new THREE.Color(0.541, 0.82, 0.365) },
        { height: 3.0, color: new THREE.Color(0.765, 0.929, 0.659) },
    ],
    DESERT: [
        { height: 0.0, color: new THREE.Color(0.961, 0.663, 0.157) },
        { height: 0.5, color: new THREE.Color(0.922, 0.51, 0.059) },
        { height: 1.5, color: new THREE.Color(0.961, 0.663, 0.157) },
        { height: 2.0, color: new THREE.Color(1, 0.788, 0.349) },
        { height: 3.0, color: new THREE.Color(1, 0.82, 0.286) },
    ],
    SNOWY: [
        { height: 0.0, color: new THREE.Color(0.2, 0.157, 0.141) },
        { height: 0.5, color: new THREE.Color(0.231, 0.208, 0.184) },
        { height: 1.5, color: new THREE.Color(0.322, 0.278, 0.231) },
        { height: 2.0, color: new THREE.Color(0.906, 0.929, 0.961) },
        { height: 3.0, color: new THREE.Color(1, 1, 1) },
    ],
    BLOSSOM: [
        { height: 0.0, color: new THREE.Color(0.2, 0.5, 0.1) },
        { height: 0.5, color: new THREE.Color(1.0, 1.0, 0.4) },
        { height: 1.5, color: new THREE.Color(0.2, 0.5, 0.1) },
        { height: 2.0, color: new THREE.Color(0.541, 0.82, 0.365) },
        { height: 3.0, color: new THREE.Color(1, 0.537, 0.639) },
    ],
};

export const BIOME_PEAKS = {
    FOREST: [{ height: 3.0, variation: 1.2 }],
    DESERT: [{ height: 3.0, variation: 0.6 }],
    SNOWY: [
        { height: 0.5, variation: 0.8 },
        { height: 1.5, variation: 1.5 },
        { height: 2.0, variation: 1.8 },
        { height: 3.0, variation: 2.0 },
    ],
    BLOSSOM: [{ height: 3.0, variation: 1.2 }],
};

const PARAMS = {
    scale: 10,
    octaves: 8,
    lacunarity: 2.0,
    persistence: 1.0,
    exponentiation: 3.0,
    height: 5.5,
    numIslands: 9,
    minRadius: 15,
    maxRadius: 20,
    radius: 15,
};

const SCENE_DIMENSION = 150;

const BASE_HEIGHT = 1;
const TESSELATION = 100;
const FALLOFF_DISTANCE = 20;
const SEED = 12803;
const DENSITY = {
    FOREST: 0.02,
    DESERT: 0.005,
    SNOWY: 0.025,
    BLOSSOM: 0.02,
};
const CLOSE_TESSELATION_DIVISOR = 1.5;
const FAR_TESSELATION_DIVISOR = 4;

export {
    PARAMS,
    SCENE_DIMENSION,
    BASE_HEIGHT,
    TESSELATION,
    FALLOFF_DISTANCE,
    SEED,
    DENSITY,
    CLOSE_TESSELATION_DIVISOR,
    FAR_TESSELATION_DIVISOR,
};
