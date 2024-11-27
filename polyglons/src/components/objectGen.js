import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'

// generate objects for scene
export function generateObjects(scene) {
    const loader = new GLTFLoader()
    loader.load(
        './models/tree.glb',
        (gltf) => {
            addSingleObjectType(scene, gltf)
        },
        undefined,
        (error) => {
            console.error(error)
        }
    )
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

// add single object
function addSingleObjectType(scene, gltf) {
    // Add multiple instances of the model at random positions
    for (let i = 0; i < 50; i++) {
        // TODO 50 models for now
        const originalModel = gltf.scene
        const modelClone = originalModel.clone()

        const randX = (Math.random() - 0.5) * 200
        const randZ = (Math.random() - 0.5) * 200
        // Randomize position
        modelClone.position.set(
            randX, // Random X in range [-10, 10]
            0, // TODO Sample Y from perlin noise map
            randZ // Random Z in range [-10, 10]
        )

        // Randomize scale
        const scale = Math.random() * 0.5 + 0.5 // Scale between 0.5 and 1.0
        modelClone.scale.set(scale, scale, scale)

        // Randomize rotation around Y-axis
        modelClone.rotation.y = Math.random() * 2 * Math.PI

        // Add the model to the scene
        scene.add(modelClone)
    }
}
