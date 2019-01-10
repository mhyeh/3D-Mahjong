import * as Three from "three";

export default class Cube extends Three.Mesh {
    private box: THREE.Box3;

    public get width(): number {
        const t = new Three.Vector3();
        this.box.getSize(t);
        return t.x;
    }

    public get height(): number {
        const t = new Three.Vector3();
        this.box.getSize(t);
        return t.y;
    }

    public get depth(): number {
        const t = new Three.Vector3();
        this.box.getSize(t);
        return t.z;
    }

    constructor() {
        super();
    }
}
