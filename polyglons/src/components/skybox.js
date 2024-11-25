import * as THREE from 'three';
import { useRef, useEffect } from "react";

function createSkybox() {

    let materialArray = [];

    let texture_bk = new THREE.TextureLoader().load("./Daylight Box_Back.bmp");
    let texture_bt = new THREE.TextureLoader().load("./Daylight Box_Bottom.bmp");
    let texture_ft = new THREE.TextureLoader().load("./Daylight Box_Front.bmp");
    let texture_lt = new THREE.TextureLoader().load("./Daylight Box_Left.bmp");
    let texture_rt = new THREE.TextureLoader().load("./Daylight Box_Right.bmp");
    let texture_tt = new THREE.TextureLoader().load("./Daylight Box_Top.bmp");

    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt, side: THREE.BackSide }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lt, side: THREE.BackSide }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_tt, side: THREE.BackSide }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bt, side: THREE.BackSide }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft, side: THREE.BackSide }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk, side: THREE.BackSide }));    

    let skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
    let skybox = new THREE.Mesh(skyboxGeometry, materialArray);

    return skybox;
}

export default function Skybox() {
    const skyboxRef = useRef();
  
    useEffect(() => {
      const skybox = createSkybox();
      skyboxRef.current.add(skybox);
    }, []);
  
    return <mesh ref={skyboxRef} />;
  }