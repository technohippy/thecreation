import * as THREE from "./three/build/three.module.js"
import { XRControllerModelFactory } from './three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from './three/examples/jsm/webxr/XRHandModelFactory.js';

type TerrainEvent = "always" | "selected&squeezed" | "selected" | "squeezed"

export class TerrainControl {
	#raycaster: THREE.Raycaster
	#controller: THREE.Group
	#grip: THREE.Group
	#hand: THREE.Group
	#line: THREE.Line
	dolly: THREE.Group

	#listeners = new Map<TerrainEvent, ((control:TerrainControl, intersects:any[], position:THREE.Vector3, direction:THREE.Vector3)=>void)[]>()

	get visible(): boolean {
		return this.#line.visible
	}

	set visible(val:boolean) {
		//this.#controller = val
		//this.#grip = val
		//this.#hand = val
		this.#line.visible = val
	}

	constructor(dolly:THREE.Object3D, xr: THREE.WebXRManager, index:number) {
		this.#raycaster = new THREE.Raycaster()
		this.dolly = dolly

		this.#controller = xr.getController(index)
		this.#controller.addEventListener('selectstart', () => { this.#controller.userData.selected = true } );
		this.#controller.addEventListener('selectend', () => { this.#controller.userData.selected = false } );
		this.#controller.addEventListener('squeezestart', () => { this.#controller.userData.squeezed = true } );
		this.#controller.addEventListener('squeezeend', () => { this.#controller.userData.squeezed = false } );

		this.#grip = xr.getControllerGrip(index)
		this.#grip.add(new XRControllerModelFactory().createControllerModel(this.#grip))

		this.#hand = xr.getHand(index)
		this.#hand.add(new XRHandModelFactory().setPath("./models/fbx/").createHandModel(this.#hand)) // TODO

		this.#line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1),
		]))
		this.#line.name = 'line';
		this.#line.scale.z = 10;

		this.#controller.add(this.#line)

		this.dolly.add(this.#controller)
		this.dolly.add(this.#grip)
		this.dolly.add(this.#hand)
	}

	addEventListener(event:TerrainEvent, listener:(control:TerrainControl, intersects:any[], position:THREE.Vector3, direction:THREE.Vector3) => void) {
		if (!this.#listeners.has(event)) {
			this.#listeners.set(event, [])
		}
		const listeners = this.#listeners.get(event)
		listeners.push(listener)
	}

	handleEvent(target:THREE.Mesh) {
		const direction = new THREE.Vector3(0, 0, -1)
		const controllerMat = new THREE.Matrix4().makeRotationFromEuler(this.#controller.rotation)
		const containerMat = new THREE.Matrix4().makeRotationFromEuler(this.dolly.rotation)
		const rotation = containerMat.multiply(controllerMat)
		const position = this.#controller.position.clone().applyEuler(this.dolly.rotation).add(this.dolly.position)
		direction.applyMatrix4(rotation)
		this.#raycaster.set(position, direction)
		const intersects = this.#raycaster.intersectObject(target)

		this.#listeners.get("always").forEach(listener => {
			listener(this, intersects, position.clone(), direction.clone())
		})
		if (this.#controller.userData.selected && this.#controller.userData.squeezed) {
			this.#listeners.get("selected&squeezed").forEach(listener => {
				listener(this, intersects, position, direction)
			})
		} else if (this.#controller.userData.selected) {
			this.#listeners.get("selected").forEach(listener => {
				listener(this, intersects, position, direction)
			})
		} else if (this.#controller.userData.squeezed) {
			this.#listeners.get("squeezed").forEach(listener => {
				listener(this, intersects, position, direction)
			})
		}
	}
}