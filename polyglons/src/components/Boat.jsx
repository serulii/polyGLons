import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

export default function BoatControls() {
    const { scene } = useThree();
    generateBoat(scene);
    return <></>;
}

function generateBoat(scene) {
    const loader = new GLTFLoader();
    loader.load(
        './models/boat.gltf',
        (gltf) => {
            gltf.scene.scale.set(0.2, 0.2, 0.2);
            scene.add(gltf.scene);
        },
        undefined,
        (error) => {
            console.error(error);
        }
    );
    // To add multiple types of objects, call again with different loaded object
    //   loader.load(
    //     "./models/cactus1.glb",
    //     (gltf) => {
    //       addSingleObjectType(scene, gltf);
    //     },
    //     undefined,
    //     (error) => {
    //       console.error(error);
    //     }
    //   );
}
