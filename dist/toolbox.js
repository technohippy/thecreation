import * as THREE from "./three/build/three.module.js";
export class Toolbox extends THREE.Mesh {
    constructor() {
        super(new THREE.BoxGeometry(0.5, 1.0, 0.1), new THREE.MeshPhongMaterial({ color: 0xffff00 }));
        const button1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshPhongMaterial({ color: 0xffffff }));
        button1.position.set(-0.15, 0.3, 0.1);
        button1.userData.type = "walking";
        this.add(button1);
        const button2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshPhongMaterial({ color: 0x000000 }));
        button2.position.set(0.15, 0.3, 0.1);
        button2.userData.type = "back";
        this.add(button2);
        this.buttons = [button1, button2];
    }
}
//# sourceMappingURL=toolbox.js.map