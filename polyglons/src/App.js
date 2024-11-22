// import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  FlyControls,
  FirstPersonControls,
  DragControls,
  PointerLockControls,
} from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// https://sbcode.net/react-three-fiber/gltfloader/
function CameraPosition() {
  const { camera } = useThree();
  useEffect(() => {
    const logPosition = () => {
      console.log(`Camera Position:`, camera.position); // Logs the camera position
    };
    const interval = setInterval(logPosition, 1000); // Log every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, [camera]);
}
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

function Box() {
  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial
        color="blue"
        specular="#882"
        roughness="0.0"
        // diffuse="#"
        // emissive="#afa"
      />
    </mesh>
  );
} // https://threejs.org/docs/#api/en/objects/Mesh
// https://threejs.org/docs/#api/en/core/BufferGeometry
// https://threejs.org/docs/#api/en/loaders/ObjectLoader
// https://threejs.org/docs/#examples/en/loaders/OBJLoader
// https://medium.com/geekculture/how-to-control-three-js-camera-like-a-pro-a8575a717a2

// first person camera https://www.youtube.com/watch?v=oqKzxPMLWxo
// third person camera https://www.youtube.com/watch?v=UuNPHOJ_V5o
function App() {
  const gltf = useLoader(GLTFLoader, "./models/i_love_graphics.glb");

  return (
    <Canvas>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity="300" />
      <CoolTube />

      <primitive
        object={gltf.scene}
        position={[0, 1, 0]}
        children-0-castShadow
      />
      <GlowingSphere />
      <EffectComposer>
        <Bloom intensity={2} luminanceThreshold={0} luminanceSmoothing={0.9} />
      </EffectComposer>
      <PointerLockControls dragToLook={true} lookSpeed={0.05} />
      <FlyControls autoForward={false} movementSpeed={2} />
    </Canvas>
  );
}

export default App;
