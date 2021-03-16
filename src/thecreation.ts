import * as THREE from "./three/build/three.module.js"
import { VRButton } from "./three/examples/jsm/webxr/VRButton.js"
import { Dolly } from "./dolly.js"
import { Terrain } from "./terrain.js"
import { TerrainControl } from "./terraincontrol.js"
import { FirstPersonControls } from './three/examples/jsm/controls/FirstPersonControls.js'
import { Sky } from './three/examples/jsm/objects/Sky.js';
import { TransformControlMode, MoveControlMode, ToolboxControlMode } from "./controlmode.js"

export type TheCreationConfig = {
	containerId:string,
}

export class TheCreation {
	#scene: THREE.Scene
	#dolly: Dolly
	#focus: THREE.Mesh
	#renderer: THREE.WebGLRenderer
	#terrain: Terrain
	#transformControl: TerrainControl
	#moveControl: TerrainControl

	constructor(config:TheCreationConfig) {
		const clearColor = new THREE.Color(0.3, 0.5, 1)
		this.#scene = new THREE.Scene()
		//this.#scene.fog = new THREE.Fog(clearColor, 60, 150)

		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.#dolly = new Dolly(camera)
		this.#dolly.position.y = 5
		this.#focus = new THREE.Mesh(
			new THREE.SphereGeometry(0.1),
			new THREE.MeshBasicMaterial({color:0x00ff00}),
		)

