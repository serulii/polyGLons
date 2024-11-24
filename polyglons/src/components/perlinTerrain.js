import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export function createTerrain() {
    var geometry = new THREE.PlaneGeometry(20, 20, 40, 40);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x3f9b0b,
        wireframe: true
     });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;

    const noise2D = createNoise2D();
    const positions = geometry.attributes.position.array;

    const scale = 0.14;
    const height = 1.2;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];

        const noiseValue = noise2D(x * scale, y * scale);
        positions[i + 2] = noiseValue * height;

    }

    geometry.attributes.position.needsUpdate = true;
    return terrain;
}