import * as Three from "three";

export default class TextureAtlas {
    private textures: { [key: string]: Three.Texture };

    constructor(json: FrameJson, image: HTMLImageElement) {
        const texture = new Three.Texture(image);
        this.textures = {};
        texture.needsUpdate = true;

        for (const key in json) {
            const t    = texture.clone();
            const data = json[key];
            t.repeat.set(data.frame.w / image.width, data.frame.h / image.height);
            t.offset.x    = ((data.frame.x) / image.width);
            t.offset.y    = 1 - (data.frame.h / image.height) - (data.frame.y / image.height);
            t.needsUpdate = true;

            this.textures[key] = t;
        }
    }

    public Get(key: string) {
        return this.textures[key];
    }
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
