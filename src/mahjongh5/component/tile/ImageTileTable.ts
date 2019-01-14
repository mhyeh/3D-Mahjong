import TilelTable from "./TileTable";

export default class ImageTileTable extends TilelTable<ImageTileConfig> {

    public spriteKey:      string;
    public tileWidth?:     number;
    public tileHeight?:    number;
    public textureConfig?: string;

    constructor(data?: any, spriteKey?: string, textureConfig?: string) {
        super(data);
        if (data) {
            this.spriteKey  = data.spriteKey;
            this.tileWidth  = data.tileWidth;
            this.tileHeight = data.tileHeight;
        }
        if (spriteKey) {
            this.spriteKey = spriteKey;
        }
        if (textureConfig) {
            this.textureConfig = textureConfig;
        }
    }

    public GetSprite(tile: number | string): number | string | null {
        const config = this.GetConfig(tile);
        if (config !== null) {
            return config.image;
        }
        return null;
    }

    public GetConfig(tile: number | string): ImageTileConfig | null {
        return super.GetConfig(tile);
    }
}

export interface ImageTileConfig {
    tile:  string;
    image: string | number;
}
