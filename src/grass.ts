import * as THREE from "./three/build/three.module.js"
import { GrassMaterial } from "./grassmaterial.js"

export class Grass extends THREE.Mesh {
	constructor(geom:THREE.Geometry) {
		super()

		for (let i = 0; i < 20; i++) {
			const mesh = new THREE.Mesh(
				//new THREE.PlaneGeometry(3, 3),
				geom,
				new GrassMaterial("noise.png", 0.8 + i / 100),
			)
			//mesh.rotation.x = Math.PI/3
			mesh.position.z = i / 10
			this.add(mesh)
		}
	}
}