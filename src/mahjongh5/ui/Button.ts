import { Signal } from "@robotlegsjs/signals";
import Sound from "../component/Sound";
import Game from "../Game";
import Cube from "./Cube";

export interface ButtonEvent {
    onInputUp: Signal;
    onInputDown: Signal;
    onInputOver?: Signal;
    onInputOut?: Signal;
}

export interface ButtonFrame {
    overFrame?: string | number;
    outFrame?: string | number;
    downFrame?: string | number;
    upFrame?: string | number;
    disableFrame?: string | number;
}

export interface ButtonTint {
    over?: number;
    out: number;
    down?: number;
    up?: number;
    disable?: number;
}

export interface ButtonSound {
    overSound?: Sound;
    outSound?: Sound;
    downSound?: Sound;
    upSound?: Sound;
}

export default class Button extends Cube implements ButtonEvent {
    public onEnableChange: Signal = new Signal();
    public onInputDown:    Signal = new Signal();
    public onInputUp:      Signal = new Signal();
    public onInputOver:    Signal = new Signal();
    public onInputOut:     Signal = new Signal();

    public stateTint: ButtonTint = { out: 0xFFFFFF };

    private stateFrame: ButtonFrame;
    private enableValue: boolean = true;
    private stateChangeSignal?: Signal;

    constructor(x?: number, y?: number, key?: string, callback?: () => void, callbackContext?: any, overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number) {
        super();

        this.stateFrame = { overFrame, outFrame, downFrame, upFrame, disableFrame };
        this.onInputDown.add(() => {
            if (this.stateTint.down && this.enable) {
                // this.tint = this.stateTint.down;
            }
            this.StateChangeHandler();
        });
        this.onInputUp.add(() => {
            if (this.stateTint.up && this.enable) {
                // this.tint = this.stateTint.up;
            }
            this.StateChangeHandler();
        });
        this.onInputOver.add(() => {
            if (this.stateTint.over && this.enable) {
                // this.tint = this.stateTint.over;
            }
            this.StateChangeHandler();
        });
        this.onInputOut.add(() => {
            if (this.stateTint.out && this.enable) {
                // this.tint = this.stateTint.out;
            }
            this.StateChangeHandler();
        });
        this.onEnableChange.add((enable: boolean) => {
            // if (enable) {
            //     if (this.input.pointerDown() && this.stateTint.down) {
            //         this.tint = this.stateTint.down;
            //     } else if (this.input.pointerOver() && this.stateTint.over) {
            //         this.tint = this.stateTint.over;
            //     } else {
            //         this.tint = this.stateTint.out;
            //     }
            // } else if (this.stateTint.disable) {
            //     this.tint = this.stateTint.disable;
            // } else {
            //     this.tint = this.stateTint.out;
            // }
            this.StateChangeHandler();
        });
    }

    public get onStateChange(): Signal {
        if (!this.stateChangeSignal) {
            this.stateChangeSignal = new Signal();
        }
        return this.stateChangeSignal;
    }

    public get outFrame(): string | number {
        return this.stateFrame.outFrame === undefined ? 0 : this.stateFrame.outFrame;
    }
    public set outFrame(value: string | number | undefined) {
        this.stateFrame.outFrame = value;
    }

    public get overFrame(): string | number {
        return this.stateFrame.overFrame === undefined ? this.outFrame : this.stateFrame.overFrame;
    }
    public set overFrame(value: string | number | undefined) {
        this.stateFrame.overFrame = value;
    }

    public get downFrame(): string | number {
        return this.stateFrame.downFrame === undefined ? this.outFrame : this.stateFrame.downFrame;
    }
    public set downFrame(value: string | number | undefined) {
        this.stateFrame.downFrame = value;
    }

    public get upFrame(): string | number {
        return this.stateFrame.upFrame === undefined ? this.outFrame : this.stateFrame.upFrame;
    }
    public set upFrame(value: string | number | undefined) {
        this.stateFrame.upFrame = value;
    }

    public get disableFrame(): string | number {
        return this.stateFrame.disableFrame === undefined ? this.outFrame : this.stateFrame.disableFrame;
    }
    public set disableFrame(value: string | number | undefined) {
        this.stateFrame.disableFrame = value;
    }

    public get enable(): boolean {
        return this.enableValue;
    }
    public set enable(value: boolean) {
        if (this.enableValue !== value) {
            this.enableValue = value;
            // this.input.enabled = value;
            // this.freezeFrames = !value;
            if (value) {
                this.setFrames(this.stateFrame);
            } else {
                this.frame = this.disableFrame;
            }
            this.onEnableChange.dispatch(value);
        }
    }

    public get frame(): string | number {
        // return super.frame;
        return 0;
    }
    public set frame(value: string | number) {
        // super.frame = value;
        // if (typeof value === "string") {
        //     super.frameName = value;
        // }
    }

    public setFrames(buttonFrame: ButtonFrame): void;
    public setFrames(overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number): void;
    public setFrames(overFrame?: string | number | ButtonFrame, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number): void {
        // this.stateFrame = (typeof overFrame === "object") ? overFrame : { overFrame, outFrame, downFrame, upFrame, disableFrame };
        // super.setFrames(this.stateFrame.overFrame, this.stateFrame.outFrame, this.stateFrame.downFrame, this.stateFrame.upFrame);
        // this.frame = this.outFrame;
        // if (!this.enable) {
        //     this.frame = this.disableFrame;
        // }
    }

    private StateChangeHandler() {
        if (this.stateChangeSignal) {
            this.stateChangeSignal.dispatch();
        }
    }
}
