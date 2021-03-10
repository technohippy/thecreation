import * as THREE from "./three/build/three.module.js"

export class Dolly extends THREE.Object3D {
	camera: THREE.Camera

	constructor(camera: THREE.Camera) {
		super()

		this.camera = camera
		this.add(this.camera)
	}
}