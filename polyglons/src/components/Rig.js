import { useThree, useFrame, Camera } from '@react-three/fiber';
import * as THREE from 'three';
import { getHeight } from './Island';

/**
 * @typedef {Object} AnimationState
 * @property {THREE.Vector3} position 
 * @property {THREE.Quaternion} quaternion 
 * @property {THREE.Matrix4} projectionMatrix 
*/

/**
 * @typedef {Object} AnimationStatePair
 * @property {AnimationState} start 
 * @property {AnimationState} end 
 * @property {number} animationStart
 * @property {boolean} ortho
*/

/**
 * 
 * @param {float} x
 * @param {THREE.Matrix4} out_min 
 * @param {THREE.Matrix4} out_max 
 */
function lerpMatrix(x, out_min, out_max) {
    const ret = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
        ret[i] = out_min.elements[i] + x * (out_max.elements[i] - out_min.elements[i]);
    }
    return new THREE.Matrix4(...ret).transpose();
}

/**
 * 
 * @param {float} x
 * @param {THREE.Vector3} out_min 
 * @param {THREE.Vector3} out_max 
 */
function lerpVector(x, out_min, out_max) {
    out_min = [...out_min];
    out_max = [...out_max];
    const ret = new Float32Array(3);
    for (let i = 0; i < 3; i++) {
        ret[i] = out_min[i] + x * (out_max[i] - out_min[i]);
    }
    return new THREE.Vector3(...ret);
}

const animationDuration = 1000.0;

/**
 * 
 * @param {AnimationStatePair | undefined} pair
 * @returns {boolean} boolean
 */
export function animationInProgress(pair) {
    return pair 
        && document.timeline.currentTime <= pair.animationStart + animationDuration; 
}

/**
 * 
 * @param {boolean} ortho 
 * @param {Camera} camera 
 * @param {boolean} appStart 
 * @returns {AnimationStatePair}
 */
function makeAnimationState(ortho, camera, appStart) {
    const start = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        projectionMatrix: camera.projectionMatrix.clone(),
    };

    let end;
    if (ortho) {
        const cam = camera.clone();
        cam.position.copy(new THREE.Vector3(20.0, 10.0, -20.0));
        cam.lookAt(0.0, 5.0, 0.0);
        cam.projectionMatrix.makeOrthographic(-50, 50, 50, -50, -1000, 1000);
        end = {
            quaternion: cam.quaternion,
            position: cam.position,
            projectionMatrix: cam.projectionMatrix,
        };
    } else {
        const projectionMatrix = (new THREE.PerspectiveCamera()).projectionMatrix;
        const cam = camera.clone();
        cam.position.copy(new THREE.Vector3(20.0, 10.0, -20.0));
        cam.lookAt(0.0, 5.0, 0.0);
        end = {
            quaternion: cam.quaternion,
            position: cam.position,
            projectionMatrix,
        };
    }

    const animationStart = appStart ? -1e7 : document.timeline.currentTime;
    return {start, end, animationStart, ortho};
}


/**
 * Rig function to handle camera setup and animation
 * 
 * @param {Object} param0 
 * @param {boolean} param0.ortho 
 * @param {AnimationStatePair} param0.cameraAnimationState 
 * @param {function} param0.setCameraAnimationState 
  * @param {} param0.boundingBoxes 

 */
export default function Rig({ ortho, cameraAnimationState, setCameraAnimationState, boundingBoxes }) {
    const { camera } = useThree();

    let state;
    if (!cameraAnimationState) {
        state = makeAnimationState(ortho, camera.clone(), true); 
        setCameraAnimationState(state);
    } else if (ortho !== cameraAnimationState.ortho) {
        state = makeAnimationState(ortho, camera.clone(), false); 
        setCameraAnimationState(state);
    } else {
        state = cameraAnimationState;
    }

    useFrame(() => {
        camera.position.y = 1 + Math.max(0.0, getHeight(camera.position.x, camera.position.z, boundingBoxes));
        const progress = (document.timeline.currentTime - state.animationStart) / animationDuration;
        if (0 <= progress && progress <= 1.0) {
            const curve = ortho 
                ? Math.sqrt(1 - Math.pow(progress - 1, 2))  
                : 1 - Math.sqrt(1 - Math.pow(progress, 2));

            camera.position.copy(
                lerpVector(curve, state.start.position, state.end.position));

            camera.quaternion.slerpQuaternions(
                state.start.quaternion, state.end.quaternion, curve);

            camera.projectionMatrix.copy(
                lerpMatrix(curve, state.start.projectionMatrix, state.end.projectionMatrix));

            camera.updateMatrixWorld(true);
        }

    });
}

