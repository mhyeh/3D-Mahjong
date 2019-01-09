export default class TileTable<ConfigType extends TileConfig = TileConfig> implements Iterable<ConfigType> {
    protected configs: ConfigType[] = [];

    constructor(data?: any) {
        if (data) {
            this.configs = data.configs;
        }
    }

    public get tileCount(): number {
        return this.configs.length;
    }

    public ToIndex(value: string): number | null {
        for (let i = 0; i < this.configs.length; i++) {
            if (this.configs[i].tile === value) {
                return i;
            }
        }
        return null;
    }

    public GetConfig(tile: number | string): ConfigType | null {
        if (typeof tile === "number") {
            if (tile >= 0 && tile < this.configs.length) {
                return this.configs[tile];
            }
        } else {
            const index = this.ToIndex(tile);
            if (index !== null) {
                return this.configs[index];
            }
        }
        return null;
    }

    public [Symbol.iterator](): IterableIterator<ConfigType> {
        return this.configs[Symbol.iterator]();
    }
}

export interface TileConfig {
    tile: string;
}
