import CommonTileList from "./CommonTileList";
import ImageTileTable from "./ImageTileTable";
import Game from "mahjongh5/Game";
import ImageTile from "./ImageTile";

export default class DoorTileList extends CommonTileList {
    private gonTiles: ImageTile[] = [];

    constructor(game: Game, tileW: number, tileH: number, tileD: number, maxLen = 12, sortable = true) {
        super(game, 0, tileW, tileH, tileD, false, maxLen, true);
    }

    public AddTile(ID: string) {
        console.log(ID);
        const newTile   = new ImageTile(this.game, CommonTileList.bufferGeometry, CommonTileList.tileTable);
        newTile.ID      = ID;
        newTile.color   = ID.slice(0, 1);
        newTile.enable  = false;
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2, o: 3, f: 4};
        let index = 0;
        for (index = 0; index < this.tileCount; index++) {
            const t1 = this.tiles[index].ID;
            const t2 = ID;
            if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                break;
            }
        }
        if (ID === "None") {
            newTile.rotateX(Math.PI);
        }
        this.add(newTile);
        CommonTileList.addTile(newTile);
        this.tiles.splice(index, 0, newTile);
        this.ArrangeTile();
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

    public Eat(ID: string) {
        console.log(ID);
        const v = Number(ID.charAt(1));
        for (let i = 0; i < 3; i++) {
            this.AddTile(ID.charAt(0) + (v + i));
        }
        this.ArrangeGonTile();
    }

    public ClearDoor() {
        this.ClearTileList();
        this.gonTiles.forEach((tile) => {
            this.remove(tile);
            CommonTileList.removeTile(tile);
        });
        this.gonTiles = [];
    }

    private ArrangeGonTile() {
        let i = 0;
        for (const gTile of this.gonTiles) {
            for (; i < this.tiles.length - 1; i++) {
                if (this.tiles[i].ID === gTile.ID && this.tiles[i + 1].ID === gTile.ID) {
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
            this.AddTile(ID);
        }
    }

    private addGonTile(ID: string) {
        const tile      = new ImageTile(this.game, CommonTileList.bufferGeometry, CommonTileList.tileTable);
        tile.ID         = ID;
        tile.color      = ID.slice(0, 1);
        tile.position.z = tile.depth + 2;
        tile.enable     = false;
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2, o: 3, f: 4};
        let index = 0;
        for (index = 0; index < this.gonTiles.length; index++) {
            const t1 = this.gonTiles[index].ID;
            const t2 = ID;
            if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                break;
            }
        }
        if (ID === "None") {
            tile.rotateX(Math.PI);
        }
        this.gonTiles.splice(index, 0, tile);
        this.add(tile);
        CommonTileList.addTile(tile);
    }
}
