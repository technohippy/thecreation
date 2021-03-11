import * as THREE from "./three/build/three.module.js"

export class FlatGeometry extends THREE.BufferGeometry {
	constructor(width=1, height=1, widthSegments=1, heightSegments=1) {
		super()
		this.type = 'FlatGeometry'

		this.parameters = {
			width: width,
			height: height,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
		}

		const width_half = width / 2
		const height_half = height / 2

		const gridX = Math.floor(widthSegments)
		const gridZ = Math.floor(heightSegments)

		const gridX1 = gridX + 1
		const gridZ1 = gridZ + 1

		const segment_width = width / gridX
		const segment_height = height / gridZ

		//

		const indices = []
		const vertices = []
		const normals = []
		const uvs = []

		for (let iz = 0; iz < gridZ1; iz++) {
			const z = iz * segment_height - height_half
			for (let ix = 0; ix < gridX1; ix++) {
				const x = ix * segment_width - width_half
				vertices.push(x, 0, z)
				normals.push(0, 1, 0)
				uvs.push(ix % 2)
				uvs.push(iz % 2)
			}
		}

		for (let iz = 0; iz < gridZ; iz++) {
			for (let ix = 0; ix < gridX; ix++) {
				const a = ix + gridX1 * iz
				const b = ix + gridX1 * (iz + 1)
				const c = (ix + 1) + gridX1 * (iz + 1)
				const d = (ix + 1) + gridX1 * iz

				indices.push(a, b, d)
				indices.push(b, c, d)
			}
		}

		this.setIndex(indices)
		this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
		this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
		this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
	}
}