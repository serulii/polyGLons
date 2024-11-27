import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useRef, useEffect } from 'react';
import { BIOME_COLORS } from '../utils/constants';

function getColor(height, colors) {
    for (let i = 0; i < colors.length; i++) {
        const { height: thresholdHeight, color } = colors[i];

        if (height <= thresholdHeight) {
            return color;
        }
    }
    return colors[colors.length - 1].color;
}

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

    const G = 2.0 ** -params.persistence;
    for (let i = 0; i < positions.length; i += 9) {
        for (let j = i; j < i + 9; j += 3) {
            const x = positions[j];
            const y = positions[j + 1];

            const radius = 20; // make this adjustable later!
            const distortScale = 0.1;
            const distortStrength = 3;
            const distortNoise = noise2D(x * distortScale, y * distortScale);
            const distortedRadius = radius + distortNoise * distortStrength;
            const distFromCenter = Math.sqrt(x * x + y * y) / distortedRadius;

            // cubic taper for smoother transition :)
            let taper = 1 - Math.pow(distFromCenter, 3);
            taper = Math.max(0, Math.min(1, taper));

            let amplitude = 1.0;
            let frequency = 1.0;
            let normalization = 0;
            let total = 0;

            for (let o = 0; o < params.octaves; o++) {
                const xs = x / params.scale;
                const ys = y / params.scale;
                const noiseVal =
                    noise2D(xs * frequency, ys * frequency) * 0.5 + 0.5;
                total += noiseVal * amplitude;
                normalization += amplitude;
                amplitude *= G;
                frequency *= params.lacunarity;
            }
            total /= normalization;

            const baseHeight = 1;
            let final = Math.pow(total, params.exponentiation) * params.height;

            // apply taper if it's towards the edge
            if (distFromCenter > 0.75) {
                final = THREE.MathUtils.lerp(0, final, taper);
            }
            // add a base height for the island
            if (final > 0) {
                final += baseHeight;
            }
            positions[j + 2] = final;

            const color = getColor(final, BIOME_COLORS['FOREST']);
            colors.push(...color.toArray());
        }
    }

    nonIndexedGeometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
    );
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
