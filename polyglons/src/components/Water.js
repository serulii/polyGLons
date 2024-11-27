import * as THREE from 'three';
import React from 'react';
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

    const time_millis = document.timeline.currentTime;
    const buf = new THREE.InterleavedBuffer(
        water_buf(time_millis),
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

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', position);
    geometry.setAttribute('color', color);

    const requestRef = React.useRef();

    const animate = () => {
        requestRef.current = requestAnimationFrame(animate);
        const time_millis = document.timeline.currentTime;
        const newBuf = new THREE.InterleavedBuffer(
            water_buf(time_millis),
            water_buf_stride_floats()
        );
        buf.copy(newBuf);
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    };

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return <mesh geometry={geometry} material={material} />;
}
