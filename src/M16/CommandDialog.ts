import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";

export default class CommandDialog extends Dialog {
    public eat:    Button;
    public pon:    Button;
    public gon:    Button;
    public hu:     Button;
    public none:   Button;
    public pongon: Button;
    public ongon:  Button;

    constructor(game: Game, onCreate: (dialog: CommandDialog) => void, show: boolean = false) {
        super(game, onCreate);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.backgroundCancel = false;
        this.destoryOnHide    = false;

        this.CreateBG(800, 120, 10, 0.7);
        this.add(this.backgroundGraphics);
        this.add(this.eat);
        this.add(this.pon);
        this.add(this.gon);
        this.add(this.hu);
        this.add(this.ongon);
        this.add(this.pongon);
        this.add(this.none);
    }

    public Show(): Promise<DialogResult> {
        this.visible        = true;
        this.eat.enable     = false;
        this.pon.enable     = false;
        this.gon.enable     = false;
        this.hu.enable      = false;
        this.ongon.visible  = false;
        this.pongon.visible = false;
        this.none.enable    = true;
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

        this.SetReplyButton(this.pon,  DialogResult.Cancel);
        this.SetReplyButton(this.hu,   DialogResult.Cancel);
        this.SetReplyButton(this.none, DialogResult.Cancel);
    }
}
