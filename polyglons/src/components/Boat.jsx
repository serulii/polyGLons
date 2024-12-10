import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const BoatControls = () => {
    const modelRef = useRef(); // boat ref
    const velocity = useRef({ x: 0, y: 0, z: 0 }); // speed
    const acceleration = 0.02; // speed increment
    const damping = 0.9; // dampening factor to slow down

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (modelRef.current) {
                const vel = velocity.current;
                const position = modelRef.current.position;
                switch (event.key) {
                    case 'w':
                    case 'ArrowUp': // move up
                        vel.x -= acceleration;
                        position.x -= 0.1;
                        break;
                    case 's':
                    case 'ArrowDown': // move down
                        vel.x += 0.1;
                        break;
                    case 'd':
                    case 'ArrowRight': // move right
                        vel.z -= 0.1;
                        break;
                    case 'a':
                    case 'ArrowLeft': // move left
                        vel.z += 0.1;
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useFrame(() => {
        if (modelRef.current) {
            // Apply velocity with damping
            velocity.current.x *= damping;
            velocity.current.y *= damping;
            velocity.current.z *= damping;

            // Update the object's position
            modelRef.current.position.x += velocity.current.x;
            modelRef.current.position.y += velocity.current.y;
            modelRef.current.position.z += velocity.current.z;
        }
    });

    const { scene } = useGLTF('./models/boat.gltf'); // Adjust the path to your GLTF file
    scene.scale.set(0.2, 0.2, 0.2);

    return <primitive ref={modelRef} object={scene} />;
};

const Boat = () => {
    return <BoatControls />;
};

export default Boat;

// export default function BoatControls() {
//     const { scene } = useThree();
//     generateBoat(scene);
//     document.addEventListener('keydown', onKeyDown, false);
//     function onKeyDown(e) {
//         var keyCode = e.which;
//         if (keyCode == 87) {
//         }
//     }
//     return;
// }

// function generateBoat(scene) {
//     const loader = new GLTFLoader();
//     loader.load(
//         './models/boat.gltf',
//         (gltf) => {
//             gltf.scene.scale.set(0.2, 0.2, 0.2);
//             scene.add(gltf.scene);
//             return gltf.scene;
//         },
//         undefined,
//         (error) => {
//             console.error(error);
//         }
//     );
// }
