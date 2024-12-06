import './css/App.css';
import './css/style.css';
import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { FlyControls, PointerLockControls, FirstPersonControls } from '@react-three/drei';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { generateObjects } from './components/objectGen';
import Skybox from './components/skybox';
import initWasm from './polyglons-wasm/polyglons_wasm';
import Water from './components/Water';
import AudioPlayer from './components/audio';

// import CustomCamera from './components/CustomCamera'

// import { FirstPersonCamera } from './components/CustomCamera';

import * as dat from 'dat.gui';
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
    const [gameView, setGameView] = useState(false);
    const [params, setParams] = useState({
        scale: 10,
        octaves: 8,
        lacunarity: 2.0,
        persistence: 1.0,
        exponentiation: 3.0,
        height: 5.5,
        radius: 20,
    });
    const scene = new THREE.Scene();

    

    useEffect(() => {
        const gui = new dat.GUI();
        gui.add(params, 'scale', 0, 10)
            .name('Scale')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, scale: value }))
            );
        gui.add(params, 'octaves', 1, 8, 1)
            .name('Octaves')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, octaves: value }))
            );
        gui.add(params, 'lacunarity', 1, 3)
            .step(0.1)
            .name('Lacunarity')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, lacunarity: value }))
            );
        gui.add(params, 'persistence', 0, 1)
            .step(0.01)
            .name('Persistence')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, persistence: value }))
            );
        gui.add(params, 'exponentiation', 0.1, 5)
            .step(0.1)
            .name('Exponentiation')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, exponentiation: value }))
            );
        gui.add(params, 'height', 0, 100)
            .name('Height')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, height: value }))
            );

        gui.add(params, 'radius', 0, 100)
            .name('Radius')
            .onChange((value) =>
                setParams((prev) => ({ ...prev, radius: value }))
            );

        return () => gui.destroy();
    }, [params]);

    generateObjects(scene);
    return (
      <>
      <Controls/>
      <button className="button" onClick={() => setGameView(!gameView)}>Change View</button>
      <Canvas>
      {/* <Rig  
        left={-50}
        right={50}
        top={50}
        bottom={-50}
        near={0}
        far={100}
        /> */}
      {gameView && (
          <OrthographicCamera
            left={-50}
            right={50}
            top={50}
            bottom={-50}
            near={0}
            far={100}
            position={[0, 20, 40]}
            zoom={0.3}
            makeDefault
            onUpdate={(self) => self.lookAt(0, 0, 0)}
          />
        )}
        {!gameView && (
          <Skybox/>
        )}
          <ambientLight intensity={0} />
          <directionalLight intensity={1} />
          <hemisphereLight
            intensity={1}
            groundColor={'ffd466'}
            skyColor={'170fff'}>
          </hemisphereLight>
          <Terrain params={params} />
          <Water />

                {/* <primitive
              object={scene}
              position={[0, 1, 0]}
              children-0-castShadow
          /> */}
                <EffectComposer>
                    <Bloom
                        intensity={0}
                        luminanceThreshold={0}
                        luminanceSmoothing={0.9}
                    />
                </EffectComposer>
                <FirstPersonControls lookSpeed={0.2} />
                <FlyControls autoForward={false} movementSpeed={2} />
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
