import Effect from "mahjongh5/component/Effect";
import ImageTileTable from "mahjongh5/component/tile/ImageTileTable";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";
// import * as Assets from "../Assets";
import * as System from "mahjongh5/System";
import Game from "mahjongh5/Game";

export default class ChangeTileEffect extends Effect {
    // private lack: Image;
    // private anim: Tween;

    constructor(game: Game, ox: number, oy: number, dx: number, dy: number) {
        super();

        // this.lack          = game.add.image(0, 0, Assets.button.char.key);
        // this.lack.anchor   = new Point(0.5, 0.5);
        // this.lack.position = new Point(ox, oy);
        // this.lack.width    = 80;
        // this.lack.height   = 80;
        // this.lack.visible  = false;

        // this.anim = game.add.tween(this.lack).to({ x: dx, y: dy }, 500, Easing.Linear.None, false);
        // this.anim.onComplete.add(() => {
        //     game.add.tween(this.lack).to({ alpha: 0 }, 100, Easing.Linear.None, true);
        // });
    }

    protected *RunEffect(texture: string): IterableIterator<Promise<void>> {
        // this.lack.loadTexture(texture);
        // this.lack.visible = true;
        // yield System.Delay(500);
        // this.anim.start();
        // yield System.Delay(600);
        // this.lack.visible = false;
    }
}
