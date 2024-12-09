import * as THREE from 'three';
import { BIOME_COLORS, BIOME_PEAKS, TESSELATION, BASE_HEIGHT } from '../utils/constants';
import { getIsland } from './Terrain';
import { generateObj } from './objectGen';

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

function lerp(x, in_min, in_max, out_min, out_max) {
    return out_min + (x - in_min) * (out_max - out_min) / (in_max - in_min);
}

function getPlaneGeometry(centerX, centerZ, radius, tesselationVal) {
    const diameter = radius * 2;
    let geometry = new THREE.PlaneGeometry(diameter, diameter, tesselationVal, tesselationVal);
    geometry = geometry.toNonIndexed();
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i+1];
        const y = positions[i+2];
        positions[i] = lerp(x, 0.0, diameter, centerX, centerX + diameter);
        positions[i+1] = y;
        positions[i+2] = lerp(z, 0.0, diameter, centerZ, centerZ + diameter);
    }

    return geometry;
}

export default function Island(params, center, biomeType, lod, perlin3D, seed) {
    const newTerrain = createTerrain();
    return newTerrain

    function createTerrain() {
        // TODO: make a maxRadius variable based on radius to set size of plane
        let tesselationVal = TESSELATION/lod
        const geometry = getPlaneGeometry(center.x, center.y, params.maxRadius, tesselationVal);
        const positions = geometry.attributes.position.array;
        const colors = [];
        // group to hold all objects on this island
        const objects = new THREE.Group();
        objects.position.set(center.x, center.y, 0);
    
        for (let i = 0; i < positions.length; i += 9) {
            for (let j = i; j < i + 9; j += 3) {
                const x = positions[j];
                const y = positions[j + 2];
                const height = calculateHeight(x, y, center, biomeType, params, seed, perlin3D);
                positions[j + 1] = height;
                const color = getColor(positions[i + 1], biomeType);
                colors.push(...color, 1);

                // add an object at random
                const objSeed = `${seed},${x},${y}`;
                const obj = generateObj({x: x, y: height, z: y}, biomeType, objSeed);
                if (obj) {
                    objects.add(obj);
                }
            }  
        }
    
        geometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 4)
        );
        geometry.attributes.position.needsUpdate = true;
        const material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            wireframe: false,
            flatShading: true,
            transparent: true,
            side: THREE.BackSide,
        });
        const terrain = new THREE.Mesh(geometry, material);
        return new THREE.Group().add(terrain, objects);    
        // return terrain;
    }
}

function calculateHeight(x, y, center, biomeType, params, factor, perlin3D){
    const G = 2.0 ** -params.persistence;

    const distortScale = 0.1;
    const distortStrength = 2;
    
    const distortNoise = perlin3D.sample(x * distortScale, y * distortScale, factor);
    const distortedRadius =
        params.radius + distortNoise * distortStrength;
    const distFromCenter = Math.hypot(x - center.x, y - center.y) / distortedRadius;

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
    let final = Math.pow(total, params.exponentiation) * params.height;

    // apply taper if it's towards the edge
    if (distFromCenter > 0.5) {
        final = THREE.MathUtils.lerp(-1, final, taper); // bottom of mesh -> -1
    }
    // add a base height for the island
    if (final > 0) {
        // change peaks based on biome

        final = modifyPeaks(final, biomeType);
        final += BASE_HEIGHT;
    }
    return final
}

export function getHeight(x, y, boundingBoxes){
    let island = getIsland(x, y, boundingBoxes);
    if(island == null){
        return -100;
    }

    const center = { x: island.x, y : island.y };
    let biomeType = island.biome;
    let params = island.params;
    let seed = island.seed;
    let perlin3D = island.perlin3D;

    const final = calculateHeight(x,y, center, biomeType,params,seed,perlin3D);
    return final;
}
