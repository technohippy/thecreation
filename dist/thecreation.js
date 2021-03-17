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
var _scene, _dolly, _focus, _renderer, _terrain, _transformControl, _moveControl, _initScene, _initSky, _setupTransformControl, _setupMoveControl, _step;
import * as THREE from "./three/build/three.module.js";
import { VRButton } from "./three/examples/jsm/webxr/VRButton.js";
import { Dolly } from "./dolly.js";
import { Terrain } from "./terrain.js";
import { TerrainControl } from "./terraincontrol.js";
import { FirstPersonControls } from './three/examples/jsm/controls/FirstPersonControls.js';
import { Sky } from './three/examples/jsm/objects/Sky.js';
import { TransformControlMode, MoveControlMode, ToolboxControlMode } from "./controlmode.js";
export class TheCreation {
    constructor(config) {
        _scene.set(this, void 0);
        _dolly.set(this, void 0);
        _focus.set(this, void 0);
        _renderer.set(this, void 0);
        _terrain.set(this, void 0);
        _transformControl.set(this, void 0);
        _moveControl.set(this, void 0);
        _initScene.set(this, () => {
            const light = new THREE.DirectionalLight(0xffffff, 1.5);
            light.position.set(1, 0.5, -0.8);
            const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
            light2.position.set(-0.9, 0.4, 0.9);
            __classPrivateFieldGet(this, _scene).add(light);
            __classPrivateFieldGet(this, _scene).add(light2);
            __classPrivateFieldGet(this, _scene).add(__classPrivateFieldGet(this, _terrain));
            __classPrivateFieldGet(this, _scene).add(__classPrivateFieldGet(this, _dolly));
            __classPrivateFieldGet(this, _scene).add(__classPrivateFieldGet(this, _focus));
            __classPrivateFieldGet(this, _scene).add(__classPrivateFieldGet(this, _transformControl).pointer);
            __classPrivateFieldGet(this, _scene).add(__classPrivateFieldGet(this, _moveControl).pointer);
        });
        _initSky.set(this, () => {
            const inclination = 0.333;
            const azimuth = 0.25;
            const sun = new THREE.Vector3();
            const theta = Math.PI * (inclination - 0.5);
            const phi = 2 * Math.PI * (azimuth - 0.5);
            sun.x = Math.cos(phi);
            sun.y = Math.sin(phi) * Math.sin(theta);
            sun.z = Math.sin(phi) * Math.cos(theta);
            const sky = new Sky();
            sky.scale.setScalar(450000);
            sky.material.uniforms["rayleigh"].value = 0.85;
            sky.material.uniforms["turbidity"].value = 10;
            sky.material.uniforms["mieCoefficient"].value = 0.005;
            sky.material.uniforms["mieDirectionalG"].value = 0.7;
            sky.material.uniforms["sunPosition"].value = sun;
            __classPrivateFieldGet(this, _scene).add(sky);
            __classPrivateFieldGet(this, _renderer).outputEncoding = THREE.sRGBEncoding;
            __classPrivateFieldGet(this, _renderer).toneMapping = THREE.ACESFilmicToneMapping;
            __classPrivateFieldGet(this, _renderer).toneMappingExposure = 0.5;
        });
        _setupTransformControl.set(this, () => {
            const transformControlMode = new TransformControlMode(__classPrivateFieldGet(this, _terrain), __classPrivateFieldGet(this, _dolly));
            transformControlMode.transformRangeMin = 1;
            transformControlMode.transformRangeMax = 20;
            transformControlMode.transformRange = 10;
            transformControlMode.transformMaxHeight = 10;
            __classPrivateFieldGet(this, _transformControl).addMode("transform", transformControlMode);
            __classPrivateFieldGet(this, _transformControl).mode = "transform";
            const scale = transformControlMode.transformRange / 2;
            __classPrivateFieldGet(this, _transformControl).pointer.scale.x = scale;
            __classPrivateFieldGet(this, _transformControl).pointer.scale.y = scale;
            __classPrivateFieldGet(this, _transformControl).pointer.scale.z = scale;
            const toolboxControlMode = new ToolboxControlMode(__classPrivateFieldGet(this, _terrain), __classPrivateFieldGet(this, _dolly), __classPrivateFieldGet(this, _dolly).toolbox);
            __classPrivateFieldGet(this, _transformControl).addMode("toolbox", toolboxControlMode);
        });
        _setupMoveControl.set(this, () => {
            const moveControlMode = new MoveControlMode(__classPrivateFieldGet(this, _terrain), __classPrivateFieldGet(this, _dolly));
            __classPrivateFieldGet(this, _moveControl).addMode("mode", moveControlMode);
            __classPrivateFieldGet(this, _moveControl).mode = "mode";
        });
        _step.set(this, () => {
            __classPrivateFieldGet(this, _transformControl).handleEvent(__classPrivateFieldGet(this, _terrain));
            __classPrivateFieldGet(this, _moveControl).handleEvent(__classPrivateFieldGet(this, _terrain));
            __classPrivateFieldGet(this, _focus).position.copy(__classPrivateFieldGet(this, _dolly).focusPoint(__classPrivateFieldGet(this, _terrain), 10));
        });
        const clearColor = new THREE.Color(0.3, 0.5, 1);
        __classPrivateFieldSet(this, _scene, new THREE.Scene()
        //this.#scene.fog = new THREE.Fog(clearColor, 60, 150)
        );
        //this.#scene.fog = new THREE.Fog(clearColor, 60, 150)
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        __classPrivateFieldSet(this, _dolly, new Dolly(camera));
        __classPrivateFieldGet(this, _dolly).position.y = 5;
        __classPrivateFieldSet(this, _focus, new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00 })));
        __classPrivateFieldSet(this, _terrain, new Terrain([
            { position: -100, color: new THREE.Vector3(0, 0, 0) },
            { position: -10, color: new THREE.Vector3(0, 0, 0) },
            { position: -3, color: new THREE.Vector3(0, 0, 255) },
            { position: 0, color: new THREE.Vector3(199, 226, 140) },
            { position: 0.5, color: new THREE.Vector3(199, 226, 140) },
            { position: 6, color: new THREE.Vector3(254, 231, 134) },
            { position: 8, color: new THREE.Vector3(170, 116, 42) },
            { position: 10, color: new THREE.Vector3(255, 255, 255) },
            { position: 100, color: new THREE.Vector3(255, 255, 255) },
        ], 50, 50));
        __classPrivateFieldSet(this, _renderer, new THREE.WebGLRenderer({ canvas: document.getElementById(config.containerId) }));
        __classPrivateFieldGet(this, _renderer).setSize(window.innerWidth, window.innerHeight);
        __classPrivateFieldGet(this, _renderer).setClearColor(clearColor);
        __classPrivateFieldGet(this, _renderer).xr.enabled = true;
        __classPrivateFieldGet(this, _initSky).call(this);
        const transformPointer = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }));
        __classPrivateFieldSet(this, _transformControl, new TerrainControl(__classPrivateFieldGet(this, _dolly), transformPointer, __classPrivateFieldGet(this, _renderer).xr, 0));
        const movePointer = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 }));
        __classPrivateFieldSet(this, _moveControl, new TerrainControl(__classPrivateFieldGet(this, _dolly), movePointer, __classPrivateFieldGet(this, _renderer).xr, 1));
        __classPrivateFieldGet(this, _initScene).call(this);
        __classPrivateFieldGet(this, _setupTransformControl).call(this);
        __classPrivateFieldGet(this, _setupMoveControl).call(this);
    }
    createVRButton(container) {
        container.appendChild(VRButton.createButton(__classPrivateFieldGet(this, _renderer)));
    }
    start() {
        __classPrivateFieldGet(this, _renderer).setAnimationLoop(() => {
            __classPrivateFieldGet(this, _step).call(this);
            __classPrivateFieldGet(this, _renderer).render(__classPrivateFieldGet(this, _scene), __classPrivateFieldGet(this, _dolly).camera);
        });
    }
    startForDebug() {
        setTimeout(() => {
            document.getElementById("VRButton").style.display = "none";
        });
        let stop = false;
        __classPrivateFieldGet(this, _renderer).xr.enabled = false;
        const raycaster = new THREE.Raycaster();
        const keydownListener = (evt) => {
            if (evt.code === "Space") {
                const position = __classPrivateFieldGet(this, _dolly).camera.getWorldPosition(new THREE.Vector3());
                const direction = __classPrivateFieldGet(this, _transformControl).pointer.position.clone();
                direction.sub(position);
                direction.normalize();
                raycaster.set(position, direction);
                const intersects = raycaster.intersectObject(__classPrivateFieldGet(this, _terrain));
                if (0 < intersects.length) {
                    const intersect = intersects[0];
                    if (evt.shiftKey) {
                        // 凹ませる
                        __classPrivateFieldGet(this, _terrain).transform(intersect, __classPrivateFieldGet(this, _transformControl).transformRange, __classPrivateFieldGet(this, _transformControl).transformMaxHeight, -1);
                    }
                    else {
                        // 盛り上げる
                        __classPrivateFieldGet(this, _terrain).transform(intersect, __classPrivateFieldGet(this, _transformControl).transformRange, transformMaxHeight, 1);
                    }
                }
                else {
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
            }
            else if (evt.code === "KeyZ") {
                // 終わり
                stop = true;
                __classPrivateFieldGet(this, _renderer).domElement.removeEventListener("keydown", keydownListener);
                control.enabled = false;
                __classPrivateFieldGet(this, _dolly).position.set(0, 5, 0);
                __classPrivateFieldGet(this, _dolly).rotation.set(0, 0, 0);
                __classPrivateFieldGet(this, _dolly).camera.position.set(0, 0, 0);
                __classPrivateFieldGet(this, _dolly).camera.rotation.set(0, 0, 0);
                __classPrivateFieldGet(this, _renderer).xr.enabled = true;
                this.start();
                document.getElementById("VRButton").style.display = "block";
            }
        };
        __classPrivateFieldGet(this, _renderer).domElement.addEventListener("keydown", keydownListener);
        const control = new FirstPersonControls(__classPrivateFieldGet(this, _dolly), __classPrivateFieldGet(this, _renderer).domElement);
        control.movementSpeed = 0.5;
        control.lookSpeed = 0.05;
        const clock = new THREE.Clock();
        const step = () => {
            __classPrivateFieldGet(this, _step).call(this);
            __classPrivateFieldGet(this, _renderer).render(__classPrivateFieldGet(this, _scene), __classPrivateFieldGet(this, _dolly).camera);
            window.requestAnimationFrame(() => {
                control.update(clock.getDelta());
                if (!stop)
                    step();
            });
        };
        step();
    }
}
_scene = new WeakMap(), _dolly = new WeakMap(), _focus = new WeakMap(), _renderer = new WeakMap(), _terrain = new WeakMap(), _transformControl = new WeakMap(), _moveControl = new WeakMap(), _initScene = new WeakMap(), _initSky = new WeakMap(), _setupTransformControl = new WeakMap(), _setupMoveControl = new WeakMap(), _step = new WeakMap();
//# sourceMappingURL=thecreation.js.map