import './css/App.css';
import './css/style.css';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import {
    FlyControls,
    FirstPersonControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import Skybox from './components/Skybox';
import initWasm from './polyglons-wasm/polyglons_wasm';
import BoatControls from './components/Boat.jsx';
import Water from './components/Water';
import Rig from './components/Rig';
import Terrain from './components/Terrain';
import Controls from './components/Controls';

// https://sbcode.net/react-three-fiber/gltfloader/
// https://threejs.org/docs/#api/en/objects/Mesh
// https://threejs.org/docs/#api/en/core/BufferGeometry
// https://threejs.org/docs/#api/en/loaders/ObjectLoader
// https://threejs.org/docs/#examples/en/loaders/OBJLoader
// https://medium.com/geekculture/how-to-control-three-js-camera-like-a-pro-a8575a717a2
// const texture = useLoader(THREE.TextureLoader, "./daniel_ritchie_face.jpg");
// https://sbcode.net/react-three-fiber/use-loader/

// first person camera https://www.youtube.com/watch?v=oqKzxPMLWxo
// third person camera https://www.youtube.com/watch?v=UuNPHOJ_V5o
// music https://www.youtube.com/watch?v=T43D0M8kHFw
// playlist https://www.youtube.com/watch?v=oKJ2EZnnZRE&list=PL93EE6DF71E5913A7

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
            <Canvas>
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
                <Water 
                    useBoatPos={ortho}
                    modelRef={modelRef}
                />
                {<Skybox cameraAnimationState={cameraAnimationState} />}
                {!ortho && (
                    <>
                        <FirstPersonControls makeDefault lookSpeed={0.2} movementSpeed={1} />
                    </>
                )}
                <BoatControls ortho={ortho}
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
