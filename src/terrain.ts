import * as THREE from "./three/build/three.module.js"
import { TerrainMaterial } from "./tarrainmaterial.js"

export class Terrain extends THREE.Mesh {
	#width:number
	#height:number
	#segmentsWidth:number
	#segmentsHeight:number

	constructor(width:number, height:number, segmentsWidth=100, segmentsHeight=100) {
		super(
			new THREE.PlaneGeometry(width, height, segmentsWidth, segmentsHeight),
			new TerrainMaterial(),
		)
		this.#width = width
		this.#height = height
		this.#segmentsWidth = segmentsWidth
		this.#segmentsHeight = segmentsHeight

		this.rotation.x = -Math.PI / 2

		const water = new THREE.Mesh(
			new THREE.PlaneGeometry(width, height),
			new THREE.MeshStandardMaterial({color: 0xbbbbff, opacity: 0.8, transparent:true})
		)
		water.position.z = -0.01
		this.add(water)
	}

	transform(intersect:any, radius:number, maxHeight:number, direction:number) {
		radius = Math.floor(radius)
		const position = this.geometry.getAttribute("position")
		const [base, basePoint] = this.#getNearestFaceVertex(position, intersect)
		const transformSpeed = 0.03 * radius
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				const len = Math.sqrt(dx * dx + dy * dy)
				if (len < radius) {
					const coeff = (Math.cos(len / radius * Math.PI) + 1) / 2 * (direction < 0 ? -1 : 1)
					const pid = base + dx * 101 + dy
					const z = position.getZ(pid)
					position.setZ(pid, Math.min(z + 0.01 * coeff, maxHeight))
				}
			}
		}
		position.needsUpdate = true
		this.geometry.computeVertexNormals()
	}

	#getNearestFaceVertex = (position:THREE.BufferAttribute, intersect:any) => {
		const point = intersect.point
		const face = intersect.face

		let nearestDist = Number.POSITIVE_INFINITY
		let nearestPoint
		let nearestId
		for (let pid of [face.a, face.b, face.c]) {
			const vertex = this.#getFaceVertex(position, pid)
			const dist = point.distanceTo(vertex)
			if (dist < nearestDist) {
				nearestPoint = point
				nearestId = pid
			}
		}
		return [nearestId, nearestPoint]
	}

	#getFaceVertex = (position:THREE.BufferAttribute, id:number) => {
		return new THREE.Vector3(position.getX(id), position.getY(id), position.getZ(id))
	}
}