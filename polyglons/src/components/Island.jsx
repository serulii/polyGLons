import * as THREE from 'three';
import { BIOME_COLORS, BIOME_PEAKS, TESSELATION, SEED } from '../utils/constants';
import { getIsland } from './Terrain';

function getColor(height, biomeType) {
    const colors = BIOME_COLORS[biomeType]
    for (let i = 0; i < colors.length; i++) {
        const { height: thresholdHeight, color } = colors[i];

        if (height <= thresholdHeight) {
            return color;
        }
    }
    return colors[colors.length - 1].color;
}

function modifyPeaks(height, biomeType) {
    const variations = BIOME_PEAKS[biomeType]
    for (let i = 0; i < variations.length; i++) {
        const { height: thresholdHeight, variation: x } = variations[i];

        if (height <= thresholdHeight) {
            return height * x;
        }
    }
    return height * variations[variations.length - 1].variation;
}

export default function Island(params, center, biomeType, lod, perlin3D, seed) {
    const newTerrain = createTerrain();
    return newTerrain

    function createTerrain() {

        // TODO: make a maxRadius variable based on radius to set size of plane
        let tesselationVal = TESSELATION/lod

        var geometry = new THREE.PlaneGeometry(params.maxRadius * 2, params.maxRadius * 2, tesselationVal, tesselationVal);
        geometry.translate(-center.x, -center.y, 0);
        var nonIndexedGeometry = geometry.toNonIndexed();
    
        const material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            wireframe: false,
            flatShading: true,
            transparent: true,
        });

        const terrain = new THREE.Mesh(nonIndexedGeometry, material);
        terrain.rotation.x = -Math.PI / 2;
    
        const positions = nonIndexedGeometry.attributes.position.array;
    
        const colors = [];
    
        for (let i = 0; i < positions.length; i += 9) {
            for (let j = i; j < i + 9; j += 3) {
                const x = positions[j] + center.x;
                const y = positions[j + 1] + center.y;
                
                positions[j + 2] = calculateHeight(x,y,biomeType,params,seed,perlin3D);
                let alpha = 1;
    
                const color = getColor(positions[i + 2], biomeType);
                colors.push(...color.toArray());
                colors.push(alpha);
            }  
        }
    
        nonIndexedGeometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 4)
        );
        nonIndexedGeometry.attributes.position.needsUpdate = true;
    
        return terrain;
    }
}

function calculateHeight(x, y, biomeType, params, factor, perlin3D){
    const G = 2.0 ** -params.persistence;

    const distortScale = 0.1;
    const distortStrength = 2;
    
    const distortNoise = perlin3D.sample(x * distortScale, y * distortScale, factor);
    const distortedRadius =
        params.radius + distortNoise * distortStrength;
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
            perlin3D.sample(xs * frequency, ys * frequency, factor) * 0.5 + 0.5;
        total += noiseVal * amplitude;
        normalization += amplitude;
        amplitude *= G;
        frequency *= params.lacunarity;
    }
    total /= normalization;

    const baseHeight = 1;
    let final = Math.pow(total, params.exponentiation) * params.height;

    // apply taper if it's towards the edge
    if (distFromCenter > 0.5) {
        final = THREE.MathUtils.lerp(-1, final, taper); // bottom of mesh -> -1
    }
    // add a base height for the island
    if (final > 0) {
        // change peaks based on biome

        final = modifyPeaks(final, biomeType);
        final += baseHeight;
    }
    return final
}

export function getHeight(x, y, boundingBoxes){
    let island = getIsland(x, y, boundingBoxes);
    if(island == null){
        return -100;
    }

    let biomeType = island.biome;
    let params = island.params;
    let seed = island.seed;
    let perlin3D = island.perlin3D;

    const final = calculateHeight(x,y,biomeType,params,seed,perlin3D);
    return final;
}
