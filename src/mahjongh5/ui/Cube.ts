import * as Three from "three";

export default class Cube extends Three.Mesh {
    private size: Three.Vector3;

    public get width(): number {
        new Three.Box3().setFromObject(this).getSize(this.size);
        return this.size.x;
    }

    public get height(): number {
        new Three.Box3().setFromObject(this).getSize(this.size);
        return this.size.y;
    }

    public get depth(): number {
        new Three.Box3().setFromObject(this).getSize(this.size);
        return this.size.z;
    }

    constructor(geometry: Three.Geometry | Three.BufferGeometry, material: Three.Material | Three.Material[], x: number = 0, y: number = 0, z: number = 0) {
        super(geometry, material);
        this.position.set(x, y, z);
        this.size = new Three.Vector3();
    }
}
