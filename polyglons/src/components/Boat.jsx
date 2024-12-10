import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { getIsland } from './Terrain.js';

const BoatControls = ({ ortho, boundingBoxes, modelRef }) => {
    const velocity = useRef({ x: 0, y: 0, z: 0 }); // speed
    const acceleration = 0.02; // speed increment
    const damping = 0.9; // dampening factor to slow down

    const boundingBoxesRef = useRef(boundingBoxes);

    const activeKeys = useRef({}); // active keys map
    const targetQuaternion = useRef(new THREE.Quaternion()); // use quaternions for shortest path (otherwise boat may rotate the wrong way)

    // key press handling
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (ortho) {
                activeKeys.current[event.key] = true; // key is pressed
            }
        };

        const handleKeyUp = (event) => {
            if (ortho) {
                activeKeys.current[event.key] = false; // key is no longer pressed
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // rotation and velocity calculation
    useFrame(() => {
        if (modelRef.current && ortho) {
            const vel = velocity.current;
            const euler = new THREE.Euler();
            let newRotation = false;
            // adjust velocity depending on keys pressed
            if (activeKeys.current['w'] || activeKeys.current['ArrowUp']) {
                vel.x -= acceleration;
                euler.set(0, -Math.PI / 2.0, 0);
                newRotation = true;
            }
            if (activeKeys.current['s'] || activeKeys.current['ArrowDown']) {
                vel.x += acceleration;
                euler.set(0, Math.PI / 2.0, 0);
                newRotation = true;
                // modelRef.current.rotation.set(0, 1.6, 0);
            }
            if (activeKeys.current['d'] || activeKeys.current['ArrowRight']) {
                vel.z -= acceleration;
                euler.set(0, Math.PI, 0);
                newRotation = true;
                // targetRotation.current = { x: 0, y: Math.PI, z: 0 };
                // modelRef.current.rotation.set(0, 3.14, 0);
            }
            if (activeKeys.current['a'] || activeKeys.current['ArrowLeft']) {
                vel.z += acceleration;
                euler.set(0, 0, 0);
                newRotation = true;
                // targetRotation.current = { x: 0, y: 0, z: 0 };
                // modelRef.current.rotation.set(0, 0, 0);
            }

            // convert euler to quaternion
            if (newRotation) {
                targetQuaternion.current.setFromEuler(euler);
            }

            // interpolate current rotation towards target using slerp
            modelRef.current.quaternion.slerp(targetQuaternion.current, 0.1);

            // apply velocity with damping
            vel.x *= damping;
            vel.y *= damping;
            vel.z *= damping;
            // console.log(boundingBoxesRef.current);
            if (
                !getIsland(
                    modelRef.current.position.x + vel.x,
                    modelRef.current.position.z + vel.z,
                    boundingBoxesRef.current
                )
            ) {
                // update the boat's position
                modelRef.current.position.x += vel.x;
                modelRef.current.position.y += vel.y;
                modelRef.current.position.z += vel.z;
            }
        }
    });

    const { scene } = useGLTF('./models/boat.gltf');
    scene.scale.set(0.2, 0.2, 0.2);

    return <primitive ref={modelRef} object={scene} />;
};

export default BoatControls;
