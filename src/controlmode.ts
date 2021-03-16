import * as THREE from "./three/build/three.module.js"
import { Terrain } from "./terrain.js";
import { TerrainControl } from "./terraincontrol.js";
import { Dolly } from "./dolly.js";

export interface TerrainControlMode {
	handleAlwaysEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3)
	handleSelectedAndSqueezedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3)
	handleSelectedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3)
	handleSqueezedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3)
}

export class TransformControlMode implements TerrainControlMode {
	#raycaster: THREE.Raycaster
	terrain:Terrain
	dolly:Dolly
	transformRange:number
	transformRangeMin:number
	transformRangeMax:number
	transformMaxHeight:number

	constructor(terrain:Terrain, dolly:Dolly) {
		this.#raycaster = new THREE.Raycaster()
		this.terrain = terrain
		this.dolly = dolly
		this.transformRangeMin = 1
		this.transformRangeMax = 20
		this.transformMaxHeight = 10
		this.transformRange = (this.transformRangeMin + this.transformRangeMax) / 2
	}

	handleAlwaysEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		// 地形操作ポインタ表示
		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
		if (0 < intersects.length) {
			control.pointer.position.copy(intersects[0].point)
			this.#validateDollyPosition()
		} else {
			control.pointer.position.copy(origin)
			control.pointer.position.add(direction.clone().multiplyScalar(20))
		}
	}

	handleSelectedAndSqueezedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		// 地形操作ポインタ表示／非表示
		control.visible = !control.visible
	}

	handleSelectedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		if (!control.pointer.visible) return

		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
		if (0 < intersects.length) {
			// 盛り上げる
			const intersect = intersects[0]
			this.terrain.transform(intersect, this.transformRange, this.transformMaxHeight, 1)
			this.#validateDollyPosition()
		} else {
			// 操作範囲を大きく
			this.#setTransformRange(Math.min(this.transformRange + 0.02, this.transformRangeMax), control.pointer)
		}
	}

	handleSqueezedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		if (!control.pointer.visible) return

		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
		if (0 < intersects.length) {
			// 凹ませる
			const intersect = intersects[0]
			this.terrain.transform(intersect, this.transformRange, this.transformMaxHeight, -1)
			this.#validateDollyPosition()
		} else {
			// 操作範囲を大きく
			this.#setTransformRange(Math.min(this.transformRange - 0.02, this.transformRangeMax), control.pointer)
		}
	}

	#setTransformRange = (val:number, pointer:THREE.Mesh) => {
		this.transformRange = val
		pointer.scale.x = this.transformRange / 2
		pointer.scale.y = this.transformRange / 2
		pointer.scale.z = this.transformRange / 2
	}

	#validateDollyPosition = () => {
		const height = this.terrain.heightAt(this.dolly.position)
		if (this.dolly.position.y < height) {
			this.dolly.position.y = height
		}
	}
}

export class MoveControlMode implements TerrainControlMode {
	#raycaster: THREE.Raycaster
	terrain:Terrain
	dolly:Dolly

	constructor(terrain:Terrain, dolly:Dolly) {
		this.#raycaster = new THREE.Raycaster()
		this.terrain = terrain
		this.dolly = dolly
	}

	handleAlwaysEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		// 移動ポインタ表示
		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
		if (0 < intersects.length) {
			const intersect = intersects[0]
			control.pointer.position.copy(intersect.point)
		} else {
			control.pointer.position.copy(origin)
			control.pointer.position.add(direction.clone().multiplyScalar(10))
		}
	}

	handleSelectedAndSqueezedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		// 回転
		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
		if (0 < intersects.length) {
			const intersect = intersects[0]
			const pointerDirection = new THREE.Vector2(intersect.point.x, intersect.point.z)
			pointerDirection.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z))
			pointerDirection.normalize()
			const speed = 0.01

			const dollyDirection3 = this.dolly.getDirection()
			const dollyDirection = new THREE.Vector2(dollyDirection3.x, dollyDirection3.z)
			let angle = Math.acos(pointerDirection.dot(dollyDirection))
			if (0 < pointerDirection.cross(dollyDirection)) {
				control.dolly.rotation.y += speed * angle
			} else {
				control.dolly.rotation.y -= speed * angle
			}
		}
	}

	handleSelectedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
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

		this.#validateDollyPosition()
	}

	handleSqueezedEvent(control:TerrainControl, origin:THREE.Vector3, direction:THREE.Vector3) {
		this.#raycaster.set(origin, direction)
		const intersects = this.#raycaster.intersectObject(this.terrain)
		if (0 < intersects.length) {
			// 後退
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

		this.#validateDollyPosition()
	}

	#validateDollyPosition = () => {
		const height = this.terrain.heightAt(this.dolly.position)
		if (this.dolly.position.y < height) {
			this.dolly.position.y = height
		}
	}
}