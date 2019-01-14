import * as Three from "three";
import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";
import ScrollTextArea from "mahjongh5/ui/ScrollTextArea";
import Cube from "mahjongh5/ui/Cube";

export default class InfoDialog extends Dialog {
    public scoreLog: ScrollTextArea;
    public X:        number;
    public Y:        number;
    public anchorX:  number = 0;
    public anchorY:  number = 0;

    constructor(game: Game, onCreate: (dialog: InfoDialog) => void, show: boolean = false) {
        super(game, onCreate);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.backgroundCancel = true;
        this.destoryOnHide    = false;

        this.CreateBG(800, 600, 30, 0.8);
        this.add(this.backgroundGraphics);
        this.add(this.scoreLog);
    }

    public Show(): Promise<DialogResult> {
        if (this.scoreLog.visible === true) {
            window.addEventListener("mousewheel",     this.scoreLog.scroll.bind(this.scoreLog), false);
            window.addEventListener("DOMMouseScroll", this.scoreLog.scroll.bind(this.scoreLog), false);
            this.visible = true;
            // 設定dialog物件的值
            return super.Show()
                .then((result) => {
                    return result;
                });
        } else {
            return Promise.resolve(DialogResult.Cancel);
        }
    }

    public Hide() {
        this.visible = false;
        super.Hide();
    }

    protected Create() {
        super.Create();
    }
}