		this.#terrain = new Terrain([
			{position:-100, color:new THREE.Vector3(0, 0, 0)},
			{position:-10, color:new THREE.Vector3(0, 0, 0)},
			{position:-3, color:new THREE.Vector3(0, 0, 255)},
			{position:0, color:new THREE.Vector3(199, 226, 140)},
			{position:0.5, color:new THREE.Vector3(199, 226, 140)},
			{position:6, color:new THREE.Vector3(254, 231, 134)},
			{position:8, color:new THREE.Vector3(170, 116, 42)},
			{position:10, color:new THREE.Vector3(255, 255, 255)},
			{position:100, color:new THREE.Vector3(255, 255, 255)},
		], 50, 50)
		this.#renderer = new THREE.WebGLRenderer({canvas:document.getElementById(config.containerId)});
		this.#renderer.setSize(window.innerWidth, window.innerHeight);
		this.#renderer.setClearColor(clearColor)
		this.#renderer.xr.enabled = true

		this.#initSky()

		const transformPointer = new THREE.Mesh(
			new THREE.SphereGeometry(1, 32, 32),
			new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity: 0.5})
		)
		this.#transformControl = new TerrainControl(this.#dolly, transformPointer, this.#renderer.xr, 0)

		const movePointer = new THREE.Mesh(
			new THREE.SphereGeometry(0.1),
			new THREE.MeshBasicMaterial({color:0x0000ff, transparent:true, opacity: 0.5})
		)
		this.#moveControl = new TerrainControl(this.#dolly, movePointer, this.#renderer.xr, 1)

		this.#initScene()
		this.#setupTransformControl()
		this.#setupMoveControl()
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
		this.#scene.add(this.#focus)
		this.#scene.add(this.#transformControl.pointer)
		this.#scene.add(this.#moveControl.pointer)
	}

	#initSky = () => {
		const inclination = 0.333
		const azimuth = 0.25
		const sun = new THREE.Vector3()
		const theta = Math.PI * (inclination - 0.5)
		const phi = 2 * Math.PI * (azimuth - 0.5)
		sun.x = Math.cos(phi)
		sun.y = Math.sin(phi) * Math.sin(theta)
		sun.z = Math.sin(phi) * Math.cos(theta)
		const sky = new Sky()
		sky.scale.setScalar(450000)
		sky.material.uniforms["rayleigh"].value = 0.85
		sky.material.uniforms["turbidity"].value = 10
		sky.material.uniforms["mieCoefficient"].value = 0.005
		sky.material.uniforms["mieDirectionalG"].value = 0.7
		sky.material.uniforms["sunPosition"].value = sun
		this.#scene.add(sky)
		this.#renderer.outputEncoding = THREE.sRGBEncoding
		this.#renderer.toneMapping = THREE.ACESFilmicToneMapping
		this.#renderer.toneMappingExposure = 0.5
	}

	#setupTransformControl = () => {
		const transformControlMode = new TransformControlMode(this.#terrain, this.#dolly)
		transformControlMode.transformRangeMin = 1
		transformControlMode.transformRangeMax = 20
		transformControlMode.transformRange = 10
		transformControlMode.transformMaxHeight = 10
		this.#transformControl.addMode("transform", transformControlMode)
		this.#transformControl.mode = "transform"

		const scale = transformControlMode.transformRange / 2
		this.#transformControl.pointer.scale.x = scale
		this.#transformControl.pointer.scale.y = scale
		this.#transformControl.pointer.scale.z = scale

		const toolboxControlMode = new ToolboxControlMode(this.#terrain, this.#dolly, this.#dolly.toolbox)
		this.#transformControl.addMode("toolbox", toolboxControlMode)
	}

	#setupMoveControl = () => {
		const moveControlMode = new MoveControlMode(this.#terrain, this.#dolly)
		this.#moveControl.addMode("mode", moveControlMode)
		this.#moveControl.mode = "mode"
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
		this.#transformControl.handleEvent(this.#terrain)
		this.#moveControl.handleEvent(this.#terrain)

		this.#focus.position.copy(this.#dolly.focusPoint(this.#terrain, 10))
	}

	startForDebug() {
		setTimeout(() => {
			document.getElementById("VRButton").style.display = "none"
		})
		let stop = false
		this.#renderer.xr.enabled = false
		const raycaster = new THREE.Raycaster()

		const keydownListener = (evt) => {
			if (evt.code === "Space") {
				const position = this.#dolly.camera.getWorldPosition(new THREE.Vector3())
				const direction = this.#transformControl.pointer.position.clone()
				direction.sub(position)
				direction.normalize()
				raycaster.set(position, direction)
				const intersects = raycaster.intersectObject(this.#terrain)

				if (0 < intersects.length) {
					const intersect = intersects[0]
					if (evt.shiftKey) {
						// 凹ませる
						this.#terrain.transform(intersect, this.#transformControl.transformRange, this.#transformControl.transformMaxHeight, -1)
					} else {
						// 盛り上げる
						this.#terrain.transform(intersect, this.#transformControl.transformRange, transformMaxHeight, 1)
					}
				} else {
					/*
					if (evt.shiftKey) {
						// 操作範囲を小さく
						this.#setTransformRange(Math.max(this.#transformControl.transformRange - 0.02, transformMinRange))
					} else {
						// 操作範囲を大きく
						this.#setTransformRange(Math.min(this.#transformControl.transformRange + 0.02, transformMaxRange))
					}
					*/
				}
			} else if (evt.code === "KeyZ") {
				// 終わり
				stop = true
				this.#renderer.domElement.removeEventListener("keydown", keydownListener)
				control.enabled = false

				this.#dolly.position.set(0, 5, 0)
				this.#dolly.rotation.set(0, 0, 0)
				this.#dolly.camera.position.set(0, 0, 0)
				this.#dolly.camera.rotation.set(0, 0, 0)
				this.#renderer.xr.enabled = true
				this.start()
				document.getElementById("VRButton").style.display = "block"
			}
		}

		this.#renderer.domElement.addEventListener("keydown", keydownListener)

		const control = new FirstPersonControls(this.#dolly, this.#renderer.domElement)
		control.movementSpeed = 0.5;
		control.lookSpeed = 0.05;

		const clock = new THREE.Clock()
		const step = () => {
			this.#step()
			this.#renderer.render(this.#scene, this.#dolly.camera)
			window.requestAnimationFrame(() => {
				control.update(clock.getDelta())
				if (!stop) step()
			})
		}
		step()
	}
}