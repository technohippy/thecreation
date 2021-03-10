import * as THREE from "./three/build/three.module.js"
import { TerrainMaterial } from "./tarrainmaterial.js"

export class Terrain extends THREE.Mesh {
	#width:number
	#height:number
	#widthSegments:number
	#heightSegments:number

	constructor(width:number, height:number, widthSegments=100, heightSegments=100) {
		super(
			new THREE.PlaneGeometry(width, height, widthSegments, heightSegments),
			new TerrainMaterial(),
		)
		this.#width = width
		this.#height = height
		this.#widthSegments = widthSegments
		this.#heightSegments = heightSegments

		this.rotation.x = -Math.PI / 2

		const water = new THREE.Mesh(
			new THREE.PlaneGeometry(width, height),
			new THREE.MeshStandardMaterial({color: 0xbbbbff, opacity: 0.8, transparent:true, side: THREE.DoubleSide})
		)
		water.position.z = -0.01
		this.add(water)
	}

	heightAt(p: THREE.Vector3): number {
		const segmentWidth = this.#width / (this.#widthSegments + 1)
		const segmentHeight = this.#height / (this.#heightSegments + 1)
		const x = Math.floor((p.x + this.#width / 2) / segmentWidth)
		const z = Math.floor((p.z + this.#height / 2) / segmentHeight)

		const clamp = (v, min, max) => Math.max(Math.min(v, max), min)
		const position = this.geometry.getAttribute("position")
		let height = Number.NEGATIVE_INFINITY
		for (let dz = -1; dz <= 1; dz++) {
			const zz = clamp(z + dz, 0, this.#heightSegments)
			for (let dx = -1; dx <= 1; dx++) {
				const xx = clamp(x + dx, 0, this.#widthSegments)
				const pid = zz * (this.#widthSegments + 1) + xx
				const h = position.getZ(pid)
				if (height < h) height = h
			}
		}

		return height
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
					const pid = base + dx * (this.#widthSegments + 1) + dy
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