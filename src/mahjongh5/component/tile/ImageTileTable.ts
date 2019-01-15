import * as Three from "three";
import TilelTable from "./TileTable";
import AltasTexture from "mahjongh5/Util/AltasTexture";
import Game from "mahjongh5/Game";

export default class ImageTileTable extends TilelTable<ImageTileConfig> {
    public spriteKey:      string;
    public tileWidth?:     number;
    public tileHeight?:    number;
    public textureConfig?: string;

    public tileTexture?: AltasTexture;

    constructor(game: Game, data?: any, spriteKey?: string, textureConfig?: string) {
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
        if (this.spriteKey && this.textureConfig) {
            this.tileTexture = new AltasTexture(game.cache[textureConfig].frames, game.cache[spriteKey]);
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

    public GetTexture(tile: string): Three.Texture | undefined {
        const key = this.GetSprite(tile);
        if (this.tileTexture && typeof key === "string") {
            return this.tileTexture.Get(key);
        }
        return undefined;
    }
}

export interface ImageTileConfig {
    tile:  string;
    image: string | number;
}
