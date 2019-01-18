import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import Effect from "mahjongh5/component/Effect";
import * as Assets from "../Assets";
import * as System from "mahjongh5/System";
import Game from "mahjongh5/Game";
import Text from "mahjongh5/ui/Text";

export default class ChangeTileEffect extends Effect {
    private lack: Three.Mesh;
    private anim: Tween.Tween;

    private game: Game;

    constructor(game: Game, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number) {
        super();
        this.game = game;
        this.lack = new Three.Mesh(new Three.CylinderBufferGeometry(80, 80, 20, 100).rotateX(Math.PI / 2), new Three.MeshLambertMaterial({ color: 0xFFFFFF }));
        this.lack.position.set(ox, oy, oz);
        this.lack.visible  = false;

        this.add(this.lack);

        this.anim = new Tween.Tween(this.lack.position).to({x: dx, y: dy, z: dz}, 1000);
    }

    protected *RunEffect(color: string): IterableIterator<Promise<void>> {
        const text = new Text(this.game, color, Assets.font.jhengHei.key, 80, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 0, 0, 15, true);
        this.lack.add(text);
        if (this.lack.material instanceof Three.MeshLambertMaterial) {
            let c;
            switch (color) {
                case "萬":
                    c = CHAR_COLOR;
                    break;
                case "筒":
                    c = DOT_COLOR;
                    break;
                case "條":
                    c = BAMBOO_COLOR;
                    break;
            }
            this.lack.material.color.setHex(c);
        }
        this.lack.visible = true;
        yield System.Delay(1000);
        this.anim.start();
    }
}
