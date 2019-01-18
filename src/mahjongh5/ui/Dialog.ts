import * as Three from "three";
import { Signal } from "@robotlegsjs/signals";
import { ButtonEvent } from "./Button";
import Game from "../Game";
import RoundRectangleGeometry from "../Util/RoundRectangleGeometry";

/**
 * 參考Windows Form DialogResult
 * https://msdn.microsoft.com/zh-tw/library/system.windows.forms.dialogresult(v=vs.110).aspx
 */
export enum DialogResult {
    Abort,  // 對話方塊中，傳回值為 Abort （通常是從標記為 [中止] 按鈕傳送）。
    Cancel, // 對話方塊中，傳回值為 Cancel （通常是從一個標示為取消按鈕傳送）。
    Ignore, // 對話方塊中，傳回值為 Ignore （通常是從標記為 [忽略] 按鈕傳送）。
    No,     // 對話方塊中，傳回值為 No （通常是從標記為 [否] 按鈕傳送）。
    None,   // Nothing 從對話方塊傳回。 這表示強制回應對話方塊會繼續執行。
    OK,     // 對話方塊中，傳回值為 OK （通常是從一個標示為 [確定] 按鈕傳送）。
    Retry,  // 對話方塊中，傳回值為 Retry （通常是從標記為重試的按鈕傳送）。
    Yes,    // 對話方塊中，傳回值為 Yes （通常是從一個標示為 [是] 按鈕傳送）。
}

export default class Dialog extends Three.Group {
    public static result = DialogResult;

    /** 點擊對話以外的地方等於取消(僅modal為true時有用) */
    public backgroundCancel = false;
    /** 對話方塊隱藏時銷毀 */
    public destoryOnHide = true;
    public title: string = "";

    public game: Game;

    protected backgroundGraphics: Three.Mesh;

    private showSignal:  Signal;
    private hideSignal:  Signal;
    private replySignal: Signal = new Signal();

    public get onShow(): Signal {
        if (!this.showSignal) {
            this.showSignal = new Signal();
        }
        return this.showSignal;
    }

    public get onHide(): Signal {
        if (!this.hideSignal) {
            this.hideSignal = new Signal();
        }
        return this.hideSignal;
    }

    constructor(game: Game, onCreate?: (dialog: any) => void) {
        super();
        this.game    = game;
        this.visible = false;
        if (onCreate) {
            onCreate(this);
        }
        this.Create();
    }

    public Show(): Promise<DialogResult> {
        // this.rotation.setFromVector3(this.game.renderState.camera.rotation.toVector3());
        if (this.backgroundCancel) {
            this.game.domevent.addEventListener(this.game.renderState.scene, "click", this.Hide.bind(this), false);
        }
        this.visible = true;
        if (this.showSignal) {
            this.showSignal.dispatch();
        }
        return new Promise((resolve) => {
            this.replySignal.addOnce((result: DialogResult) => {
                resolve(result);
                this.Hide();
            });
        });
    }

    public Hide() {
        if (this.backgroundCancel) {
            this.game.domevent.removeEventListener(this.game.renderState.scene, "click", this.Hide.bind(this), false);
        }
        this.visible = false;
        if (this.hideSignal) {
            this.hideSignal.dispatch();
        }
    }

    public SetReplyButton(button: ButtonEvent, result: DialogResult) {
        button.onInputUp.add(() => this.replySignal.dispatch(result));
    }

    protected Create() {
    }

    protected CreateBG(w: number, h: number, r: number, alpha: number) {
        this.backgroundGraphics = new Three.Mesh(RoundRectangleGeometry(w, h, r, 10), new Three.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: alpha }));
    }
}
