import Island from "./Island";
import * as THREE from 'three';
import { useState, useEffect } from "react";
import { SCENE_DIMENSION } from "../utils/constants";

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

                newIsland = { x, y, radius };
                usedCells.add(cellKey);
                foundCell = true;
            }
        }

        islands.push(newIsland);
    }

    console.log(islands);
    return islands;
}

export default function Terrain({ params }) {
    const bounds = { xMin: -SCENE_DIMENSION / 2, xMax: SCENE_DIMENSION / 2, yMin: -SCENE_DIMENSION / 2, yMax: SCENE_DIMENSION / 2 };
    const [islands, setIslands] = useState([]);

    useEffect(() => {
        const newIslands = generateIslands(5, bounds, 10, 12); // 5 islands, radius 10-15
        setIslands(newIslands);
    }, []);

    return (
        <group>
            {islands.map((island, index) => (
                <Island
                    key={index}
                    params={{ ...params, radius: island.radius }}
                    center={{ x: island.x, y: island.y }}
                />
            ))}
        </group>
    );
}
