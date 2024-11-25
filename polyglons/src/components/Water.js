import * as THREE from 'three';
import { water_buf, water_buf_stride_floats } from "../polyglons-wasm/polyglons_wasm"
import { water_buf_position_size, water_buf_position_offset, water_buf_color_offset, water_buf_color_size } from '../polyglons-wasm/polyglons_wasm';

export default function() {
    const buf = new THREE.InterleavedBuffer(water_buf(), water_buf_stride_floats());
    const position = new THREE.InterleavedBufferAttribute(buf, water_buf_position_size(), water_buf_position_offset());
    const color = new THREE.InterleavedBufferAttribute(buf, water_buf_color_size(), water_buf_color_offset());

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', position);
    geometry.setAttribute('color', color);

    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        wireframe: false,
        flatShading: true,
    });

    return <mesh geometry={geometry} material={material} />;
}