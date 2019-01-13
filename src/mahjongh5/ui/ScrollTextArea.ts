import * as Three from "three";
import Game from "../Game";
import Text from "./Text";
import Cube from "./Cube";

export default class ScrollTextArea extends Three.Group {
    public text: Text;
    public game: Game;

    public ox: number;
    public oy: number;

    private backGround: Cube;
    private maskArea:   Cube;
    private w: number;
    private h: number;

    public get Width(): number {
        return this.w;
    }

    public get Height(): number {
        return this.h;
    }

    constructor(game: Game, t: Text, w: number, h: number) {
        super();
        this.game = game;

        this.w = w;
        this.h = h;

        // this.backGround = game.add.graphics(0, 0);
        // this.backGround.beginFill(0x2A3EAF, 1);
        // this.backGround.drawRect(0, 0, w, h);
        // this.backGround.endFill();

        // this.maskArea = game.add.graphics(0, 0);
        // this.maskArea.inputEnabled = true;
        // this.maskArea.beginFill(0, 0);
        // this.maskArea.drawRect(0, 0, w, h);
        // this.maskArea.endFill();

        // this.text      = t;
        // this.text.mask = this.maskArea;

        // this.ox = this.text.x;
        // this.oy = this.text.y;

        // this.add(this.backGround);
        // this.add(this.maskArea);
        // this.add(this.text);
    }

    public scroll() {
        // this.text.y += this.game.input.mouse.wheelDelta * 20;
        // if (this.text.y > this.oy) {
        //     this.text.y = this.oy;
        // }
        // if (this.text.y < this.Height - this.text.height) {
        //     this.text.y = this.Height - this.text.height;
        // }
    }
}
