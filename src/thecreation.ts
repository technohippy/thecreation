import * as THREE from "./three/build/three.module.js"
import { VRButton } from "./three/examples/jsm/webxr/VRButton.js"
import { Dolly } from "./dolly.js"
import { Terrain } from "./terrain.js"
import { TerrainControl } from "./terraincontrol.js"

export type TheCreationConfig = {
	containerId:string,
}

const transformMinRange = 1
const transformMaxRange = 10
const transformMaxHeight = 10

export class TheCreation {
	#scene: THREE.Scene
	#dolly: Dolly
	#renderer: THREE.WebGLRenderer
	#terrain: Terrain
	#terrainControl: TerrainControl
	#terrainPointer: THREE.Mesh
	#transformRange: number
	#moveControl: TerrainControl
	#movePointer: THREE.Mesh

	constructor(config:TheCreationConfig) {
		this.#scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.#dolly = new Dolly(camera)
		this.#terrain = new Terrain(50, 50)
		this.#renderer = new THREE.WebGLRenderer({canvas:document.getElementById(config.containerId)});
		this.#renderer.setSize(window.innerWidth, window.innerHeight);
		this.#renderer.setClearColor(new THREE.Color(0.3, 0.5, 1))
		this.#renderer.xr.enabled = true

		this.#terrainControl = new TerrainControl(this.#dolly, this.#renderer.xr, 0)
		this.#terrainPointer = new THREE.Mesh(
			new THREE.SphereGeometry(1),
			new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity: 0.5})
		)
		this.#setTransformRange((transformMinRange + transformMaxRange) / 2)

		this.#moveControl = new TerrainControl(this.#dolly, this.#renderer.xr, 1)
		this.#movePointer = new THREE.Mesh(
			new THREE.SphereGeometry(0.1),
			new THREE.MeshBasicMaterial({color:0x0000ff, transparent:true, opacity: 0.5})
		)

		this.#initScene()
		this.#setupControls()
	}

	#initScene = () => {
		const light = new THREE.DirectionalLight(0xffffff, 1.5)
		light.position.set(1, 0.5, -0.8)

		const light2 = new THREE.DirectionalLight(0xffffff, 0.8)
		light2.position.set(-0.9, 0.4, 0.9)

		this.#scene.add(light)
		this.#scene.add(light2)
		this.#scene.add(this.#terrain)
		this.#scene.add(this.#dolly)
		this.#scene.add(this.#terrainPointer)
		this.#scene.add(this.#movePointer)
	}

	#setupControls = () => {
		// 地形操作
		this.#terrainControl.addEventListener("always", (control, intersects, position, direction) => {
			// 地形操作ポインタ表示
			if (0 < intersects.length) {
				this.#terrainPointer.position.copy(intersects[0].point)
			} else {
				this.#terrainPointer.position.copy(position)
				this.#terrainPointer.position.add(direction.clone().multiplyScalar(20))
			}
		})

		this.#terrainControl.addEventListener("selected&squeezed", (control, intersects, position, direction) => {
			// 地形操作ポインタ切り替え
			this.#terrainPointer.visible = !this.#terrainPointer.visible
		})

		this.#terrainControl.addEventListener("selected", (control, intersects, position, direction) => {
			if (!this.#terrainPointer.visible) return

			if (0 < intersects.length) {
				// 盛り上げる
				const intersect = intersects[0]
				this.#terrain.transform(intersect, this.#transformRange, transformMaxHeight, 1)
			} else {
				// 操作範囲を大きく
				this.#setTransformRange(Math.min(this.#transformRange + 0.01, transformMaxRange))
			}
		})

		this.#terrainControl.addEventListener("squeezed", (control, intersects, position, direction) => {
			if (!this.#terrainPointer.visible) return

			if (0 < intersects.length) {
				// 凹ませる
				const intersect = intersects[0]
				this.#terrain.transform(intersect, this.#transformRange, transformMaxHeight, -1)
			} else {
				// 操作範囲を小さく
				this.#setTransformRange(Math.max(this.#transformRange - 0.01, transformMinRange))
			}
		})

		// 移動
		this.#moveControl.addEventListener("always", (control, intersects, position, direction) => {
			// 移動ポインタ表示
			if (0 < intersects.length) {
				const intersect = intersects[0]
				this.#movePointer.position.copy(intersect.point)
			} else {
				this.#movePointer.position.copy(position)
				this.#movePointer.position.add(direction.clone().multiplyScalar(10))
			}
		})

		this.#moveControl.addEventListener("selected&squeezed", (control, intersects, position, direction) => {
			// 回転
			if (0 < intersects.length) {
				const intersect = intersects[0]
				const direction = new THREE.Vector2(intersect.point.x, intersect.point.z)
				direction.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z))
				direction.normalize()
				const speed = 0.01

				const cameraDirection2 = new THREE.Vector2(direction.x, direction.z)
				let angle = Math.acos(direction.dot(cameraDirection2)/direction.length()/cameraDirection2.length())
				if (0 < direction.cross(cameraDirection2)) {
					control.dolly.rotation.y += speed * angle
				} else {
					control.dolly.rotation.y -= speed * angle
				}
			}
		})

		this.#moveControl.addEventListener("selected", (control, intersects, position, direction) => {
			if (0 < intersects.length) {
				// 前進
				const intersect = intersects[0]
				const direction = new THREE.Vector2(intersect.point.x, intersect.point.z)
				direction.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z))
				direction.normalize()
				const speed = 0.05

				control.dolly.position.x += direction.x * speed
				control.dolly.position.z += direction.y * speed
			} else {
				// 上昇
				const speed = 0.05
				control.dolly.position.y += speed
			}
		})

		this.#moveControl.addEventListener("squeezed", (control, intersects, position, direction) => {
			// 後退
			if (0 < intersects.length) {
				const intersect = intersects[0]
				const direction = new THREE.Vector2(intersect.point.x, intersect.point.z)
				direction.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z))
				direction.normalize()
				const speed = 0.05

				control.dolly.position.x -= direction.x * speed
				control.dolly.position.z -= direction.y * speed
			} else {
				// 下降
				const speed = 0.05
				control.dolly.position.y -= speed
			}
		})
	}

	#setTransformRange = (val:number) => {
		this.#transformRange = val
		this.#terrainPointer.scale.x = this.#transformRange / 2
		this.#terrainPointer.scale.y = this.#transformRange / 2
		this.#terrainPointer.scale.z = this.#transformRange / 2
	}

	createVRButton(container:HTMLElement) {
		container.appendChild(VRButton.createButton(this.#renderer))
	}

	start() {
		this.#renderer.setAnimationLoop(() => {
			this.#step()
			this.#renderer.render(this.#scene, this.#dolly.camera)
		})
	}

	#step = () => {
		this.#terrainControl.handleEvent(this.#terrain)
		this.#moveControl.handleEvent(this.#terrain)
	}
}