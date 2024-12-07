import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { SCENE_DIMENSION } from '../utils/constants';
import { useLoader, useThree } from '@react-three/fiber';

export default function Skybox() {
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

    scene.background = texture;

    return <></>;
}
