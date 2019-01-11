import * as Three from "three";
import { Signal } from "@robotlegsjs/signals";
import TileTable from "./TileTable";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";

export default abstract class Tlie<TileTableType extends TileTable = TileTable> extends Button {
    public isClick = false;
    public color: string;
    public uuid:  string;
    protected tileTable: TileTableType;

    private _id: string;
    private idChangedSignal: Signal;

    public get ID(): string {
        return this._id;
    }
    public set ID(value: string) {
        this._id = value;
        this.OnIDChangedHandler();
    }

    public get onIDChanged(): Signal {
        if (!this.idChangedSignal) {
            this.idChangedSignal = new Signal();
        }
        return this.idChangedSignal;
    }

    constructor(game: Game, geometry: Three.Geometry | Three.BufferGeometry, material: Three.Material | Three.Material[], tileTable: TileTableType, x?: number, y?: number, z?: number, key?: string) {
        super(game, geometry, material, x, y, z);
        this.tileTable = tileTable;
    }

    public abstract AdjustTile(anchor?: Three.Vector3, scale?: Three.Vector3, position?: Three.Vector3): void;

    protected OnIDChangedHandler(): void {
        if (this.idChangedSignal) {
            this.idChangedSignal.dispatch(this, this.id);
        }
    }
}
