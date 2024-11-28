import './css/App.css';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { FlyControls, PointerLockControls, FirstPersonControls } from '@react-three/drei';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Terrain from './components/perlinTerrain';
import { generateObjects } from './components/objectGen';
import Skybox from './components/skybox';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import initWasm from './polyglons-wasm/polyglons_wasm';
import Water from './components/Water';
import AudioPlayer from './components/audio';

import * as dat from 'dat.gui';

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

    // https://threejs.org/docs/#api/en/core/BufferGeometry
    const vertices = new Float32Array([
        -1.0,
        -1.0,
        1.0, // v0
        1.0,
        -1.0,
        1.0, // v1
        1.0,
        1.0,
        1.0, // v2
        -1.0,
        1.0,
        1.0, // v3
    ]);

    const indices = [0, 1, 2, 2, 3, 0];

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    generateObjects(scene);
    // https://sbcode.net/react-three-fiber/use-loader/

    return (
      <>
      <Canvas>
      <AudioPlayer/>
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
          <directionalLight intensity={0.8} />
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
      <button className="button" onClick={() => setGameView(!gameView)}>Change View</button>
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
