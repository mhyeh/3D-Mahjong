import * as Three from "three";
import Tile from "./Tile";
import ImageTileTable from "./ImageTileTable";

export default class ImageTile extends Tile<ImageTileTable> {
    // protected symbolTable: MultiLayerStyleSymbolTable;
    private tileSize: Three.Vector3;

    public get tileWidth(): number {
        return this.tileSize.x;
    }

    public get tileHeight(): number {
        return this.tileSize.y;
    }

    public get imageWidth(): number {
        return this.width;
    }

    public get imageHeight(): number {
        return this.height;
    }

    constructor(tileTable: ImageTileTable) {
        super(tileTable, tileTable.spriteKey);
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
            this.position = position.clone();
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
            // this.frameName = spriteNumber;
            this.setFrames(spriteNumber, spriteNumber, spriteNumber, spriteNumber);
        } else if (typeof spriteNumber === "number") {
            // this.frame = spriteNumber;
            this.setFrames(spriteNumber, spriteNumber, spriteNumber, spriteNumber);
        }
        this.visible = spriteNumber !== null;
    }
}
