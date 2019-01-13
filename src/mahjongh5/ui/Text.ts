import * as Three from "three";
import Game from "mahjongh5/Game";

export default class Text extends Three.Mesh {
    private config: any;

    public set text(value: string) {
        this.geometry = new Three.TextGeometry(value, this.config);
    }

    constructor(game: Game, text: string, font: string, _size: number, _height?: number, material?: Three.Material | Three.Material[], x: number = 0, y: number = 0, z: number = 0) {
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
        this.position.set(x, y, z);
    }
}
