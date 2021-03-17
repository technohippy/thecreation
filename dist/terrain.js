var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _width, _height, _widthSegments, _heightSegments, _getNearestFaceVertex, _getFaceVertex;
import * as THREE from "./three/build/three.module.js";
import { TerrainMaterial } from "./tarrainmaterial.js";
import { Grass } from "./grass.js";
import { FlatGeometry } from "./flatgeometry.js";
import { Reflector } from './three/examples/jsm/objects/Reflector.js';
export class Terrain extends THREE.InstancedMesh {
    constructor(gradation, width, height, widthSegments = 100, heightSegments = 100, instanceSize = 0) {
        super(new FlatGeometry(width, height, widthSegments, heightSegments), new TerrainMaterial(gradation), Math.pow(instanceSize * 2 + 1, 2));
        _width.set(this, void 0);
        _height.set(this, void 0);
        _widthSegments.set(this, void 0);
        _heightSegments.set(this, void 0);
        _getNearestFaceVertex.set(this, (position, intersect) => {
            const point = intersect.point;
            const face = intersect.face;
            let nearestDist = Number.POSITIVE_INFINITY;
            let nearestPoint;
            let nearestId;
            for (let pid of [face.a, face.b, face.c]) {
                const vertex = __classPrivateFieldGet(this, _getFaceVertex).call(this, position, pid);
                const dist = point.distanceTo(vertex);
                if (dist < nearestDist) {
                    nearestPoint = point;
                    nearestId = pid;
                }
            }
            return [nearestId, nearestPoint];
        });
        _getFaceVertex.set(this, (position, id) => {
            return new THREE.Vector3(position.getX(id), position.getY(id), position.getZ(id));
        });
        __classPrivateFieldSet(this, _width, width);
        __classPrivateFieldSet(this, _height, height);
        __classPrivateFieldSet(this, _widthSegments, widthSegments);
        __classPrivateFieldSet(this, _heightSegments, heightSegments);
        const dummy = new THREE.Object3D();
        for (let dz = -instanceSize; dz <= instanceSize; dz++) {
            for (let dx = -instanceSize; dx <= instanceSize; dx++) {
                dummy.position.set(dx * __classPrivateFieldGet(this, _width), dz * __classPrivateFieldGet(this, _height), 0);
                dummy.updateMatrix();
                const index = (dz + instanceSize) * (instanceSize * 2 + 1) + (dx + instanceSize);
                this.setMatrixAt(index, dummy.matrix);
            }
        }
        // water
        const flatGeom = new THREE.PlaneGeometry(width * (instanceSize * 2 + 1), height * (instanceSize * 2 + 1));
        const water = new Reflector(flatGeom, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0x778899
        });
        water.rotateX(-Math.PI / 2);
        water.position.y = -0.01;
        this.add(water);
        // back water
        const backWater = new THREE.Mesh(new FlatGeometry(width * (instanceSize * 2 + 1), height * (instanceSize * 2 + 1)), new THREE.MeshStandardMaterial({ color: 0xddeeff, opacity: 0.8, transparent: true, side: THREE.BackSide }));
        backWater.position.y = -0.1;
        this.add(backWater);
        // grass
        const grass = new Grass(this.geometry);
        grass.position.y = 0.1;
        this.add(grass);
    }
    heightAt(p) {
        const segmentWidth = __classPrivateFieldGet(this, _width) / (__classPrivateFieldGet(this, _widthSegments) + 1);
        const segmentHeight = __classPrivateFieldGet(this, _height) / (__classPrivateFieldGet(this, _heightSegments) + 1);
        const x = Math.floor((p.x + __classPrivateFieldGet(this, _width) / 2) / segmentWidth);
        const z = Math.floor((p.z + __classPrivateFieldGet(this, _height) / 2) / segmentHeight);
        const clamp = (v, min, max) => Math.max(Math.min(v, max), min);
        const position = this.geometry.getAttribute("position");
        let height = Number.NEGATIVE_INFINITY;
        for (let dz = -1; dz <= 1; dz++) {
            const zz = clamp(z + dz, 0, __classPrivateFieldGet(this, _heightSegments));
            for (let dx = -1; dx <= 1; dx++) {
                const xx = clamp(x + dx, 0, __classPrivateFieldGet(this, _widthSegments));
                const pid = zz * (__classPrivateFieldGet(this, _widthSegments) + 1) + xx;
                const h = position.getY(pid);
                if (height < h)
                    height = h;
            }
        }
        return height;
    }
    transform(intersect, radius, maxHeight, direction) {
        radius = Math.floor(radius);
        const position = this.geometry.getAttribute("position");
        const [base, basePoint] = __classPrivateFieldGet(this, _getNearestFaceVertex).call(this, position, intersect);
        const transformSpeed = 0.03 * radius;
        for (let dz = -radius; dz <= radius; dz++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const len = Math.sqrt(dx * dx + dz * dz);
                if (len < radius) {
                    const coeff = (Math.cos(len / radius * Math.PI) + 1) / 2 * (direction < 0 ? -1 : 1);
                    const pid = base + dx * (__classPrivateFieldGet(this, _widthSegments) + 1) + dz;
                    const y = position.getY(pid);
                    position.setY(pid, Math.min(y + 0.01 * coeff, maxHeight));
                }
            }
        }
        position.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }
}
_width = new WeakMap(), _height = new WeakMap(), _widthSegments = new WeakMap(), _heightSegments = new WeakMap(), _getNearestFaceVertex = new WeakMap(), _getFaceVertex = new WeakMap();
//# sourceMappingURL=terrain.js.map