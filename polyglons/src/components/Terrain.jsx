import { useThree, useFrame } from '@react-three/fiber';
import Island from './Island';
import * as THREE from 'three';
import { useState, useEffect, useRef } from 'react';
import { SCENE_DIMENSION, FALLOFF_DISTANCE, SEED } from '../utils/constants';
import { BIOME_COLORS } from '../utils/constants';

export default function levelOfDetail({ params }) {
    const group = new THREE.Group();

    const [islands, setIslands] = useState([]);
    const [islandCounter, setIslandCounter] = useState([]);

    let  { camera } = useThree();

    const bounds = {
        xMin: -SCENE_DIMENSION / 2,
        xMax: SCENE_DIMENSION / 2,
        yMin: -SCENE_DIMENSION / 2,
        yMax: SCENE_DIMENSION / 2,
    };

    //initializes the islandCounter, 1 if in distance, 0 if not
    useEffect(() => {
        const newIslands = generateIslands(params.numIslands, bounds, params.minRadius, params.maxRadius);
        setIslands(newIslands);

        const initializeCounter = newIslands.map(island => {
            const euclideanDistance = Math.sqrt((camera.position.x - island.x) ** 2 + (camera.position.y - island.y) ** 2);
            return euclideanDistance <= FALLOFF_DISTANCE ? 1 : 5;
        });

        setIslandCounter(initializeCounter);
    }, [params.numIslands, params.minRadius, params.maxRadius]);


    //useRef to prevent rerendering on change
    const prevPosition = useRef({ x: camera.position.x, y: camera.position.y });

    useFrame(() => {

        const { x, y, z } = camera.position;

        if (x != prevPosition.current.x || y != prevPosition.current.y) {
            prevPosition.current = { x, y, z };

            const newCounter = islands.map(island => {
                const euclideanDistance = Math.sqrt((-x - island.x) ** 2 + (z - island.y) ** 2);
                return euclideanDistance <= FALLOFF_DISTANCE ? 1 : 5;
            });

            for(let i=0; i<islandCounter.length; i++){
                if(newCounter[i] != islandCounter[i]){
                    setIslandCounter(newCounter);
                    break;
                }
            }
        }
        group.clear();
        for(let i=0; i<islands.length; i++){
            group.add(Island(params, {x: islands[i].x, y: islands[i].y}, islands[i].biome, islandCounter[i], i+SEED));
        }
    });
 
    return <primitive object={group} />;
    
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
                    const radius = THREE.MathUtils.randFloat(minRadius, maxRadius);
                    // pick random biome from list of biomes
                    var randomBiome = function (obj) {
                        var keys = Object.keys(obj);
                        return keys[(keys.length * Math.random()) << 0];
                    };
                    var biome = randomBiome(BIOME_COLORS).toString();
                    newIsland = { x, y, radius, biome };
                    usedCells.add(cellKey);
                    foundCell = true;
                }
            }
    
            islands.push(newIsland);
        }
        return islands;
    }
}



    
