import * as Three from "three";
import { v4 } from "uuid";
import TileList from "./TileList";
import ImageTile from "./ImageTile";
import ImageTileTable from "./ImageTileTable";
import Input from "mahjongh5/input/Input";
import Game from "mahjongh5/Game";
import RoundEdgedBox from "mahjongh5/Util/RoundBoxGeometry";

export default class CommonTileList extends TileList<ImageTile> {
    private tileTable:    ImageTileTable;
    private tileAnchor:   Three.Vector3;
    private tileScale:    Three.Vector3;
    private tilePosition: Three.Vector3;

    private sortable: boolean;

    private game: Game;

    private geometry: Three.Geometry;

    public get TileAnchor(): Three.Vector3 {
        return this.tileAnchor;
    }
    public set TileAnchor(value: Three.Vector3) {
        this.tileAnchor = value;
        for (const tile of this.tiles) {
            tile.AdjustTile(value);
        }
        this.ArrangeTile();
    }

    public get TileScale(): Three.Vector3 {
        return this.tileScale;
    }
    public set TileScale(value: Three.Vector3) {
        this.tileScale = value;
        for (const tile of this.tiles) {
            tile.AdjustTile(undefined, value);
        }
        this.ArrangeTile();
    }

    public get TilePosition(): Three.Vector3 {
        return this.tilePosition;
    }
    public set TilePosition(value: Three.Vector3) {
        this.tilePosition = value;
        for (const tile of this.tiles) {
            tile.AdjustTile(undefined, undefined, value);
        }
        this.ArrangeTile();
    }

    constructor(game: Game, tileCount: number, tileTable: ImageTileTable, tileW: number, tileH: number, tileD: number, clickable: boolean = false, maxLen = -1, sortable = true) {
        super(clickable, maxLen);
        this.game = game;

        this.tileTable = tileTable;
        this.geometry  = RoundEdgedBox(tileW, tileH, tileD, 6, 1, 1, 1, 6);

        for (let i = 0; i < tileCount; i++) {
            const material = new Three.MeshLambertMaterial({ color: 0xDBDBDB });
            this.tiles.push(new ImageTile(game, this.geometry, material, tileTable));
            if (clickable) {
                this.tiles[i].setTint(0x707070, 0x707070, 0xDBDBDB, 0xDBDBDB, 0xDBDBDB);
            } else {
                this.tiles[i].enable = false;
            }
            this.add(this.tiles[i]);
        }
        this.AdjustAllTile();

        this.sortable = sortable;
    }

    public AdjustAllTile(anchor?: Three.Vector3, scale?: Three.Vector3, position?: Three.Vector3) {
        for (const tile of this.tiles) {
            tile.AdjustTile(anchor, scale, position);
        }
        this.ArrangeTile();
    }

    public AddTile(ID: string) {
        let index = 0;
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2};
        const material = new Three.MeshLambertMaterial({ });
        if (this.sortable) {
            for (index = 0; index < this.tileCount; index++) {
                const t1 = this.tiles[index].ID;
                const t2 = ID;
                if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                    break;
                }
            }
            this.tiles.splice(index, 0, new ImageTile(this.game, this.geometry, material, this.tileTable));
        } else {
            this.tiles.push(new ImageTile(this.game, this.geometry, material, this.tileTable));
            index = this.tiles.length - 1;
        }
        this.add(this.tiles[index]);
        this.tiles[index].ID     = ID;
        this.tiles[index].color  = ID.slice(0, 1);
        this.tiles[index].uuid   = v4();
        this.tiles[index].AdjustTile(this.tileAnchor, this.tileScale, this.tilePosition);
        if (this.clickable) {
            this.tiles[index].setTint(0x707070, 0x707070, 0xDBDBDB, 0xDBDBDB, 0xDBDBDB);
            this.Input.AddButton(this.tiles[index], Input.key.Throw, undefined, this.tiles[index].uuid);
        } else {
            this.tiles[index].enable = false;
        }
        this.ArrangeTile();
    }

    public RemoveTile(ID: string) {
        let index = -1;
        if (this.sortable) {
            index = this.tiles.findIndex((a) => a.ID === ID);
        } else {
            let flag = false;
            for (let i = this.tiles.length - 1; i >= 0; i--) {
                if (this.tiles[i].ID === ID) {
                    index = i;
                    flag  = true;
                    break;
                }
            }
            if (!flag) {
                index = -1;
            }
        }
        if (index !== -1) {
            this.remove(this.tiles[index]);
            this.tiles.splice(index, 1);
        }
        this.ArrangeTile();
    }

    private ArrangeTile() {
        for (const [i, tile] of this.tiles.entries()) {
            tile.position.x = (tile.width  + 5)  *   (i % this.MaxLen);
            tile.position.y = -(tile.height + 5) * ~~(i / this.MaxLen);
        }
    }
}
