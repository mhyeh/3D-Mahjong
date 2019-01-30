import * as Three from "three";
import Tile from "./Tile";
import ImageTileTable from "./ImageTileTable";
import Game from "mahjongh5/Game";

export default class ImageTile extends Tile<ImageTileTable> {
    public index: number;

    constructor(game: Game, geometry: Three.BufferGeometry, tileTable: ImageTileTable) {
        super(game, geometry, undefined, tileTable);
        if (this.tileTable.GetConfig(0)) {
            this.ID = this.tileTable.GetConfig(0).tile;
        }
    }

    public setTint(disable: number = DISABLE_TINT, down: number = DOWN_TINT, out: number = OUT_TINT, over: number = OVER_TINT, up: number = UP_TINT) {
        this.stateTint.disable = disable;
        this.stateTint.down    = down;
        this.stateTint.out     = out;
        this.stateTint.over    = over;
        this.stateTint.up      = up;
    }
}
