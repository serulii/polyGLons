import { useThree, useFrame, Camera } from '@react-three/fiber';
import * as THREE from 'three';
import { getHeight, getNearestReachableCoordinate } from './Island';
import { useEffect, useState, useRef } from 'react';

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
        ret[i] =
            out_min.elements[i] +
            x * (out_max.elements[i] - out_min.elements[i]);
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
    return (
        pair &&
        document.timeline.currentTime <= pair.animationStart + animationDuration
    );
}

const orthoCameraOffset = new THREE.Vector3(20.0, 10.0, -20.0);

/**
 *
 * @param {} modelRef
 * @returns {THREE.Vector3}
 */
function orthoCameraPosition(modelRef) {
    let boatPos = new THREE.Vector3();
    if (modelRef.current) {
        boatPos = modelRef.current.position.clone();
    }
    return boatPos.add(orthoCameraOffset);
}

/**
 *
 */
function getOrthoQuaternion() {
    const camera = new THREE.OrthographicCamera();
    camera.position.copy(orthoCameraOffset);
    camera.lookAt(0.0, 0.0, 0.0);
    return camera.quaternion;
}

/**
 * 
 * @param {boolean} ortho 
 * @param {Camera} camera 
 * @param {boolean} appStart 
 * @param {THREE.Vector3} orthoReturnPosition
 * @param {} modelRef

 * @returns {AnimationStatePair}
 */
function makeAnimationState(
    ortho,
    camera,
    appStart,
    orthoReturnPosition,
    modelRef
) {
    const start = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        projectionMatrix: camera.projectionMatrix.clone(),
    };

    let end;
    if (ortho) {
        const cam = camera.clone();
        cam.position.copy(orthoCameraPosition(modelRef));
        cam.setRotationFromQuaternion(getOrthoQuaternion());
        cam.projectionMatrix.makeOrthographic(
            (-30 * window.innerWidth) / window.innerHeight,
            (30 * window.innerWidth) / window.innerHeight,
            30,
            -30,
            -1000,
            1000
        );
        end = {
            quaternion: cam.quaternion.clone(),
            position: cam.position.clone(),
            projectionMatrix: cam.projectionMatrix.clone(),
        };
    } else {
        const projectionMatrix = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight
        ).projectionMatrix;
        const cam = camera.clone();
        cam.position.copy(orthoReturnPosition);
        cam.lookAt(modelRef.current.position);
        end = {
            quaternion: cam.quaternion.clone(),
            position: cam.position.clone(),
            projectionMatrix,
        };
    }

    const animationStart = appStart ? -1e7 : document.timeline.currentTime;
    return { start, end, animationStart, ortho };
}

/**
 * Rig function to handle camera setup and animation
 *
 * @param {Object} param0
 * @param {boolean} param0.ortho
 * @param {AnimationStatePair} param0.cameraAnimationState
 * @param {function} param0.setCameraAnimationState
 * @param {} param0.boundingBoxes
 * @param {THREE.Vector3} param0.orthoReturnPosition
 * @param {THREE.Vector3} param0.orthoReturnLooking
 *
 */

