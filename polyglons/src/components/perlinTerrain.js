import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';


export function createTerrain() {
    var geometry = new THREE.PlaneGeometry(20, 20, 20, 20);
    var nonIndexedGeometry = geometry.toNonIndexed();

    const material = new THREE.MeshLambertMaterial({ 
        vertexColors: false,
        color: 0x7CFC00,
        wireframe: false,
        flatShading: true,
        
     });
    const terrain = new THREE.Mesh(nonIndexedGeometry, material);
    terrain.rotation.x = -Math.PI / 2;

    const noise2D = createNoise2D();
    const positions = nonIndexedGeometry.attributes.position.array;

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