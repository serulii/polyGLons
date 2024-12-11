import './css/App.css';
import './css/style.css';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { FlyControls, FirstPersonControls } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import Skybox from './components/Skybox';
import initWasm from './polyglons-wasm/polyglons_wasm';
import BoatControls from './components/Boat.jsx';
import Water from './components/Water';
import Rig from './components/Rig';
import Terrain from './components/Terrain';
import Controls from './components/Controls';

function Scene() {
    const [orthoReturnPosition, setOrthoReturnPosition] = useState(
        new THREE.Vector3(20.0, 1.0, -20.0)
    );
    const [boundingBoxes, setBoundingBoxes] = useState([]);
    const [ortho, setOrtho] = useState(true);
    const [cameraAnimationState, setCameraAnimationState] = useState();
    const modelRef = useRef();

    return (
        <>
            <Controls />
            <Canvas shadows={true}>
                <Rig
                    ortho={ortho}
                    setOrtho={setOrtho}
                    setOrthoReturnPosition={setOrthoReturnPosition}
                    cameraAnimationState={cameraAnimationState}
                    setCameraAnimationState={setCameraAnimationState}
                    boundingBoxes={boundingBoxes}
                    orthoReturnPosition={orthoReturnPosition}
                    modelRef={modelRef}
                />
                <directionalLight
                    direction={new THREE.Vector3(-0.5, 5.0, 0.0)}
                    castShadow={true}
                    intensity={1}
                    shadow-mapSize-width={1024} // Higher resolution shadows
                    shadow-mapSize-height={1024}
                    shadow-camera-near={0.5} // Ensure the light's near and far planes encompass the objects
                    shadow-camera-far={500}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <hemisphereLight
                    intensity={1}
                    groundColor={new THREE.Color(0xffd466)}
                    skyColor={new THREE.Color(0x170fff)}
                ></hemisphereLight>
                <Terrain
                    setBoundingBoxes={setBoundingBoxes}
                    cameraAnimationState={cameraAnimationState}
                    ortho={ortho}
                    modelRef={modelRef}
                />
                <Water useBoatPos={ortho} modelRef={modelRef} />
                {<Skybox cameraAnimationState={cameraAnimationState} />}
                {!ortho && (
                    <>
                        <FirstPersonControls
                            makeDefault
                            lookSpeed={0.2}
                            movementSpeed={1}
                        />
                    </>
                )}
                <BoatControls
                    ortho={ortho}
                    modelRef={modelRef}
                    boundingBoxes={boundingBoxes}
                />
            </Canvas>
        </>
    );
}

export default function () {
    const [wasmLoaded, setWasmLoaded] = useState(false);
    useEffect(() => {
        const loadWasm = async () => {
            await initWasm();
            setWasmLoaded(true);
        };
        loadWasm();
    });
    return wasmLoaded ? <Scene /> : <div>Wasm loading...</div>;
}
