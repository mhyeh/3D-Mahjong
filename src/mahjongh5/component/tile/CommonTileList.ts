import TileList from "./TileList";
import ImageTile from "./ImageTile";
import ImageTileTable from "./ImageTileTable";
import Input from "mahjongh5/input/Input";
import Game from "mahjongh5/Game";

export default class CommonTileList extends TileList<ImageTile> {
    public tileW: number;
    public tileH: number;
    public tileD: number;
    public tileR: number;

    protected game: Game;

    protected tileTable: ImageTileTable;

    private sortable: boolean;

    constructor(game: Game, tileCount: number, tileTable: ImageTileTable, tileW: number, tileH: number, tileD: number, clickable: boolean = false, maxLen = -1, sortable = true) {
        super(clickable, maxLen);
        this.game = game;

        this.tileTable = tileTable;
        this.tileW     = tileW;
        this.tileH     = tileH;
        this.tileD     = tileD;
        this.tileR     = TILE_R;

        for (let i = 0; i < tileCount; i++) {
            this.tiles.push(new ImageTile(game, this.tileW, this.tileH, this.tileD, this.tileR, tileTable));
            if (clickable) {
                this.tiles[i].setTint(0x707070, 0x707070);
            } else {
                this.tiles[i].enable = false;
            }
            this.add(this.tiles[i]);
        }
        this.ArrangeTile();

        this.sortable = sortable;
    }

    public AddTile(ID: string) {
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2};
        const newTile = new ImageTile(this.game, this.tileW, this.tileH, this.tileD, this.tileR, this.tileTable);
        if (this.sortable) {
            let index = 0;
            for (index = 0; index < this.tileCount; index++) {
                const t1 = this.tiles[index].ID;
                const t2 = ID;
                if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                    break;
                }
            }
            this.tiles.splice(index, 0, newTile);
        } else {
            this.tiles.push(newTile);
        }
        this.add(newTile);
        newTile.ID    = ID;
        newTile.color = ID.slice(0, 1);
        if (this.clickable) {
            newTile.setTint(0x707070, 0x707070);
            this.Input.AddButton(newTile, Input.key.Throw, undefined, newTile.uuid);
        } else {
            newTile.enable = false;
        }
        this.ArrangeTile();
    }

    public RemoveTile(ID: string) {
        let index = -1;
        if (this.sortable) {
            index = this.tiles.findIndex((tile) => tile.ID === ID);
        } else {
            const t = this.tiles.slice(0).reverse();
            index = t.findIndex((tile) => tile.ID === ID);
            if (index !== -1) {
                index = this.tileCount - index - 1;
            }
        }
        if (index !== -1) {
            this.remove(this.tiles[index]);
            this.tiles[index].removeAllEvent();
            this.tiles.splice(index, 1);
        }
        this.ArrangeTile();
    }

    protected ArrangeTile() {
        for (const [i, tile] of this.tiles.entries()) {
            tile.position.x =  (tile.width  + 5) *   (i % this.MaxLen);
            tile.position.y = -(tile.height + 5) * ~~(i / this.MaxLen);
        }
    }
}
