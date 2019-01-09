import * as Three from "three";
import TileList from "./TileList";
import ImageTile from "./ImageTile";
import ImageTileTable from "./ImageTileTable";
import Input from "mahjongh5/input/Input";
import { v4 } from "uuid";

enum Direction {
    Right = 0,
    Down  = 1,
    Left  = 2,
    Up    = 3,
}

export default class CommonTileList extends TileList<ImageTile> {
    public direction: number = Direction.Right;

    private tileWidth:    number = 0;
    private tileHeight:   number = 0;
    private tileTable:    ImageTileTable;
    private tileAnchor:   Three.Vector3;
    private tileScale:    Three.Vector3;
    private tilePosition: Three.Vector3;

    private sortable: boolean;

    /**
     * 符號顯示寬度
     */
    public get TileWidth(): number {
        return this.tileWidth;
    }
    public set TileWidth(value: number) {
        this.tileWidth = Math.max(value, 0);
        for (const tile of this.tiles) {
            // tile.width = this.tileWidth;
        }
        this.ArrangeTile();
    }

    /**
     * 符號顯示高度
     */
    public get TileHeight(): number {
        return this.tileHeight;
    }
    public set TileHeight(value: number) {
        this.tileHeight = Math.max(value, 0);
        for (const tile of this.tiles) {
            // tile.height = this.tileHeight;
        }
        this.ArrangeTile();
    }

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

    /**
     * 建立Reel
     * @param game Game
     * @param tileCount tile的數量
     * @param tileTable tile table資料
     * @param parent reel的parent，通常是ReelManager
     * @param tileWidth 指定排列時的tile寬度
     * @param tileHeight 指定排列時的tile高度
     */
    constructor(tileCount: number, tileTable: ImageTileTable, tileWidth?: number, tileHeight?: number, direction: number = Direction.Right, clickable: boolean = false, maxLen = -1, sortable = true) {
        super(clickable, maxLen);
        // Create Add tile
        this.tileTable = tileTable;
        for (let i = 0; i < tileCount; i++) {
            this.tiles.push(new ImageTile(tileTable));
            if (clickable) {
                this.tiles[this.tiles.length - 1].setTint(0x707070, 0x707070);
            } else {
                this.tiles[this.tiles.length - 1].enable = false;
            }
        }
        this.add(...this.tiles);
        this.direction = direction;
        // Set TileWidth
        if (tileWidth !== undefined) {
            this.TileWidth = tileWidth;
        } else if (tileTable.tileWidth !== undefined) {
            this.TileWidth = tileTable.tileWidth;
        } else if (this.tiles.length > 0) {
            this.TileWidth = this.tiles[0].tileWidth;
        }
        // Set TileWidth
        if (tileHeight !== undefined) {
            this.TileHeight = tileHeight;
        } else if (tileTable.tileHeight !== undefined) {
            this.TileHeight = tileTable.tileHeight;
        } else if (this.tiles.length > 0) {
            this.TileHeight = this.tiles[0].tileHeight;
        }

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
        if (this.sortable) {
            for (index = 0; index < this.tileCount; index++) {
                const t1 = this.tiles[index].ID;
                const t2 = ID;
                if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                    break;
                }
            }
            this.tiles.splice(index, 0, new ImageTile(this.tileTable));
        } else {
            this.tiles.push(new ImageTile(this.tileTable));
            index = this.tiles.length - 1;
        }
        this.add(this.tiles[index]);
        this.tiles[index].ID     = ID;
        this.tiles[index].color  = ID.slice(0, 1);
        this.tiles[index].uuid   = v4();
        // this.tiles[index].width  = this.TileWidth;
        // this.tiles[index].height = this.TileHeight;
        this.tiles[index].AdjustTile(this.tileAnchor, this.tileScale, this.tilePosition);
        if (this.clickable) {
            this.tiles[index].setTint(0x707070, 0x707070);
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
            tile.rotateX(-this.direction * 90);
            if (this.direction === Direction.Down) {
                tile.position.x = (this.TileHeight + 5) * ~~(i / this.MaxLen);
                tile.position.y = (this.TileWidth + 5) * (this.MaxLen - i % this.MaxLen);
            } else if (this.direction === Direction.Up) {
                tile.position.x = -(this.TileHeight + 5) * ~~(i / this.MaxLen);
                tile.position.y = (this.TileWidth + 5) * (i % this.MaxLen);
            } else if (this.direction === Direction.Left) {
                tile.position.x = (this.TileWidth + 5) * (this.MaxLen - i % this.MaxLen);
                tile.position.y = -(this.TileHeight + 5) * ~~(i / this.MaxLen);
            } else if (this.direction === Direction.Right) {
                tile.position.x = (this.TileWidth + 5) * (i % this.MaxLen);
                tile.position.y = (this.TileHeight + 5) * ~~(i / this.MaxLen);
            }
        }
    }
}
