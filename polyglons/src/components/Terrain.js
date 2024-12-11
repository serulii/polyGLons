import { useThree, useFrame } from '@react-three/fiber';
import Island from './Island';
import * as THREE from 'three';
import { useState, useEffect, useRef } from 'react';
import {
    PARAMS,
    SCENE_DIMENSION,
    FALLOFF_DISTANCE,
    SEED,
    CLOSE_TESSELATION_DIVISOR,
    FAR_TESSELATION_DIVISOR,
} from '../utils/constants';
import { BIOME_COLORS } from '../utils/constants';
import { Perlin3d } from '../polyglons-wasm/polyglons_wasm';
import { animationInProgress } from './Rig';

export function getIsland(x, z, boundingBoxes) {
    for (let i = 0; i < boundingBoxes.length; i += 2) {
        if (
            x >= boundingBoxes[i].xLeft &&
            x <= boundingBoxes[i].xRight &&
            z >= boundingBoxes[i].yBottom &&
            z <= boundingBoxes[i].yTop
        ) {
            return boundingBoxes[i + 1];
        }
    }
    return null;
}

export default function Terrain({ setBoundingBoxes, cameraAnimationState, ortho, modelRef }) {
    const group = new THREE.Group();

    const [islands, setIslands] = useState([]);
    const [islandCounter, setIslandCounter] = useState([]);
    const [counter, setCounter] = useState(true);

    let { camera } = useThree();

    const bounds = {
        xMin: -SCENE_DIMENSION / 2,
        xMax: SCENE_DIMENSION / 2,
        yMin: -SCENE_DIMENSION / 2,
        yMax: SCENE_DIMENSION / 2,
    };

    useEffect(() => {
        function onKeyDown(event) {
            if (['Space'].includes(event.code) && ortho) {
                setCounter(!counter);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    });

    //initializes the islandCounter, 1 if in distance, 0 if not
    useEffect(() => {
        const { x, _, z } = camera.position;

        const newIslands = generateIslands(
            PARAMS.numIslands,
            bounds,
            PARAMS.minRadius,
            PARAMS.maxRadius
        );

        setIslands(newIslands);

        const initializeCounter = newIslands.map((island) => {
            const euclideanDistance = Math.sqrt(
                (x - island.x) ** 2 + (z - island.y) ** 2
            );
            if(ortho) return FAR_TESSELATION_DIVISOR;
            return euclideanDistance <= FALLOFF_DISTANCE
                ? CLOSE_TESSELATION_DIVISOR
                : FAR_TESSELATION_DIVISOR;
        });

        setIslandCounter(initializeCounter);

        group.clear();
        let tempBox = [];
        for (let i = 0; i < newIslands.length; i++) {
            let curIsland = Island(
                { x: newIslands[i].x, y: newIslands[i].y },
                newIslands[i].biome,
                initializeCounter[i],
                newIslands[i].perlin3D,
                newIslands[i].seed
            );
            group.add(curIsland);
            tempBox.push({
                xLeft: newIslands[i].x - newIslands[i].radius + 2,
                xRight: newIslands[i].x + newIslands[i].radius - 2,
                yBottom: newIslands[i].y - newIslands[i].radius + 2,
                yTop: newIslands[i].y + newIslands[i].radius - 2,
            });
            tempBox.push(newIslands[i]);
        }
        setBoundingBoxes(tempBox);
    }, [counter]);

    for (let i = 0; i < islands.length; i++) {
        group.add(
            Island(
                { x: islands[i].x, y: islands[i].y },
                islands[i].biome,
                islandCounter[i],
                islands[i].perlin3D,
                islands[i].seed
            )
        );
    }

    // useRef to prevent rerendering on change
    const prevPosition = useRef({ x: camera.position.x, y: camera.position.y, z:camera.position.z });
    const transition = useRef(false);

    useFrame(() => {
        
        const { x, y, z } = camera.position;
        let changed = false;

        if ((x != prevPosition.current.x || z != prevPosition.current.z) && !animationInProgress(cameraAnimationState) && !ortho) {
            prevPosition.current = { x, y, z };

            const newCounter = islands.map((island) => {
                const euclideanDistance = Math.sqrt(
                    (x - island.x) ** 2 + (z - island.y) ** 2
                );
                return euclideanDistance <= FALLOFF_DISTANCE
                    ? CLOSE_TESSELATION_DIVISOR
                    : FAR_TESSELATION_DIVISOR;
            });

            for (let i = 0; i < islandCounter.length; i++) {
                if (newCounter[i] != islandCounter[i]) {
                    changed = true;
                    setIslandCounter(newCounter);
                    break;
                }
            }
        }

        if (animationInProgress(cameraAnimationState) && ortho && !transition.current) {
            transition.current = true;
        }

        else if (!animationInProgress(cameraAnimationState) && transition.current){
            transition.current = false;
        }

        if ((changed && !ortho) || (ortho && transition.current && islandCounter.reduce((accumulator, currentValue) => accumulator + currentValue, 0) != islandCounter.length * FAR_TESSELATION_DIVISOR)) {
            group.clear();
            for (let i = 0; i < islands.length; i++) {
                if(ortho) islandCounter[i] = FAR_TESSELATION_DIVISOR;
                let curIsland = Island(
                    { x: islands[i].x, y: islands[i].y },
                    islands[i].biome,
                    islandCounter[i],
                    islands[i].perlin3D,
                    islands[i].seed
                );
                group.add(curIsland);
            }
        }
    });

    function generateIslands(numIslands, bounds, minRadius, maxRadius) {
        const islands = [];
        const cellSize = maxRadius * 2.5;
        const gridCols = Math.floor((bounds.xMax - bounds.xMin) / cellSize);
        const gridRows = Math.floor((bounds.yMax - bounds.yMin) / cellSize);
        numIslands = Math.min(gridCols * gridRows, numIslands); // otherwise can't fit all islands

        // to track cells already with islands
        const usedCells = new Set();

        for (let i = 0; i < numIslands; i++) {
            let foundCell = false;
            let newIsland;

            // randomly choose a cell until we find an empty cell
            while (!foundCell) {
                const col = Math.floor(Math.random() * gridCols);
                const row = Math.floor(Math.random() * gridRows);
                const cellKey = `${col},${row}`;

                if (!usedCells.has(cellKey)) {
                    // calculate bounds of this cell
                    const xMin = bounds.xMin + col * cellSize;
                    const xMax = xMin + cellSize;
                    const yMin = bounds.yMin + row * cellSize;
                    const yMax = yMin + cellSize;

                    // generate island info (position & radius) semi-randomly
                    const x = THREE.MathUtils.randFloat(
                        xMin + maxRadius,
                        xMax - maxRadius
                    );
                    const y = THREE.MathUtils.randFloat(
                        yMin + maxRadius,
                        yMax - maxRadius
                    );
                    const radius = THREE.MathUtils.randFloat(
                        minRadius,
                        maxRadius
                    );
                    // pick random biome from list of biomes
                    var randomBiome = function (obj) {
                        var keys = Object.keys(obj);
                        return keys[(keys.length * Math.random()) << 0];
                    };
                    var biome = randomBiome(BIOME_COLORS).toString();
                    const perlin3D = new Perlin3d();
                    const seed = (i + SEED) * SEED;
                    newIsland = { x, y, radius, biome, perlin3D, seed };
                    usedCells.add(cellKey);
                    foundCell = true;
                }
            }

            islands.push(newIsland);
        }
        return islands;
    }

    return <primitive object={group} />;
}
