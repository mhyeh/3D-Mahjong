import * as Three from "three";
import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
import Game from "mahjongh5/Game";

export default class CommandDialog extends Dialog {
    public pon:    Button;
    public gon:    Button;
    public hu:     Button;
    public none:   Button;
    public pongon: Button;
    public ongon:  Button;

    public windowGroup: Three.Group;

    constructor(game: Game, onCreate: (dialog: CommandDialog) => void, show: boolean = false) {
        super(game, onCreate);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        // this.modal            = true;
        this.backgroundCancel = false;
        this.destoryOnHide    = false;

        this.windowGroup = new Three.Group();
        this.windowGroup.add(this.pon);
        this.windowGroup.add(this.gon);
        this.windowGroup.add(this.hu);
        this.windowGroup.add(this.none);
        this.windowGroup.add(this.pongon);
        this.windowGroup.add(this.ongon);
    }

    public Show(): Promise<DialogResult> {
        this.windowGroup.visible = true;
        this.pon.enable          = false;
        this.hu.enable           = false;
        this.gon.enable          = false;
        this.pongon.visible      = false;
        this.ongon.visible       = false;
        this.none.enable         = true;
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

        this.SetReplyButton(this.pon,  DialogResult.Cancel);
        this.SetReplyButton(this.hu,   DialogResult.Cancel);
        this.SetReplyButton(this.none, DialogResult.Cancel);
    }
}
