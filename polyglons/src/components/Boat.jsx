import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { getIsland } from './Terrain.js';
import { PARAMS, SCENE_DIMENSION } from '../utils/constants.js';
import { AnimationMixer } from 'three';

const BoatControls = ({ ortho, boundingBoxes, modelRef }) => {
    const velocity = useRef({ x: 0, y: 0, z: 0 }); // speed
    const acceleration = 0.02; // speed increment
    const damping = 0.9; // dampening factor to slow down
    const activeKeys = useRef({}); // active keys map
    const targetQuaternion = useRef(new THREE.Quaternion()); // use quaternions for shortest path (otherwise boat may rotate the wrong way)
    const [initialized, setInitialized] = useState(false);
    const { scene, animations } = useGLTF('./models/boat_2.gltf');
    const mixerRef = useRef();
    scene.scale.set(0.2, 0.2, 0.2);

    // boat animation handling
    useEffect(() => {
        if (animations && animations.length > 0) {
            const mixer = new AnimationMixer(scene);
            mixerRef.current = mixer;

            // play first animation by default
            const action = mixer.clipAction(animations[0]);
            action.play();

            // clean up mixer
            return () => {
                mixer.stopAllAction();
                mixer.dispose();
            };
        }
    }, [animations, scene]);

    // update the mixer on each frame
    useFrame((_, delta) => {
        if (mixerRef.current) {
            mixerRef.current.update(delta); // Advance the animation
        }
    });

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

    // boat positioning
    useEffect(() => {
        // bounding boxes not fully populated yet
        if (boundingBoxes.length != PARAMS.numIslands * 2) {
            return;
        }

        // randomly position boat
        let x, z;
        do {
            x = Math.random() * SCENE_DIMENSION - SCENE_DIMENSION / 2;
            z = Math.random() * SCENE_DIMENSION - SCENE_DIMENSION / 2;
            console.log(x, z, getIsland(x, z, boundingBoxes));
        } while (getIsland(x, z, boundingBoxes));

        scene.position.set(x, 0, z);
        setInitialized(true);
    }, [boundingBoxes]);

    // rotation and velocity calculation
    useFrame(() => {
        if (modelRef.current && ortho) {
            const vel = velocity.current;
            const euler = new THREE.Euler();
            let newRotation = false;
            // adjust velocity depending on keys pressed
            if (activeKeys.current['w'] || activeKeys.current['ArrowUp']) {
                vel.x -= acceleration;
                vel.z += acceleration;
                euler.set(0, (7 * Math.PI) / 4.0, 0);
                newRotation = true;
            }
            if (activeKeys.current['s'] || activeKeys.current['ArrowDown']) {
                vel.x += acceleration;
                vel.z -= acceleration;
                euler.set(0, (3 * Math.PI) / 4.0, 0);
                newRotation = true;
                // modelRef.current.rotation.set(0, 1.6, 0);
            }
            if (activeKeys.current['d'] || activeKeys.current['ArrowRight']) {
                vel.x -= acceleration;
                vel.z -= acceleration;
                euler.set(0, (5 * Math.PI) / 4, 0);
                newRotation = true;
                // targetRotation.current = { x: 0, y: Math.PI, z: 0 };
                // modelRef.current.rotation.set(0, 3.14, 0);
            }
            if (activeKeys.current['a'] || activeKeys.current['ArrowLeft']) {
                vel.x += acceleration;
                vel.z += acceleration;
                euler.set(0, (1 * Math.PI) / 4, 0);
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
                    boundingBoxes
                )
            ) {
                // update the boat's position
                modelRef.current.position.x += vel.x;
                modelRef.current.position.y += vel.y;
                modelRef.current.position.z += vel.z;
            }
        }
    });
    return initialized ? <primitive ref={modelRef} object={scene} /> : null;
};

export default BoatControls;
