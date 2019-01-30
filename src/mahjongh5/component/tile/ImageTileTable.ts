import * as Three from "three";
import TilelTable from "./TileTable";
// import AltasTexture from "mahjongh5/Util/AltasTexture";
import Game from "mahjongh5/Game";

export default class ImageTileTable extends TilelTable<ImageTileConfig> {
    public spriteKey:      string;
    public tileWidth?:     number;
    public tileHeight?:    number;
    public textureConfig?: string;

    private _texture:  Three.Texture;
    private frameJson: FrameJson;
    private imagew:    number;
    private imageh:    number;

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
            this.frameJson     = game.cache[textureConfig].frames;
        }

        this.imagew   = game.cache[this.spriteKey].width;
        this.imageh   = game.cache[this.spriteKey].height;
        this._texture = new Three.Texture(game.cache[this.spriteKey]);
        this._texture.needsUpdate = true;
    }

    public get texture(): Three.Texture {
        return this._texture;
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

    public GetUv(ID: string): Three.Vector4 {
        const key = this.GetSprite(ID);
        if (typeof key === "string" && this.frameJson[key]) {
            const frame = this.frameJson[key].frame;
            return new Three.Vector4(frame.x / this.imagew, 1 - (frame.h / this.imageh) - (frame.y / this.imageh), frame.w / this.imagew, frame.h / this.imageh);
        }
        return new Three.Vector4(0, 0, 0, 0);
    }
}

export interface ImageTileConfig {
    tile:  string;
    image: string | number;
}

interface FrameJson {
    [key: string]: {
        frame: {
            x: number,
            y: number,
            w: number,
            h: number,
        },
        rotated: boolean,
        trimmed: boolean,
        spriteSourceSize: {
            x: number,
            y: number,
            w: number,
            h: number,
        },
        sourceSize: {
            w: number,
            h: number,
        },
    };
}
