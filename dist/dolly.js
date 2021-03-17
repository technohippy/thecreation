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
var _rightControl, _leftControl, _raycaster;
import * as THREE from "./three/build/three.module.js";
import { Toolbox } from "./toolbox.js";
export class Dolly extends THREE.Object3D {
    constructor(camera) {
        super();
        _rightControl.set(this, void 0);
        _leftControl.set(this, void 0);
        _raycaster.set(this, void 0);
        this.camera = camera;
        this.add(this.camera);
        this.toolbox = new Toolbox();
        this.toolbox.position.set(0, 1, -1);
        this.toolbox.rotation.x = -Math.PI / 6;
        this.hideToolbox();
        this.add(this.toolbox);
        __classPrivateFieldSet(this, _raycaster, new THREE.Raycaster());
    }
    showToolbox() {
        //console.log("show toolbox")
        //this.#toolbox.lookAt(this.camera.position)
        this.toolbox.visible = true;
    }
    hideToolbox() {
        this.toolbox.visible = false;
    }
    getDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        const cameraMat = new THREE.Matrix4().makeRotationFromEuler(this.camera.rotation);
        const dollyMat = new THREE.Matrix4().makeRotationFromEuler(this.rotation);
        const rotation = dollyMat.multiply(cameraMat);
        direction.applyMatrix4(rotation);
        direction.normalize();
        return direction;
    }
    focusPoint(target, length) {
        const direction = this.getDirection();
        __classPrivateFieldGet(this, _raycaster).set(this.position, direction);
        let intersects = __classPrivateFieldGet(this, _raycaster).intersectObject(target);
        if (intersects.length === 0) {
            const focus = this.position.clone();
            focus.add(direction.clone().multiplyScalar(length));
            return focus;
        }
        else {
            return intersects[0].point;
        }
    }
}
_rightControl = new WeakMap(), _leftControl = new WeakMap(), _raycaster = new WeakMap();
//# sourceMappingURL=dolly.js.map