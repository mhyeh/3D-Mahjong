import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import Effect from "mahjongh5/component/Effect";
import * as Assets from "../Assets";
import * as System from "mahjongh5/System";
import Game from "mahjongh5/Game";
import Text from "mahjongh5/ui/Text";
import NumberDisplayer from "mahjongh5/ui/NumberDisplayer";
import RoundRectangleGeometry from "mahjongh5/Util/RoundRectangleGeometry";

export default class DiceEffect extends Effect {
    private diceDisplayer: NumberDisplayer;
    private background:    Three.Mesh;

    constructor(game: Game) {
        super();
        this.background  = new Three.Mesh(RoundRectangleGeometry(150, 100, 20, 50), new Three.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 }));
        this.diceDisplayer = new NumberDisplayer(new Text(game, "", Assets.font.jhengHei.key, 50, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, true));

        this.add(this.background);
        this.add(this.diceDisplayer.displayer);
        this.visible = false;
    }

    protected *RunEffect(dice: number): IterableIterator<Promise<void>> {
        this.visible = true;
        this.diceDisplayer.Value = 0;
        for (let i = 0; i < 30; i++) {
            this.diceDisplayer.Value = (this.diceDisplayer.Value + 1) % 16 + 3;
            yield System.Delay(80);
        }
        this.diceDisplayer.Value = dice;
        yield System.Delay(1500);
        this.visible = false;
    }
}
