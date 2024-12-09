import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

const loader = new GLTFLoader()
export async function loadModel(path) {
	return new Promise((resolve, reject) => {
		loader.load(path, data => resolve(data), null, reject)
	})
}