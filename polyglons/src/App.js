import "./css/App.css";
import React from "react";
import { Canvas } from "@react-three/fiber";
import {
  FlyControls,
  PointerLockControls,
} from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { createTerrain } from './components/perlinTerrain.js';
import { createSkybox } from "./components/skybox.js";
import init, { get_number } from "./polyglons-wasm/polyglons_wasm.js"

// https://sbcode.net/react-three-fiber/gltfloader/

// function CameraPosition() {
//   const { camera } = useThree();
//   useEffect(() => {
//     const logPosition = () => {
//       console.log(`Camera Position:`, camera.position); // Logs the camera position
//     };
//     const interval = setInterval(logPosition, 1000); // Log every second
//     return () => clearInterval(interval); // Cleanup on unmount
//   }, [camera]);
// }
function GlowingSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial emissive="blue" emissiveIntensity={2} />
    </mesh>
  );
}
// import { MeshPhongMaterial } from "three";

function CoolTube() {
  const tubeRef = useRef();

  // Define a custom curve for the tube
  class CustomSinCurve extends THREE.Curve {
    constructor(scale = 1) {
      super();
      this.scale = scale;
    }

    getPoint(t) {
      const tx = Math.sin(2 * Math.PI * t); // Sine wave in X
      const ty = Math.cos(2 * Math.PI * t); // Cosine wave in Y
      const tz = t * 5 - 2.5; // Linear movement in Z
      return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    }
  }

  // Create the tube geometry
  const curve = new CustomSinCurve(2);
  const tubularSegments = 200;
  const radius = 0.3;
  const radialSegments = 32;
  const closed = false;

  return (
    <mesh ref={tubeRef}>
      {/* TubeGeometry */}
      <tubeGeometry
        args={[curve, tubularSegments, radius, radialSegments, closed]}
      />
      {/* Material */}
      <meshStandardMaterial
        // color="#ff6347"
        emissive="blue"
        emissiveIntensity={2}
        roughness={0.5}
        metalness={0.7}
      />
    </mesh>
  );
}

function Sphere() {
  const texture = useLoader(THREE.TextureLoader, "./daniel_ritchie_face.jpg");
  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
} 


// https://threejs.org/docs/#api/en/objects/Mesh
// https://threejs.org/docs/#api/en/core/BufferGeometry
// https://threejs.org/docs/#api/en/loaders/ObjectLoader
// https://threejs.org/docs/#examples/en/loaders/OBJLoader
// https://medium.com/geekculture/how-to-control-three-js-camera-like-a-pro-a8575a717a2

// first person camera https://www.youtube.com/watch?v=oqKzxPMLWxo
// third person camera https://www.youtube.com/watch?v=UuNPHOJ_V5o
// music https://www.youtube.com/watch?v=T43D0M8kHFw
// playlist https://www.youtube.com/watch?v=oKJ2EZnnZRE&list=PL93EE6DF71E5913A7
function App() {

  const [params, setParams] = useState({
    scale: 10,
    octaves: 8,
    lacunarity: 2.0,
    persistence: 1.0,
    exponentiation: 3.0,
    height: 5.5,
  });

  useEffect(() => {
    const gui = new dat.GUI();
    gui.add(params, "scale", 0, 10).name("Scale").onChange((value) => setParams((prev) => ({ ...prev, scale: value })));
    gui.add(params, "octaves", 1, 8, 1).name("Octaves").onChange((value) => setParams((prev) => ({ ...prev, octaves: value })));
    gui.add(params, "lacunarity", 1, 3).step(0.1).name("Lacunarity").onChange((value) => setParams((prev) => ({ ...prev, lacunarity: value })));
    gui.add(params, "persistence", 0, 1).step(0.01).name("Persistence").onChange((value) => setParams((prev) => ({ ...prev, persistence: value })));
    gui.add(params, "exponentiation", 0.1, 5).step(0.1).name("Exponentiation").onChange((value) => setParams((prev) => ({ ...prev, exponentiation: value })));
    gui.add(params, "height", 0, 100).name("Height").onChange((value) => setParams((prev) => ({ ...prev, height: value })));

    return () => gui.destroy();
  }, [params]);

  const gltf = useLoader(GLTFLoader, "./models/i_love_graphics.glb");

  // https://threejs.org/docs/#api/en/core/BufferGeometry

  // const texture = useLoader(THREE.TextureLoader, "./daniel_ritchie_face.jpg");
  // https://sbcode.net/react-three-fiber/use-loader/

  init().then(() => console.log(get_number()));

  return (
    <Canvas>
      <ambientLight intensity={0} />
      <pointLight position={[0, 15, 0]} intensity="300" />
      <Terrain params={params}/>
      <Skybox/>

      <primitive
        object={gltf.scene}
        position={[0, 1, 0]}
        children-0-castShadow
      />
      <EffectComposer>
        <Bloom intensity={0} luminanceThreshold={0} luminanceSmoothing={0.9} />
      </EffectComposer>
      <PointerLockControls dragToLook={true} lookSpeed={0.05} />
      <FlyControls autoForward={false} movementSpeed={2} />
    </Canvas>
  );
}

export default App;
