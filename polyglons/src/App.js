// import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// import { MeshPhongMaterial } from "three";

function Box() {
  return (
    <mesh>
      <sphereGeometry args={[5, 64, 64]} />
      <meshPhongMaterial color="blue" specular="#882" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
