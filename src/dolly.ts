import * as THREE from "./three/build/three.module.js"

export class Dolly extends THREE.Object3D {
	camera: THREE.Camera
	#raycaster: THREE.Raycaster

	constructor(camera: THREE.Camera) {
		super()

		this.camera = camera
		this.add(this.camera)

		this.#raycaster = new THREE.Raycaster()
	}

	getDirection(): THREE.Vector3 {
		const direction = new THREE.Vector3(0, 0, -1)
		const cameraMat = new THREE.Matrix4().makeRotationFromEuler(this.camera.rotation)
		const dollyMat = new THREE.Matrix4().makeRotationFromEuler(this.rotation)
		const rotation = dollyMat.multiply(cameraMat)
		direction.applyMatrix4(rotation)
		direction.normalize()
		return direction
	}

	focusPoint(target:THREE.Mesh, length:number): THREE.Vector3 {
		const direction = this.getDirection()
		this.#raycaster.set(this.position, direction)
		let intersects = this.#raycaster.intersectObject(target)
		if (intersects.length === 0) {
			const focus = this.position.clone()
			focus.add(direction.clone().multiplyScalar(length))
			return focus
		} else {
			return intersects[0].point
		}
	}
}