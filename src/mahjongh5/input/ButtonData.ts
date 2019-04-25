import { Signal } from "@robotlegsjs/signals";
import ButtonKey from "./ButtonKey";
export default class ButtonData {
    public onButtonDown:    Signal = new Signal();
    public onButtonUp:      Signal = new Signal();
    public onEnableChanged: Signal = new Signal();

    private enable: boolean = true;
    private isButtonPressed: boolean = false;
    private pressCount: number = 0;
    private buttonType: ButtonKey;

    constructor(buttonType: ButtonKey = ButtonKey.None) {
        this.buttonType = buttonType;
    }

    public get IsButtonPressed(): boolean {
        return this.isButtonPressed;
    }

    public get IsButtonReleased(): boolean {
        return !this.isButtonPressed;
    }

    public get Enable(): boolean {
        return this.enable;
    }
    public set Enable(value: boolean) {
        if (this.enable !== value) {
            this.enable = value;
            this.isButtonPressed = false;
            this.pressCount = 0;
            this.onEnableChanged.dispatch(this.enable);
        }
    }

    public SetButtonDown(data ?: string | number | boolean): void {
        if (this.enable) {
            this.pressCount++;
            if (this.pressCount === 1) {
                this.isButtonPressed = true;
                if (data !== undefined) {
                    this.onButtonDown.dispatch(data);
                } else {
                    this.onButtonDown.dispatch(this.buttonType);
                }
            }
        }
    }

    public SetButtonUp(data ?: string | number | boolean): void {
        if (this.enable) {
            this.pressCount--;
            if (this.pressCount === 0) {
                this.isButtonPressed = false;
                if (data !== undefined) {
                    this.onButtonUp.dispatch(data);
                } else {
                    this.onButtonUp.dispatch(this.buttonType);
                }
            }
        }
    }

    public SetButtonOut() {
        this.pressCount = 0;
    }
}
