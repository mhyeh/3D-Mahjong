import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";
import Text from "mahjongh5/ui/Text";

export default class ChoseLackDialog extends Dialog {
    public bamboo: Button;
    public char:   Button;
    public dot:    Button;
    public text:   Text;

    constructor(game: Game, onCreate: (dialog: ChoseLackDialog) => void, show: boolean = false) {
        super(game, onCreate);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.backgroundCancel = false;
        this.destoryOnHide    = false;

        this.CreateBG(500, 100, 10, 0.6);
        this.add(this.backgroundGraphics);
        this.add(this.bamboo);
        this.add(this.char);
        this.add(this.dot);
        this.add(this.text);
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

        this.SetReplyButton(this.bamboo, DialogResult.Cancel);
        this.SetReplyButton(this.char,   DialogResult.Cancel);
        this.SetReplyButton(this.dot,    DialogResult.Cancel);
    }
}
