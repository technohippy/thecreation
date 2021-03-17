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
var _camera;
import * as THREE from "./three/build/three.module.js";
export class Dolly extends THREE.Object3D {
    constructor(camera) {
        super();
        _camera.set(this, void 0);
        __classPrivateFieldSet(this, _camera, camera);
        this.add(__classPrivateFieldGet(this, _camera));
    }
    getCamera() {
        return __classPrivateFieldGet(this, _camera);
    }
}
_camera = new WeakMap();
//# sourceMappingURL=movablecamera.js.map