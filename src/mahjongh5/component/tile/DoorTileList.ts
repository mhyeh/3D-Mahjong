import { v4 } from "uuid";
import CommonTileList from "./CommonTileList";
import ImageTileTable from "./ImageTileTable";
import Game from "mahjongh5/Game";
import ImageTile from "./ImageTile";

export default class DoorTileList extends CommonTileList {
    private gonTiles: ImageTile[] = [];

    constructor(game: Game, tileTable: ImageTileTable, tileW: number, tileH: number, tileD: number, maxLen = 12, sortable = true) {
        super(game, 0, tileTable, tileW, tileH, tileD, false, maxLen, true);
    }

    public Pon(ID: string) {
        this.addThreeTile(ID);
        this.ArrangeGonTile();
    }

    public Gon(ID: string) {
        this.addThreeTile(ID);
        this.addGonTile(ID);
        this.ArrangeGonTile();
    }

    public PonGon(ID: string) {
        this.addGonTile(ID);
        this.ArrangeGonTile();
    }

    private ArrangeGonTile() {
        let i = 0;
        for (const gTile of this.gonTiles) {
            for (; i < this.tiles.length; i++) {
                if (this.tiles[i].ID === gTile.ID) {
                    gTile.position.x = this.tiles[i + 1].position.x;
                    gTile.position.y = this.tiles[i + 1].position.y;
                    i += 3;
                    break;
                }
            }
        }
    }

    private addThreeTile(ID: string) {
        for (let i = 0; i < 3; i++) {
            super.AddTile(ID);
        }
    }

    private addGonTile(ID: string) {
        const tile      = new ImageTile(this.game, this.tileW, this.tileH, this.tileD, this.tileR, this.tileTable);
        tile.ID         = ID;
        tile.color      = ID.slice(0, 1);
        tile.UUID       = v4();
        tile.position.z = tile.depth + 2;
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2};
        let index = 0;
        for (index = 0; index < this.gonTiles.length; index++) {
            const t1 = this.gonTiles[index].ID;
            const t2 = ID;
            if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                break;
            }
        }
        this.gonTiles.splice(index, 0, tile);
        super.add(tile);
    }
}
