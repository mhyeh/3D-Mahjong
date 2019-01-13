import * as Three from "three";
import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";
import ScrollTextArea from "mahjongh5/ui/ScrollTextArea";
import Cube from "mahjongh5/ui/Cube";

export default class InfoDialog extends Dialog {
    public lack:     Cube;
    public scoreLog: ScrollTextArea;
    public X:        number;
    public Y:        number;
    public anchorX:  number = 0;
    public anchorY:  number = 0;

    public windowGroup: Three.Group;

    public background: Cube;

    constructor(game: Game, onCreate: (dialog: InfoDialog) => void, show: boolean = false) {
        super(game, onCreate);
        this.game = game;
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.backgroundCancel = true;
        this.destoryOnHide    = false;

        this.windowGroup = new Three.Group();
        // this.background  = new Graphics(game, 0, 0);
        // this.background.beginFill(0x000000, 0.6);
        // this.background.drawRoundedRect(0, 0, 400, 100, 5);
        // this.background.endFill();
        this.windowGroup.add(this.background);
        this.windowGroup.add(this.lack);
        this.windowGroup.add(this.scoreLog);
    }

    public Redraw() {
        this.background.scale.y = this.background.height + 150;
        // this.background.clear();
        // this.background.beginFill(0x000000, 0.6);
        // this.background.drawRoundedRect(0, 0, 400, this.scoreLog.Height + 150, 5);
        // this.background.endFill();
        // this.position.y = this.Y - (this.scoreLog.Height + 50) * this.anchorY;
    }

    public Show(): Promise<DialogResult> {
        if (this.lack.visible === false) {
            this.Hide();
            return Promise.resolve(DialogResult.Cancel);
        }
        if (this.scoreLog.visible === true) {
            window.addEventListener("mousewheel",     this.scoreLog.scroll.bind(this.scoreLog), false);
            window.addEventListener("DOMMouseScroll", this.scoreLog.scroll.bind(this.scoreLog), false);
        }
        this.windowGroup.visible = true;
        // 設定dialog物件的值
        return super.Show()
            .then((result) => {
                return result;
            });
    }

    public Hide() {
        this.windowGroup.visible = false;
        super.Hide();
    }

    protected Create() {
        super.Create();
    }
}
