import * as Three from "three";
import Game from "mahjongh5/Game";
import Cube from "./Cube";

export default class Text extends Cube {
    private config:   any;
    private isCenter: boolean;
    private value:    string;

    private posX: number;
    private posY: number;

    private anchorX: number = -1;
    private anchorY: number = -1;

    public get text(): string {
        return this.value;
    }

    public set text(value: string) {
        this.value    = value;
        this.geometry = new Three.TextBufferGeometry(value, this.config);
        this.ResetSize();
        if (this.isCenter) {
            this.geometry.center();
        }
        this.position.x = this.posX - (this.anchorX !== -1 ? this.anchorX * this.width  : 0);
        this.position.y = this.posY + (this.anchorY !== -1 ? this.anchorY * this.height : 0);
    }

    public set PosX(value: number) {
        this.posX = value;
        this.position.x = this.posX - (this.anchorX !== -1 ? this.anchorX * this.width : 0);
    }

    public set PoxY(value: number) {
        this.posY = value;
        this.position.y = this.posY + (this.anchorY !== -1 ? this.anchorY * this.height : 0);
    }

    public set AnchorX(value: number) {
        this.anchorX = value;
        this.position.x = this.posX - this.anchorX * this.width;
    }

    public set AnchorY(value: number) {
        this.anchorX = value;
        this.position.y = this.posY + this.anchorY * this.height;
    }

    constructor(game: Game, text: string, font: string, _size: number, _height?: number, material?: Three.Material | Three.Material[], x: number = 0, y: number = 0, z: number = 0, isCenter: boolean = false) {
        super(new Three.TextBufferGeometry(text, {
            font: game.cache[font],
            size: _size,
            height: _height,
        }), material);
        this.config = {
            font: game.cache[font],
            size: _size,
            height: _height,
        };
        this.isCenter = isCenter;
        if (this.isCenter) {
            this.geometry.center();
        }
        this.position.set(x, y, z);
        this.value = text;
        this.posX = x;
        this.posY = y;
    }
}
