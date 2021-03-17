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
var _raycaster, _controller, _grip, _hand, _line, _modes;
import * as THREE from "./three/build/three.module.js";
import { XRControllerModelFactory } from './three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from './three/examples/jsm/webxr/XRHandModelFactory.js';
import { NullControlMode } from "./controlmode.js";
export class TerrainControl {
    constructor(dolly, pointer, xr, index) {
        _raycaster.set(this, void 0);
        _controller.set(this, void 0);
        _grip.set(this, void 0);
        _hand.set(this, void 0);
        _line.set(this, void 0);
        this.mode = "default";
        _modes.set(this, void 0);
        __classPrivateFieldSet(this, _raycaster, new THREE.Raycaster());
        this.dolly = dolly;
        this.pointer = pointer;
        __classPrivateFieldSet(this, _controller, xr.getController(index));
        __classPrivateFieldGet(this, _controller).addEventListener('selectstart', () => { __classPrivateFieldGet(this, _controller).userData.selected = true; });
        __classPrivateFieldGet(this, _controller).addEventListener('selectend', () => { __classPrivateFieldGet(this, _controller).userData.selected = false; });
        __classPrivateFieldGet(this, _controller).addEventListener('squeezestart', () => { __classPrivateFieldGet(this, _controller).userData.squeezed = true; });
        __classPrivateFieldGet(this, _controller).addEventListener('squeezeend', () => { __classPrivateFieldGet(this, _controller).userData.squeezed = false; });
        __classPrivateFieldSet(this, _grip, xr.getControllerGrip(index));
        __classPrivateFieldGet(this, _grip).add(new XRControllerModelFactory().createControllerModel(__classPrivateFieldGet(this, _grip)));
        __classPrivateFieldSet(this, _hand, xr.getHand(index));
        __classPrivateFieldGet(this, _hand).add(new XRHandModelFactory().setPath("./models/fbx/").createHandModel(__classPrivateFieldGet(this, _hand))); // TODO
        __classPrivateFieldSet(// TODO
        this, _line, new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
        ])));
        __classPrivateFieldGet(this, _line).name = 'line';
        __classPrivateFieldGet(this, _line).scale.z = 10;
        __classPrivateFieldGet(this, _controller).add(__classPrivateFieldGet(this, _line));
        this.dolly.add(__classPrivateFieldGet(this, _controller));
        this.dolly.add(__classPrivateFieldGet(this, _grip));
        this.dolly.add(__classPrivateFieldGet(this, _hand));
        __classPrivateFieldSet(this, _modes, new Map());
        __classPrivateFieldGet(this, _modes).set("default", new NullControlMode());
    }
    get visible() {
        return __classPrivateFieldGet(this, _line).visible;
    }
    set visible(val) {
        //this.#controller = val
        //this.#grip = val
        //this.#hand = val
        __classPrivateFieldGet(this, _line).visible = val;
        this.pointer.visible = val;
    }
    get position() {
        return __classPrivateFieldGet(this, _controller).position.clone();
    }
    get rotation() {
        return __classPrivateFieldGet(this, _controller).rotation.clone();
    }
    get currentMode() {
        return __classPrivateFieldGet(this, _modes).get(this.mode);
    }
    addMode(mode, handler) {
        __classPrivateFieldGet(this, _modes).set(mode, handler);
    }
    handleEvent(target) {
        const direction = new THREE.Vector3(0, 0, -1);
        const controllerMat = new THREE.Matrix4().makeRotationFromEuler(__classPrivateFieldGet(this, _controller).rotation);
        const containerMat = new THREE.Matrix4().makeRotationFromEuler(this.dolly.rotation);
        const rotation = containerMat.multiply(controllerMat);
        const position = __classPrivateFieldGet(this, _controller).position.clone().applyEuler(this.dolly.rotation).add(this.dolly.position);
        direction.applyMatrix4(rotation);
        __classPrivateFieldGet(this, _raycaster).set(position, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster).intersectObject(target);
        this.currentMode.handleAlwaysEvent(this, position, direction);
        if (__classPrivateFieldGet(this, _controller).userData.selected && __classPrivateFieldGet(this, _controller).userData.squeezed) {
            this.currentMode.handleSelectedAndSqueezedEvent(this, position, direction);
        }
        else if (__classPrivateFieldGet(this, _controller).userData.selected) {
            this.currentMode.handleSelectedEvent(this, position, direction);
        }
        else if (__classPrivateFieldGet(this, _controller).userData.squeezed) {
            this.currentMode.handleSqueezedEvent(this, position, direction);
        }
    }
}
_raycaster = new WeakMap(), _controller = new WeakMap(), _grip = new WeakMap(), _hand = new WeakMap(), _line = new WeakMap(), _modes = new WeakMap();
//# sourceMappingURL=terraincontrol.js.map