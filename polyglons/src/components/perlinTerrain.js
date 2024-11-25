import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useRef, useEffect } from "react";

function createTerrain(params) {
    var geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
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

    const colors = [];


    const G = 2.0 ** (-params.persistence);
    for (let i = 0; i < positions.length; i += 9) {
        for (let j = i; j < i + 9; j += 3) {
            const x = positions[j];
            const y = positions[j + 1];

            let amplitude = 1.0;
            let frequency = 1.0;
            let normalization = 0;
            let total = 0;

            for (let o = 0; o < params.octaves; o++) {
                const xs = x / params.scale;
                const ys = y / params.scale;
                const noiseVal = noise2D(xs * frequency, ys * frequency) * 0.5 + 0.5;
                total += noiseVal * amplitude;
                normalization += amplitude;
                amplitude *= G;
                frequency *= params.lacunarity;
            }
            total /= normalization;
            const final = Math.pow(total, params.exponentiation) * params.height;
            positions[j + 2] = final;

            let color;
            if (positions[i + 2] > 1.4) {
                color = new THREE.Color(1.0, 1.0, 1.0);
            } 
            else if(positions[i + 2] > 0.7){
                color = new THREE.Color(0.6, 0.6, 0.6);
            }
            else {
                color = new THREE.Color(0.486, 0.988, 0);
            }
            colors.push(...color.toArray());
        }
    }

    nonIndexedGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    nonIndexedGeometry.attributes.position.needsUpdate = true;

    return terrain;
}

export default function Terrain({ params }) {
    const terrainRef = useRef();
  
    useEffect(() => {
        const currentTerrain = terrainRef.current;
  
      if (currentTerrain.children.length > 0) {
        const oldTerrain = currentTerrain.children[0];
        currentTerrain.remove(oldTerrain);
      }
      const newTerrain = createTerrain(params);
      currentTerrain.add(newTerrain);
    }, [params]);
  
    return <mesh ref={terrainRef} />;
  }