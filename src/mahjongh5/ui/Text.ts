import * as Three from "three";
import Game from "mahjongh5/Game";
import Cube from "./Cube";

export default class Text extends Cube {
    private config:   any;
    private isCenter: boolean;
    private value:    string;

    public get text(): string {
        return this.value;
    }

    public set text(value: string) {
        this.value    = value;
        this.geometry = new Three.TextBufferGeometry(value, this.config);
        if (this.isCenter) {
            this.geometry.center();
        }
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
    }
}
