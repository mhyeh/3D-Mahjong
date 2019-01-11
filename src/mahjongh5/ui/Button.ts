import * as Three from "three";
import { Signal } from "@robotlegsjs/signals";
import Sound from "./Sound";
import Game from "../Game";
import Cube from "./Cube";

export interface ButtonEvent {
    onInputUp:    Signal;
    onInputDown:  Signal;
    onInputOver?: Signal;
    onInputOut?:  Signal;
}

export interface ButtonTint {
    over?:    number;
    out:      number;
    down?:    number;
    up?:      number;
    disable?: number;
}

export interface ButtonSound {
    overSound?: Sound;
    outSound?:  Sound;
    downSound?: Sound;
    upSound?:   Sound;
}

export default class Button extends Cube implements ButtonEvent {
    public onEnableChange: Signal = new Signal();
    public onInputDown:    Signal = new Signal();
    public onInputUp:      Signal = new Signal();
    public onInputOver:    Signal = new Signal();
    public onInputOut:     Signal = new Signal();

    public stateTint: ButtonTint = { out: 0xFFFFFF };

    private enableValue: boolean = true;
    private stateChangeSignal?: Signal;

    constructor(game: Game, geometry: Three.Geometry | Three.BufferGeometry, material: Three.Material | Three.Material[], x?: number, y?: number, z?: number, key?: string, callback?: () => void, callbackContext?: any, overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number) {
        super(geometry, material, x, y, z);

        // TODO: set frame

        this.onInputDown.add(() => {
            if (this.stateTint.down && this.enable) {
                this.setButtonTint(material, this.stateTint.down);
            }
            this.StateChangeHandler();
        });
        this.onInputUp.add(() => {
            if (this.stateTint.up && this.enable) {
                this.setButtonTint(material, this.stateTint.up);
            }
            this.StateChangeHandler();
        });
        this.onInputOver.add(() => {
            if (this.stateTint.over && this.enable) {
                this.setButtonTint(material, this.stateTint.over);
            }
            this.StateChangeHandler();
        });
        this.onInputOut.add(() => {
            if (this.stateTint.out && this.enable) {
                this.setButtonTint(material, this.stateTint.out);
            }
            this.StateChangeHandler();
        });
        this.onEnableChange.add((enable: boolean) => {
            if (enable) {
                this.setButtonTint(material, this.stateTint.out);
            } else if (this.stateTint.disable) {
                this.setButtonTint(material, this.stateTint.disable);
            } else {
                this.setButtonTint(material, this.stateTint.out);
            }
            this.StateChangeHandler();
        });
        game.domevent.addEventListener(this, "mousedown", this.onInputDown.dispatch(), false);
        game.domevent.addEventListener(this, "mouseup",   this.onInputUp.dispatch(),   false);
        game.domevent.addEventListener(this, "mouseout",  this.onInputOut.dispatch(),  false);
        game.domevent.addEventListener(this, "mousemove", this.onInputOver.dispatch(), false);
    }

    public get onStateChange(): Signal {
        if (!this.stateChangeSignal) {
            this.stateChangeSignal = new Signal();
        }
        return this.stateChangeSignal;
    }

    public get enable(): boolean {
        return this.enableValue;
    }
    public set enable(value: boolean) {
        if (this.enableValue !== value) {
            this.enableValue = value;
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

    public setFrames(buttonFrame: string | number): void {
        this.frame = buttonFrame;
    }

    private StateChangeHandler() {
        if (this.stateChangeSignal) {
            this.stateChangeSignal.dispatch();
        }
    }

    private setButtonTint(material: Three.Material | Three.Material[], tint: number) {
        if (material instanceof Array) {
            material.forEach((m) => this.setButtonTint(m, tint));
        } else if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
                   material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
            material.color.set(tint);
        }
    }
}
