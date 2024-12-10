import * as THREE from 'three';
import {
    BIOME_COLORS,
    BIOME_PEAKS,
    TESSELATION,
    BASE_HEIGHT,
    SCENE_DIMENSION,
} from '../utils/constants';
import { getIsland } from './Terrain';
import { generateObj } from '../object/objectGen';
import { animationInProgress } from './Rig';

function getColor(height, biomeType) {
    const colors = BIOME_COLORS[biomeType];
    for (let i = 0; i < colors.length; i++) {
        const { height: thresholdHeight, color } = colors[i];

        if (height <= thresholdHeight) {
            return color;
        }
    }
    return colors[colors.length - 1].color;
}

function modifyPeaks(height, biomeType) {
    const variations = BIOME_PEAKS[biomeType];
    for (let i = 0; i < variations.length; i++) {
        const { height: thresholdHeight, variation: x } = variations[i];

        if (height <= thresholdHeight) {
            return height * x;
        }
    }
    return height * variations[variations.length - 1].variation;
}

function getPlaneGeometry(centerX, centerZ, radius, tesselationVal) {
    const diameter = radius * 2;
    let geometry = new THREE.PlaneGeometry(
        diameter,
        diameter,
        tesselationVal,
        tesselationVal
    );
    geometry = geometry.toNonIndexed();
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        const y = positions[i + 2];
        positions[i] = x + centerX;
        positions[i + 1] = y;
        positions[i + 2] = z + centerZ;
    }

    return geometry;
}

// generates objects for a given island
// TODO: maybe cache heights so this isn't as expensive :(
function getIslandObjects(
    center,
    radius,
    resolution,
    biomeType,
    seed,
    params,
    perlin3D
) {
    const objects = new THREE.Group();
    const step = radius / resolution;

    for (let x = center.x - radius; x <= center.x + radius; x += step) {
        for (let y = center.y - radius; y <= center.y + radius; y += step) {
            const height = calculateHeight(
                x,
                y,
                center,
                biomeType,
                params,
                seed,
                perlin3D
            );

            if (height > BASE_HEIGHT) {
                const objSeed = `${seed},${x},${y}`;
                const obj = generateObj(
                    { x, y: height, z: y },
                    biomeType,
                    objSeed
                );
                if (obj) {
                    objects.add(obj);
                }
            }
        }
    }
    return objects;
}

export default function Island(params, center, biomeType, lod, perlin3D, seed) {
    function createTerrain() {
        let tesselationVal = TESSELATION / lod;

        const geometry = getPlaneGeometry(
            center.x,
            center.y,
            params.maxRadius,
            tesselationVal
        );
        const positions = geometry.attributes.position.array;
        const colors = [];

        for (let i = 0; i < positions.length; i += 9) {
            for (let j = i; j < i + 9; j += 3) {
                const x = positions[j];
                const y = positions[j + 2];
                const height = calculateHeight(
                    x,
                    y,
                    center,
                    biomeType,
                    params,
                    seed,
                    perlin3D
                );
                positions[j + 1] = height;
                const color = getColor(positions[i + 1], biomeType);
                colors.push(...color, 1);
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
        const objects = getIslandObjects(
            center,
            params.maxRadius,
            20,
            biomeType,
            seed,
            params,
            perlin3D
        );

        return new THREE.Group().add(terrain, objects);
    }

    const newTerrain = createTerrain();
    return newTerrain;
}

function calculateHeight(x, y, center, biomeType, params, factor, perlin3D) {
    const G = 2.0 ** -params.persistence;

    const distortScale = 0.1;
    const distortStrength = 2;

    const distortNoise = perlin3D.sample(
        x * distortScale,
        y * distortScale,
        factor
    );
    const distortedRadius = params.radius + distortNoise * distortStrength;
    const distFromCenter =
        Math.hypot(x - center.x, y - center.y) / distortedRadius;

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
    return final;
}

export function getHeight(x, y, boundingBoxes) {
    let island = getIsland(x, y, boundingBoxes);
    if (island == null) {
        return -100;
    }

    const center = { x: island.x, y: island.y };
    let biomeType = island.biome;
    let params = island.params;
    let seed = island.seed;
    let perlin3D = island.perlin3D;

    const final = calculateHeight(
        x,
        y,
        center,
        biomeType,
        params,
        seed,
        perlin3D
    );
    return final;
}

export function getNearestReachableCoordinate(x, y, boundingBoxes) {
    const visited = new Set();
    const q = [[x, y]];

    const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
    ];

    const toString = (coord) => `${coord[0]},${coord[1]}`;

    while (q.length > 0) {
        const cur = q.shift();
        // console.log(cur);
        const curCoords = toString(cur);

        if (!visited.has(curCoords)) {
            visited.add(curCoords);

            const final = getHeight(cur[0], cur[1], boundingBoxes);
            if (final > 0) {
                return cur;
            }

            for (let i = 0; i < dirs.length; i++) {
                let nX = cur[0] + dirs[i][0];
                let nY = cur[1] + dirs[i][1];
                const nCoords = toString([nX, nY]);

                if (
                    !visited.has(nCoords) &&
                    nX > -SCENE_DIMENSION &&
                    nX < SCENE_DIMENSION &&
                    nY > -SCENE_DIMENSION &&
                    nY < SCENE_DIMENSION
                ) {
                    q.push([nX, nY]);
                }
            }
        }
    }
    return [0, 0];
}
