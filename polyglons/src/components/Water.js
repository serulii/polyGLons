import * as THREE from 'three';
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SCENE_DIMENSION } from '../utils/constants.js'

import {
    water_buf_position_size,
    water_buf_position_offset,
    water_buf_color_offset,
    water_buf_color_size,
    water_buf,
    water_buf_stride_floats,
} from '../polyglons-wasm/polyglons_wasm';

export default function () {
    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        wireframe: false,
        flatShading: true,
        specular: new THREE.Color(0x000055),
    });

    const height_scale = 0.5;
    const water_radius = SCENE_DIMENSION / 2.0;
    const blue = new Float32Array([0.4, 0.79, 0.72]);
    const green = new Float32Array([0.13, 0.45, 0.53]);

    const { camera } = useThree();

    const get_buf = () => {
        const time_millis = document.timeline.currentTime;
        const position = new Float32Array([...camera.position]);
        return water_buf(
            time_millis, 
            height_scale, 
            water_radius, 
            position,
            blue, 
            green
        );
    };

    const geometry = new THREE.BufferGeometry();

    const updateWater = () => {
        const buf = new THREE.InterleavedBuffer(
            get_buf(),
            water_buf_stride_floats()
        );
        const position = new THREE.InterleavedBufferAttribute(
            buf,
            water_buf_position_size(),
            water_buf_position_offset()
        );
        const color = new THREE.InterleavedBufferAttribute(
            buf,
            water_buf_color_size(),
            water_buf_color_offset()
        );
    
        geometry.setAttribute('position', position);
        geometry.setAttribute('color', color);    
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    };

    useFrame(() => {
        updateWater();
    });

    return <mesh geometry={geometry} material={material} />;
}
