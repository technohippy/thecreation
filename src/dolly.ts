import * as THREE from "./three/build/three.module.js"
import { TerrainControl } from "./terraincontrol.js"

export class Dolly extends THREE.Object3D {
	camera: THREE.Camera
	#rightControl: TerrainControl
	#leftControl: TerrainControl
	#toolbox: THREE.Mesh
	#raycaster: THREE.Raycaster

	constructor(camera: THREE.Camera) {
		super()

		this.camera = camera
		this.add(this.camera)

		this.#toolbox = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 1.0, 0.1),
			new THREE.MeshPhongMaterial({color:0xffff00}),
		)
		this.#toolbox.position.set(0, 1, -1)
		this.#toolbox.rotation.x = -Math.PI / 6
		this.hideToolbox()
		this.add(this.#toolbox)

		this.#raycaster = new THREE.Raycaster()
	}

	showToolbox() {
		//console.log("show toolbox")
		//this.#toolbox.lookAt(this.camera.position)
		this.#toolbox.visible = true
	}

	hideToolbox() {
		this.#toolbox.visible = false
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