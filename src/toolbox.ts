import * as THREE from "./three/build/three.module.js"
import { Button } from "./button.js"
import { TerrainControl } from "./terraincontrol.js"

export class Toolbox extends THREE.Mesh {
	control: TerrainControl
	buttons: THREE.Mesh[]

	constructor() {
		super(
			new THREE.BoxGeometry(0.5, 1.0, 0.1),
			new THREE.MeshPhongMaterial({color:0xffff00}),
		)
		const button1 = new Button(0.05, 0xffffff)
		button1.position.set(-0.15, 0.3, 0.1)
		button1.addEventListener("select", () => {
			console.log("walk")
		})
		const button2 = new Button(0.05, 0x000000)
		button2.position.set(0.15, 0.3, 0.1)
		button2.addEventListener("select", () => {
			this.visible = false
			this.control.mode = "transform"
		})
		this.add(button1)
		this.add(button2)
		this.buttons = [button1, button2]
	}
}