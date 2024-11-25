import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';


export function createTerrain() {
    var geometry = new THREE.PlaneGeometry(100, 100, 80, 80);
    var nonIndexedGeometry = geometry.toNonIndexed();

    const material = new THREE.MeshLambertMaterial({ 
        vertexColors: true,
        wireframe: false,
        flatShading: true,        
     });
    const terrain = new THREE.Mesh(nonIndexedGeometry, material);
    terrain.rotation.x = -Math.PI / 2;

    const noise2D = createNoise2D();
    const positions = nonIndexedGeometry.attributes.position.array;
    const scale = 0.14;
    const height = 1.2;

    const colors = [];
    var color = new THREE.Color(1,1,1);

     const newPositions = [];

    for (let i = 0; i < positions.length; i += 9) {
        for(let j = i; j < i+9; j+=3){
            const x = positions[j];
            const y = positions[j + 1];
            const noiseValue = noise2D(x * scale, y * scale);
            newPositions.push(positions[j], positions[j+1], noiseValue * height);
            if(positions[i + 2] > 0.7){
                color = new THREE.Color(1.0, 1.0, 1.0);
            }
            else {
                color = new THREE.Color(0.486, 0.988, 0);
            }
           colors.push(...color);
        }
    }

    nonIndexedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    nonIndexedGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return terrain;
}