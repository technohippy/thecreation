import * as THREE from "./three/build/three.module.js"
import { VRButton } from "./three/examples/jsm/webxr/VRButton.js"
import { Dolly } from "./dolly.js"
import { Terrain } from "./terrain.js"
import { TerrainControl } from "./terraincontrol.js"
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
		this.#dolly.rightControl = this.#createTransformControl()
		this.#dolly.leftControl = this.#createMoveControl()
		this.#initScene()
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
		this.#scene.add(this.#dolly.rightControl.pointer)
		this.#scene.add(this.#dolly.leftControl.pointer)
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

	#createTransformControl = (): TerrainControl => {
		const transformPointer = new THREE.Mesh(
			new THREE.SphereGeometry(1, 32, 32),
			new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity: 0.5})
		)
		const transformControl = new TerrainControl(this.#dolly, transformPointer, this.#renderer.xr, 0)

		const transformControlMode = new TransformControlMode(this.#terrain, this.#dolly)
		transformControlMode.transformRangeMin = 1
		transformControlMode.transformRangeMax = 20
		transformControlMode.transformRange = 10
		transformControlMode.transformMaxHeight = 10
		transformControl.addMode("transform", transformControlMode)
		transformControl.mode = "transform"

		const scale = transformControlMode.transformRange / 2
		transformControl.pointer.scale.x = scale
		transformControl.pointer.scale.y = scale
		transformControl.pointer.scale.z = scale

		const toolboxControlMode = new ToolboxControlMode(this.#terrain, this.#dolly)
		transformControl.addMode("toolbox", toolboxControlMode)
		return transformControl
	}

	#createMoveControl = (): TerrainControl => {
		const movePointer = new THREE.Mesh(
			new THREE.SphereGeometry(0.1),
			new THREE.MeshBasicMaterial({color:0x0000ff, transparent:true, opacity: 0.5})
		)
		const moveControl = new TerrainControl(this.#dolly, movePointer, this.#renderer.xr, 1)

		const moveControlMode = new MoveControlMode(this.#terrain, this.#dolly)
		moveControl.addMode("move", moveControlMode)
		moveControl.mode = "move"
		return moveControl
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
		this.#dolly.handleEvent(this.#terrain)

		this.#focus.position.copy(this.#dolly.focusPoint(this.#terrain, 10))
	}
}