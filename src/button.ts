import * as THREE from "./three/build/three.module.js"

export class Button extends THREE.Mesh {
	#handlers = new Map<string, (() => void)[]>()

	constructor(size:number, color:number) {
		super(
			new THREE.SphereGeometry(size, 16, 16),
			new THREE.MeshPhongMaterial({color:color}),
		)
	}

	addEventListener(event:string, handler:() => void) {
		if (!this.#handlers.get(event)) {
			this.#handlers.set(event, [])
		}
		this.#handlers.get(event).push(handler)
	}

	fireEvent(event:string) {
		this.#handlers.get(event).forEach(h => h())
	}
}
