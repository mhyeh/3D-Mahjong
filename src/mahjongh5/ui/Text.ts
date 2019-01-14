import * as Three from "three";
import Game from "mahjongh5/Game";
import Cube from "./Cube";

export default class Text extends Cube {
    private config:   any;
    private isCenter: boolean;

    public set text(value: string) {
        this.geometry = new Three.TextGeometry(value, this.config);
        if (this.isCenter) {
            this.geometry.center();
        }
    }

    constructor(game: Game, text: string, font: string, _size: number, _height?: number, material?: Three.Material | Three.Material[], x: number = 0, y: number = 0, z: number = 0, isCenter: boolean = false) {
        super(new Three.TextGeometry(text, {
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
    }
}
