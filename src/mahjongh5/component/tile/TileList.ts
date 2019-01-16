import * as Three from "three";
import Tile from "./Tile";
import Input from "mahjongh5/input/Input";

export default abstract class TileList<TileType extends Tile> extends Three.Group implements Iterable<TileType> {
    public visiblePosition: number = 0;
    public visibleCount:    number = 0;
    public maxLen:    number;
    public clickable: boolean;
    public tiles: TileType[] = [];

    private input: Input;

    public get Input(): Input {
        if (!this.input) {
            this.input = new Input();
        }
        return this.input;
    }

    public get tileCount(): number {
        return this.tiles.length;
    }

    public get MaxLen(): number {
        if (this.maxLen !== -1) {
            return this.maxLen;
        }
        return this.tileCount;
    }

    constructor(clickable: boolean = false, maxLen = -1) {
        super();
        this.clickable = clickable;
        this.maxLen    = maxLen;
    }

    public GetTile(index: number): TileType {
        return this.tiles[index];
    }
    public [Symbol.iterator](): IterableIterator<TileType> {
        return this.tiles[Symbol.iterator]();
    }

    public entries(): IterableIterator<[number, TileType]> {
        return this.tiles.entries();
    }

    public SetImmediate(tiles: Iterable<string>): void {
        const tileIterator = tiles[Symbol.iterator]();
        let result: IteratorResult<string> = tileIterator.next();
        for (let i = 0; i < this.tileCount && !result.done; i++ , result = tileIterator.next()) {
            this.tiles[i].ID    = result.value;
            this.tiles[i].color = result.value.slice(0, 1);
            if (this.clickable) {
                this.Input.AddButton(this.tiles[i], Input.key.Throw, undefined, this.tiles[i].uuid);
            }
        }
    }

    public EnableAll() {
        for (const tile of this.tiles) {
            tile.enable = true;
        }
    }

    public DisableAll() {
        for (const tile of this.tiles) {
            tile.enable = false;
        }
    }

    public Enable(id: string) {
        for (const tile of this.tiles) {
            if (tile.ID === id) {
                tile.enable = true;
            }
        }
    }

    public Disable(id: string) {
        for (const tile of this.tiles) {
            if (tile.ID === id) {
                tile.enable = false;
            }
        }
    }

    public async getClickTileIndex(): Promise<number> {
        const uuid = await this.Input.WaitKeyUp(Input.key.Throw);
        const tile = this.tiles.findIndex((value) => value.uuid === uuid);
        return tile;
    }

    public async getClickTileID(): Promise<string> {
        const uuid = await this.Input.WaitKeyUp(Input.key.Throw);
        const tile = this.tiles.find((value) => value.uuid === uuid);
        return tile.ID;
    }
}
