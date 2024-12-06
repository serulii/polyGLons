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
        { height: 0.0, color: new THREE.Color(0.8, 0.345, 0.212) },
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
};

const SCENE_DIMENSION = 100;
const TESSELATION = 100;

export { SCENE_DIMENSION, TESSELATION };
