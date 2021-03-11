import * as THREE from "./three/build/three.module.js"
import { GrassMaterial } from "./grassmaterial.js"

export class Grass extends THREE.Mesh {
	constructor(geom:THREE.Geometry) {
		super()

		const th = 0.4
		for (let i = 0; i < 20; i++) {
			//grass color: 0xc3e48c
			const mat = new GrassMaterial(0xb3e47c, "noise.png", th + (0.8-th)*i/20),
			const mesh = new THREE.Mesh(geom, mat)
			mesh.position.y = i / 100
			this.add(mesh)
		}
	}
}