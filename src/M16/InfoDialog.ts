import * as Three from "three";
import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Game from "mahjongh5/Game";
import ScrollTextArea from "mahjongh5/ui/ScrollTextArea";
import Text from "mahjongh5/ui/Text";

export default class InfoDialog extends Dialog {
    // public scoreLog: ScrollTextArea;
    public X:        number;
    public Y:        number;
    public anchorX:  number = 0;
    public anchorY:  number = 0;

    public nameList: string[];
    public nameText: Text[];

    public score:     number[];
    public scoreText: Text[];
    public scoreLog:  Text[];

    public huIcon:   Three.Mesh[];
    public tingIcon: Three.Mesh[];

    public windAndRoundText: Text;
    public windText:         Text[];
    public bankerText:       Text[];
    public seasonText:       Text[];

    constructor(game: Game, onCreate: (dialog: InfoDialog) => void, show: boolean = false) {
        super(game, onCreate);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.backgroundCancel = false;
        this.destoryOnHide    = false;

        this.CreateBG(900, 900 / ASPECT, 10, 0.7);
        this.add(this.backgroundGraphics);
        this.add(...this.nameText);
        this.add(...this.scoreText);
        this.add(...this.scoreLog);
        this.add(...this.windText);
        this.add(...this.bankerText);
        this.add(...this.seasonText);
        this.add(...this.huIcon);
        this.add(...this.tingIcon);
        this.add(this.windAndRoundText);
    }

    public Show(): Promise<DialogResult> {
        this.visible = true;
        // 設定dialog物件的值
        return super.Show()
            .then((result) => {
                return result;
            });
    }

    public Hide() {
        this.visible = false;
        super.Hide();
    }

    protected Create() {
        super.Create();
    }
}
