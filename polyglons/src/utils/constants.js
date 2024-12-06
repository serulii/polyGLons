import * as THREE from 'three';

export const BIOME_COLORS = {
    FOREST: [
        { height: 0.0, color: new THREE.Color(0.2, 0.5, 0.7) },
        { height: 0.5, color: new THREE.Color(1.0, 1.0, 0.4) },
        { height: 1.5, color: new THREE.Color(0.2, 0.5, 0.1) },
        { height: 2.0, color: new THREE.Color(0.6, 0.8, 0.4) },
        { height: 3.0, color: new THREE.Color(1.0, 1.0, 1.0) },
    ],

    DESERT: [
        { height: 0.0, color: new THREE.Color(0.2, 0.5, 0.7) },
        { height: 0.5, color: new THREE.Color(1, 0.788, 0.349) },
        { height: 1.5, color: new THREE.Color(1, 0.835, 0.376) },
        { height: 2.0, color: new THREE.Color(1, 0.882, 0.533) },
        { height: 3.0, color: new THREE.Color(1, 0.902, 0.612) },
    ],

    SNOWY: [
        { height: 0.0, color: new THREE.Color(0.2, 0.5, 0.7) },
        { height: 0.5, color: new THREE.Color(0.431, 0.353, 0.294) },
        { height: 1.5, color: new THREE.Color(0.529, 0.443, 0.38) },
        { height: 2.0, color: new THREE.Color(0.95, 0.92, 0.93) },
        { height: 3.0, color: new THREE.Color(1, 1, 1) },
    ],
};

export const SCENE_DIMENSION = 100;
