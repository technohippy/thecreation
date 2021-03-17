var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _controller;
export class TerrainControl {
    constructor(controller) {
        _controller.set(this, void 0);
        __classPrivateFieldSet(this, _controller, controller);
    }
}
_controller = new WeakMap();
//# sourceMappingURL=controller.js.map