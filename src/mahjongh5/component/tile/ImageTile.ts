import * as Three from "three";
import Tile from "./Tile";
import ImageTileTable from "./ImageTileTable";
import Game from "mahjongh5/Game";

export default class ImageTile extends Tile<ImageTileTable> {
    // protected symbolTable: MultiLayerStyleSymbolTable;

    constructor(game: Game, geometry: Three.Geometry | Three.BufferGeometry, material: Three.Material | Three.Material[], tileTable: ImageTileTable, x?: number, y?: number, z?: number) {
        super(game, geometry, material, tileTable, x, y, z, tileTable.spriteKey);
        this.tileTable = tileTable;

        // this.tileSize = new Three.Vector3(tileTable.tileWidth || this.width, tileTable.tileHeight || this.height);
        if (tileTable.GetConfig(0)) {
            this.ID = tileTable.GetConfig(0).tile;
        }
    }

    public AdjustTile(anchor?: Three.Vector3, scale?: Three.Vector3, position?: Three.Vector3) {
        if (anchor) {
            // this.anchor = anchor.clone();
        }
        if (scale) {
            this.scale = scale.clone();
        }
        if (position) {
            this.position.set(position.x, position.y, position.z);
        }
    }

    public setTint(disable: number = 0xFFFFFF, down: number = 0xFFFFFF, out: number = 0xFFFFFF, over: number = 0xFFFFFF, up: number = 0xFFFFFF) {
        this.stateTint.disable = disable;
        this.stateTint.down    = down;
        this.stateTint.out     = out;
        this.stateTint.over    = over;
        this.stateTint.up      = up;
    }

    protected OnIDChangedHandler() {
        this.UpdateImages();
        super.OnIDChangedHandler();
    }

    private UpdateImages(): void {
        const spriteNumber = this.tileTable.GetSprite(this.ID);
        if (typeof spriteNumber === "string") {
            this.setFrames(spriteNumber);
        } else if (typeof spriteNumber === "number") {
            this.setFrames(spriteNumber);
        }
        this.visible = spriteNumber !== null;
    }
}
