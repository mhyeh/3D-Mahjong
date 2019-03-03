import * as Three from "three";

export default class Cube extends Three.Mesh {
    private tintvalue: number;
    private size: Three.Vector3;

    public get width(): number {
        return this.size.x;
    }

    public get height(): number {
        return this.size.y;
    }

    public get depth(): number {
        return this.size.z;
    }

    public get tint(): number {
        return this.tintvalue;
    }

    public set tint(value: number) {
        this.tintvalue = value;
        if (this.material instanceof Array) {
            this.material.forEach((m) => this.setMaterialTint(m, value));
        } else if (this.material instanceof Three.MeshBasicMaterial || this.material instanceof Three.MeshLambertMaterial ||
                   this.material instanceof Three.MeshStandardMaterial || this.material instanceof Three.MeshPhongMaterial) {
            const color = this._color.clone();
            this.material.color.set(color.multiply(new Three.Color(value)));
        }
        this.children.forEach((child) => {
            if (child instanceof Cube) {
                child.tint = value;
            }
        });
    }

    private _color: Three.Color;

    constructor(geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material[], x: number = 0, y: number = 0, z: number = 0) {
        material = material || new Three.Material();
        super(geometry, material);
        this.position.set(x, y, z);
        this.tintvalue = 0xFFFFFF;
        this.size = new Three.Vector3();
        new Three.Box3().setFromObject(this).getSize(this.size);

        if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
            material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
            this._color = material.color.clone();
        }
    }

    public ResetSize() {
        new Three.Box3().setFromObject(this).getSize(this.size);
    }

    private setMaterialTint(material: Three.Material | Three.Material[], tint: number) {
        if (material instanceof Array) {
            material.forEach((m) => this.setMaterialTint(m, tint));
        } else if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
                   material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
            const color = this._color.clone();
            material.color.set(color.multiply(new Three.Color(tint)));
        }
    }
}
