import * as Three from "three";
import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";
import Text from "mahjongh5/ui/Text";

export default class ChoseLackDialog extends Dialog {
    public bamboo: Button;
    public char:   Button;
    public dot:    Button;
    public text:   Text;

    public windowGroup: Three.Group;

    public background: Three.Mesh;

    constructor(game: Game, onCreate: (dialog: ChoseLackDialog) => void, show: boolean = false) {
        super(game, onCreate);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.backgroundCancel = false;
        this.destoryOnHide    = false;

        this.windowGroup = new Three.Group();
        // this.background  = new Graphics(game, 0, 0);
        // this.background.beginFill(0x000000, 0.6);
        // this.background.drawRoundedRect(0, 0, 300, 80, 5);
        // this.background.endFill();
        this.windowGroup.add(this.background);
        this.windowGroup.add(this.bamboo);
        this.windowGroup.add(this.char);
        this.windowGroup.add(this.dot);
        this.windowGroup.add(this.text);
    }

    public Show(): Promise<DialogResult> {
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

        this.SetReplyButton(this.bamboo, DialogResult.Cancel);
        this.SetReplyButton(this.char,   DialogResult.Cancel);
        this.SetReplyButton(this.dot,    DialogResult.Cancel);
    }
}