export default function Rig({
    ortho,
    setOrtho,
    setOrthoReturnPosition,
    cameraAnimationState,
    setCameraAnimationState,
    boundingBoxes,
    orthoReturnPosition,
    modelRef,
}) {
    const { camera, controls } = useThree();
    const [animationComplete, setAnimationComplete] = useState(false);
    const targetHeight = useRef(camera.position.y);
    const isOnBoat = useRef(true); // if on boat
    const isMoving = useRef(false); // whether user is moving
    const bobbingPhase = useRef(0); // phase for sine wave
    const adjustedHeight = 0.8;
    const prevPosition = useRef({
        x: camera.position.x,
        y: camera.position.y + adjustedHeight,
        z: camera.position.z,
    });

    let state;
    if (!cameraAnimationState) {
        state = makeAnimationState(
            ortho,
            camera.clone(),
            true,
            orthoReturnPosition,
            modelRef
        );
        setCameraAnimationState(state);
    } else if (ortho !== cameraAnimationState.ortho) {
        state = makeAnimationState(
            ortho,
            camera.clone(),
            false,
            orthoReturnPosition,
            modelRef
        );
        setCameraAnimationState(state);
    } else {
        state = cameraAnimationState;
    }

    useFrame((_, delta) => {
        if (!ortho) {
            // camera pos = terrain height + bobbing
            let baseHeight =
                adjustedHeight +
                Math.max(
                    0.0,
                    getHeight(
                        camera.position.x,
                        camera.position.z,
                        boundingBoxes
                    )
                );
            targetHeight.current = baseHeight;

            // lerp for smoother transitions
            const factor = 5 * delta; // can adjust :)
            baseHeight = THREE.MathUtils.lerp(
                camera.position.y,
                targetHeight.current,
                factor
            );
            if (isMoving.current) {
                const frequency = 1.5; // bobbing frequency
                const amplitude = 0.01; // bobbing height

                bobbingPhase.current += delta * frequency * Math.PI * 2;
                const offset = Math.sin(bobbingPhase.current) * amplitude;

                camera.position.y = baseHeight + offset;
            } else {
                // reset when not moving
                bobbingPhase.current = 0;
                camera.position.y = baseHeight;
            }

            if (targetHeight.current <= adjustedHeight) {
                camera.position.set(
                    prevPosition.current.x,
                    prevPosition.current.y,
                    prevPosition.current.z
                );
            } else {
                prevPosition.current = {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z,
                };
            }
        }
        const progress =
            (document.timeline.currentTime - state.animationStart) /
            animationDuration;

        let animationInProgress = false;

        if (0 <= progress) {
            if (progress <= 1.0) {
                const curve = ortho
                    ? Math.sqrt(1 - Math.pow(progress - 1, 2))
                    : 1 - Math.sqrt(1 - Math.pow(progress, 2));

                camera.position.copy(
                    lerpVector(
                        progress,
                        state.start.position,
                        state.end.position
                    )
                );

                camera.quaternion.slerpQuaternions(
                    state.start.quaternion,
                    state.end.quaternion,
                    progress
                );

                camera.projectionMatrix.copy(
                    lerpMatrix(
                        curve,
                        state.start.projectionMatrix,
                        state.end.projectionMatrix
                    )
                );
                animationInProgress = true;
            } else if (!animationComplete) {
                camera.position.copy(state.end.position);
                camera.quaternion.copy(state.end.quaternion);
                if (controls) {
                    controls.setOrientation();
                }
                camera.projectionMatrix.copy(state.end.projectionMatrix);
                setAnimationComplete(true);
                animationInProgress = true;
            }
        }

        if (ortho && !animationInProgress) {
            camera.position.copy(orthoCameraPosition(modelRef));
            camera.quaternion.copy(getOrthoQuaternion());
        }
    });

    useEffect(() => {
        setAnimationComplete(false);
    }, [ortho]);

    // to track when user is moving
    useEffect(() => {
        function onKeyDown(event) {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
                isMoving.current = true;
            }
            if (['KeyE'].includes(event.code)) {
                setOrtho(!ortho);
                let closestCoords = getNearestReachableCoordinate(
                    modelRef.current.position.x,
                    modelRef.current.position.z,
                    boundingBoxes
                );
                setOrthoReturnPosition(
                    new THREE.Vector3(
                        closestCoords[0],
                        getHeight(
                            closestCoords[0],
                            closestCoords[1],
                            boundingBoxes
                        ) + adjustedHeight,
                        closestCoords[1]
                    )
                );
                isOnBoat.current = false;
            }
        }
        function onKeyUp(event) {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
                isMoving.current = false;
            }
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [boundingBoxes, camera.position, ortho]);
}
