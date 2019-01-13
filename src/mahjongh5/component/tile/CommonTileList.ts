import * as Three from "three";
import { v4 } from "uuid";
import TileList from "./TileList";
import ImageTile from "./ImageTile";
import ImageTileTable from "./ImageTileTable";
import Input from "mahjongh5/input/Input";
import Game from "mahjongh5/Game";
import RoundEdgedBox from "mahjongh5/Util/RoundBoxGeometry";

export default class CommonTileList extends TileList<ImageTile> {
    protected game: Game;

    protected tileTable: ImageTileTable;

    private geometry: Three.Geometry;
    private material: Three.Material;

    private sortable: boolean;

    public get Geometry(): Three.Geometry {
        return this.geometry.clone();
    }
    public get Material(): Three.Material {
        return this.material.clone();
    }

    constructor(game: Game, tileCount: number, tileTable: ImageTileTable, tileW: number, tileH: number, tileD: number, clickable: boolean = false, maxLen = -1, sortable = true) {
        super(clickable, maxLen);
        this.game = game;

        this.tileTable = tileTable;
        this.geometry  = RoundEdgedBox(tileW, tileH, tileD, 6, 1, 1, 1, 6);
        this.material = new Three.MeshLambertMaterial({ color: 0xDBDBDB });

        for (let i = 0; i < tileCount; i++) {
            this.tiles.push(new ImageTile(game, this.Geometry, this.Material, tileTable));
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
        const newTile = new ImageTile(this.game, this.Geometry, this.Material, this.tileTable);
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
        newTile.uuid  = v4();
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
            tile.position.x =  (tile.width  + 5) *   (i % this.MaxLen);
            tile.position.y = -(tile.height + 5) * ~~(i / this.MaxLen);
        }
    }
}
