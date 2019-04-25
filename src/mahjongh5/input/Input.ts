import { Signal } from "@robotlegsjs/signals";
import ButtonData from "./ButtonData";
import ButtonKey from "./ButtonKey";
import { ButtonEvent } from "../ui/Button";
import * as System from "../System";
export default class Input {
    public static readonly key = ButtonKey;
    private static instance: Input;

    [buttonKey: number]: ButtonData;
    public anyKeyDownSignal: Signal;
    public anyKeyUpSignal:   Signal;
    private buttonDatas: { [buttonKey: number]: ButtonData } = {};

    public static get global(): Input {
        if (!Input.instance) {
            Input.instance = new Input();
        }
        return Input.instance;
    }

    /** 任何按鍵被按下時觸發，參數:(按下的按鍵) */
    public get onAnyKeyDown(): Signal {
        if (!this.anyKeyDownSignal) {
            this.anyKeyDownSignal = new Signal();
        }
        return this.anyKeyDownSignal;
    }

    /** 任何按鍵被放開時觸發，參數:(按下的按鍵) */
    public get onAnyKeyUp(): Signal {
        if (!this.anyKeyUpSignal) {
            this.anyKeyUpSignal = new Signal();
        }
        return this.anyKeyUpSignal;
    }

    constructor() {
        // 根據ButtonKey的內容自動產生getter
        for (const key in Input.key) {
            if (!Number.isNaN(Number(key)) && Input.key.hasOwnProperty(key)) {
                const keyIndex = Number(key);
                Object.defineProperty(this, key, {
                    get: () => {
                        if (!this.buttonDatas[keyIndex]) {
                            this.buttonDatas[keyIndex] = new ButtonData(keyIndex);
                            this.buttonDatas[keyIndex].onButtonDown.add(() => this.OnAnyKeyDownHandler(keyIndex));
                            this.buttonDatas[keyIndex].onButtonUp.add(() => this.OnAnyKeyUpHandler(keyIndex));
                        }
                        return this.buttonDatas[keyIndex];
                    },
                });
            }
        }
    }

    /**
     * 把所有設定都清除掉
     */
    public Reset() {
        for (const key in Input.key) {
            if (!Number.isNaN(Number(key)) && Input.key.hasOwnProperty(key)) {
                const keyIndex = Number(key);
                if (this.buttonDatas[keyIndex]) {
                    this.buttonDatas[keyIndex].onButtonDown.removeAll();
                    this.buttonDatas[keyIndex].onButtonUp.removeAll();
                    this.buttonDatas[keyIndex].onEnableChanged.removeAll();
                    delete this.buttonDatas[keyIndex];
                }
            }
        }
        delete this.buttonDatas;
        this.buttonDatas = {};
        if (this.anyKeyDownSignal) {
            this.anyKeyDownSignal.removeAll();
            delete this.anyKeyDownSignal;
        }
        if (this.anyKeyUpSignal) {
            this.anyKeyUpSignal.removeAll();
            delete this.anyKeyUpSignal;
        }
    }

    /**
     * 將Button設定成某個按鍵
     * @param button 要設定的按鈕
     * @param type 對應的按鈕功
     * @param holdDuration 按鈕要長按多久才算按下，單位為毫秒
     */
    public AddButton(button: ButtonEvent, type: ButtonKey, holdDuration: number = 0, data ?: string | number | boolean): void {
        this.AddSignal(button.onInputDown, button.onInputUp, button.onInputOut, type, holdDuration, data);
    }

    public AddSignal(onDown: Signal, onUp: Signal, onOut: Signal, type: ButtonKey, holdDuration: number = 0, data ?: string | number | boolean): void {
        let isPressed = false;
        const buttonDownCallBack = () => {
            if (isPressed) {
                this[type].SetButtonUp(data);
            }
            isPressed = true;
            this[type].SetButtonDown(data);
        };
        const buttonUpCallBack = () => {
            if (isPressed) {
                isPressed = false;
                this[type].SetButtonUp(data);
            }
        };
        const buttonOutCallBack = () => {
            isPressed = false;
            this[type].SetButtonOut();
        };
        if (holdDuration !== 0) {
            onDown.add(() => {
                const buttonUp = new Promise<boolean>((resolve) => onUp.addOnce(() => resolve(false)));
                const timeout = System.DelayValue(holdDuration, true);
                Promise.race([buttonUp, timeout])
                    .then((value) => {
                        if (value) {
                            buttonDownCallBack();
                        }
                    });
            });
            onUp.add(buttonUpCallBack);
            onOut.add(buttonOutCallBack);
        } else {
            onDown.add(buttonDownCallBack);
            onUp.add(buttonUpCallBack);
            onOut.add(buttonOutCallBack);
        }
    }

    public WaitAnyKeyDown(): Promise<ButtonKey> {
        return new Promise<ButtonKey>((resolve) => {
            this.onAnyKeyDown.addOnce(resolve);
        });
    }

    public WaitAnyKeyUp(): Promise<ButtonKey> {
        return new Promise<ButtonKey>((resolve) => {
            this.onAnyKeyUp.addOnce(resolve);
        });
    }

    public WaitKeyDown(key: ButtonKey): Promise<ButtonKey> {
        return new Promise<ButtonKey>((resolve) => {
            this[key].onButtonDown.addOnce(resolve);
        });
    }

    public WaitKeyUp(key: ButtonKey): Promise<any> {
        return new Promise<any>((resolve) => {
            this[key].onButtonUp.addOnce(resolve);
        });
    }

    public WaitKeyPress(key: ButtonKey): Promise<ButtonKey> {
        if (this[key].IsButtonPressed) {
            return Promise.resolve(key);
        } else {
            return this.WaitKeyDown(key);
        }
    }

    private OnAnyKeyDownHandler(key: ButtonKey): void {
        if (this.anyKeyDownSignal) {
            this.anyKeyDownSignal.dispatch(key);
        }
    }

    private OnAnyKeyUpHandler(key: ButtonKey): void {
        if (this.anyKeyUpSignal) {
            this.anyKeyUpSignal.dispatch(key);
        }
    }
}
