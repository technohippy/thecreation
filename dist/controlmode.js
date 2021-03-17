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
var _raycaster, _setTransformRange, _validateDollyPosition, _raycaster_1, _validateDollyPosition_1, _raycaster_2, _terrain, _dolly, _toolbox;
import * as THREE from "./three/build/three.module.js";
export class NullControlMode {
    handleAlwaysEvent(control, origin, direction) {
    }
    handleSelectedAndSqueezedEvent(control, origin, direction) {
    }
    handleSelectedEvent(control, origin, direction) {
    }
    handleSqueezedEvent(control, origin, direction) {
    }
}
export class TransformControlMode {
    constructor(terrain, dolly) {
        _raycaster.set(this, void 0);
        this.processing = false;
        _setTransformRange.set(this, (val, pointer) => {
            this.transformRange = val;
            pointer.scale.x = this.transformRange / 2;
            pointer.scale.y = this.transformRange / 2;
            pointer.scale.z = this.transformRange / 2;
        });
        _validateDollyPosition.set(this, () => {
            const height = this.terrain.heightAt(this.dolly.position);
            if (this.dolly.position.y < height) {
                this.dolly.position.y = height;
            }
        });
        __classPrivateFieldSet(this, _raycaster, new THREE.Raycaster());
        this.terrain = terrain;
        this.dolly = dolly;
        this.transformRangeMin = 1;
        this.transformRangeMax = 20;
        this.transformMaxHeight = 10;
        this.transformRange = (this.transformRangeMin + this.transformRangeMax) / 2;
    }
    handleAlwaysEvent(control, origin, direction) {
        const focusDirection = this.dolly.focusPoint(this.terrain, 10).sub(this.dolly.position);
        if (Math.PI * 3 / 4 < focusDirection.angleTo(direction)) {
            this.dolly.showToolbox();
            control.mode = "toolbox";
            return;
        }
        // 地形操作ポインタ表示
        __classPrivateFieldGet(this, _raycaster).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster).intersectObject(this.terrain);
        if (0 < intersects.length) {
            control.pointer.position.copy(intersects[0].point);
            __classPrivateFieldGet(this, _validateDollyPosition).call(this);
        }
        else {
            control.pointer.position.copy(origin);
            control.pointer.position.add(direction.clone().multiplyScalar(20));
        }
    }
    handleSelectedAndSqueezedEvent(control, origin, direction) {
        if (this.processing)
            return;
        // 地形操作ポインタ表示／非表示
        control.visible = !control.visible;
        this.processing = true;
        setTimeout(() => this.processing = false, 300);
    }
    handleSelectedEvent(control, origin, direction) {
        if (!control.pointer.visible)
            return;
        __classPrivateFieldGet(this, _raycaster).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster).intersectObject(this.terrain);
        if (0 < intersects.length) {
            // 盛り上げる
            const intersect = intersects[0];
            this.terrain.transform(intersect, this.transformRange, this.transformMaxHeight, 1);
            __classPrivateFieldGet(this, _validateDollyPosition).call(this);
        }
        else {
            // 操作範囲を大きく
            __classPrivateFieldGet(this, _setTransformRange).call(this, Math.min(this.transformRange + 0.02, this.transformRangeMax), control.pointer);
        }
    }
    handleSqueezedEvent(control, origin, direction) {
        if (!control.pointer.visible)
            return;
        __classPrivateFieldGet(this, _raycaster).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster).intersectObject(this.terrain);
        if (0 < intersects.length) {
            // 凹ませる
            const intersect = intersects[0];
            this.terrain.transform(intersect, this.transformRange, this.transformMaxHeight, -1);
            __classPrivateFieldGet(this, _validateDollyPosition).call(this);
        }
        else {
            // 操作範囲を大きく
            __classPrivateFieldGet(this, _setTransformRange).call(this, Math.min(this.transformRange - 0.02, this.transformRangeMax), control.pointer);
        }
    }
}
_raycaster = new WeakMap(), _setTransformRange = new WeakMap(), _validateDollyPosition = new WeakMap();
export class MoveControlMode {
    constructor(terrain, dolly) {
        _raycaster_1.set(this, void 0);
        _validateDollyPosition_1.set(this, () => {
            const height = this.terrain.heightAt(this.dolly.position);
            if (this.dolly.position.y < height) {
                this.dolly.position.y = height;
            }
        });
        __classPrivateFieldSet(this, _raycaster_1, new THREE.Raycaster());
        this.terrain = terrain;
        this.dolly = dolly;
    }
    handleAlwaysEvent(control, origin, direction) {
        // 移動ポインタ表示
        __classPrivateFieldGet(this, _raycaster_1).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster_1).intersectObject(this.terrain);
        if (0 < intersects.length) {
            const intersect = intersects[0];
            control.pointer.position.copy(intersect.point);
        }
        else {
            control.pointer.position.copy(origin);
            control.pointer.position.add(direction.clone().multiplyScalar(10));
        }
    }
    handleSelectedAndSqueezedEvent(control, origin, direction) {
        // 回転
        __classPrivateFieldGet(this, _raycaster_1).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster_1).intersectObject(this.terrain);
        if (0 < intersects.length) {
            const intersect = intersects[0];
            const pointerDirection = new THREE.Vector2(intersect.point.x, intersect.point.z);
            pointerDirection.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z));
            pointerDirection.normalize();
            const speed = 0.01;
            const dollyDirection3 = this.dolly.getDirection();
            const dollyDirection = new THREE.Vector2(dollyDirection3.x, dollyDirection3.z);
            let angle = Math.acos(pointerDirection.dot(dollyDirection));
            if (0 < pointerDirection.cross(dollyDirection)) {
                control.dolly.rotation.y += speed * angle;
            }
            else {
                control.dolly.rotation.y -= speed * angle;
            }
        }
    }
    handleSelectedEvent(control, origin, direction) {
        __classPrivateFieldGet(this, _raycaster_1).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster_1).intersectObject(this.terrain);
        if (0 < intersects.length) {
            // 前進
            const intersect = intersects[0];
            const direction = new THREE.Vector2(intersect.point.x, intersect.point.z);
            direction.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z));
            direction.normalize();
            const speed = 0.05;
            control.dolly.position.x += direction.x * speed;
            control.dolly.position.z += direction.y * speed;
        }
        else {
            // 上昇
            const speed = 0.05;
            control.dolly.position.y += speed;
        }
        __classPrivateFieldGet(this, _validateDollyPosition_1).call(this);
    }
    handleSqueezedEvent(control, origin, direction) {
        __classPrivateFieldGet(this, _raycaster_1).set(origin, direction);
        const intersects = __classPrivateFieldGet(this, _raycaster_1).intersectObject(this.terrain);
        if (0 < intersects.length) {
            // 後退
            const intersect = intersects[0];
            const direction = new THREE.Vector2(intersect.point.x, intersect.point.z);
            direction.sub(new THREE.Vector2(control.dolly.position.x, control.dolly.position.z));
            direction.normalize();
            const speed = 0.05;
            control.dolly.position.x -= direction.x * speed;
            control.dolly.position.z -= direction.y * speed;
        }
        else {
            // 下降
            const speed = 0.05;
            control.dolly.position.y -= speed;
        }
        __classPrivateFieldGet(this, _validateDollyPosition_1).call(this);
    }
}
_raycaster_1 = new WeakMap(), _validateDollyPosition_1 = new WeakMap();
export class ToolboxControlMode {
    constructor(terrain, dolly, toolbox) {
        _raycaster_2.set(this, void 0);
        _terrain.set(this, void 0);
        _dolly.set(this, void 0);
        _toolbox.set(this, void 0);
        __classPrivateFieldSet(this, _terrain, terrain);
        __classPrivateFieldSet(this, _dolly, dolly);
        __classPrivateFieldSet(this, _toolbox, toolbox);
        __classPrivateFieldSet(this, _raycaster_2, new THREE.Raycaster());
    }
    handleAlwaysEvent(control, origin, direction) {
    }
    handleSelectedAndSqueezedEvent(control, origin, direction) {
    }
    handleSelectedEvent(control, origin, direction) {
        __classPrivateFieldGet(this, _raycaster_2).set(origin, direction);
        console.log(__classPrivateFieldGet(this, _toolbox));
        const intersects = __classPrivateFieldGet(this, _raycaster_2).intersectObjects(__classPrivateFieldGet(this, _toolbox).buttons);
        if (0 < intersects.length) {
            const button = intersects[0].object;
            console.log(button);
            if (button.userData.type === "walking") {
                __classPrivateFieldGet(this, _terrain).scale.x = 5;
                __classPrivateFieldGet(this, _terrain).scale.y = 2;
                __classPrivateFieldGet(this, _terrain).scale.z = 5;
                __classPrivateFieldGet(this, _terrain).needsUpdate = true;
                __classPrivateFieldGet(this, _dolly).position.y = __classPrivateFieldGet(this, _terrain).heightAt(__classPrivateFieldGet(this, _dolly).position);
                __classPrivateFieldGet(this, _toolbox).visible = false;
                control.mode = "transform";
            }
            else if (button.userData.type === "back") {
                __classPrivateFieldGet(this, _toolbox).visible = false;
                control.mode = "transform";
            }
        }
    }
    handleSqueezedEvent(control, origin, direction) {
    }
}
_raycaster_2 = new WeakMap(), _terrain = new WeakMap(), _dolly = new WeakMap(), _toolbox = new WeakMap();
//# sourceMappingURL=controlmode.js.map