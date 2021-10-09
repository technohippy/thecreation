import * as THREE from "./three/build/three.module.js"
import { TerrainControl } from "./terraincontrol.js"
import { Toolbox } from "./toolbox.js"
import { Terrain } from "./terrain.js"

export class Dolly extends THREE.Object3D {
	camera: THREE.Camera
	toolbox: Toolbox
	#rightControl!: TerrainControl
	#leftControl!: TerrainControl
	#raycaster: THREE.Raycaster

	get rightControl(): TerrainControl {
		return this.#rightControl
	}

	set rightControl(control: TerrainControl) {
		this.#rightControl = control
		this.toolbox.control = control
	}

	get leftControl(): TerrainControl {
		return this.#leftControl
	}

	set leftControl(control: TerrainControl) {
		this.#leftControl = control
	}

	constructor(camera: THREE.Camera) {
		super()

		this.camera = camera
		this.add(this.camera)

		this.toolbox = new Toolbox()
		this.toolbox.position.set(0, 1, -1)
		this.toolbox.rotation.x = -Math.PI / 6
		this.hideToolbox()
		this.add(this.toolbox)

		this.#raycaster = new THREE.Raycaster()
	}

	showToolbox() {
		this.toolbox.visible = true
	}

	hideToolbox() {
		this.toolbox.visible = false
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

	handleEvent(terrain:Terrain) {
		this.#rightControl.handleEvent(terrain)
		this.#leftControl.handleEvent(terrain)
	}
}