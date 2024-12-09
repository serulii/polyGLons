import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { animationInProgress } from './Rig';

/**
 * Rig function to handle camera setup and animation
 * 
 * @param {Object} param0 
 * @param {AnimationStatePair | undefined} param0.cameraAnimationState 
 */
export default function Skybox({ cameraAnimationState }) {
    const { scene } = useThree();

    const loader = new THREE.CubeTextureLoader();

    const texture = loader.load([
        './skybox/Daylight Box_Right.bmp',
        './skybox/Daylight Box_Left.bmp',

        './skybox/Daylight Box_Top.bmp',
        './skybox/Daylight Box_Bottom.bmp',

        './skybox/Daylight Box_Front.bmp',
        './skybox/Daylight Box_Back.bmp',
    ]);

    const skyBlue = new THREE.Color('skyblue');
    useFrame(() => {
        scene.background = animationInProgress(cameraAnimationState) ? skyBlue : texture;
    });

    return null;
}
