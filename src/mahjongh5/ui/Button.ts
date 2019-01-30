import * as Three from "three";
import { Signal } from "@robotlegsjs/signals";
import Game from "../Game";
import Cube from "./Cube";
import AltasTexture from "../Util/AltasTexture";

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

export interface ButtonFrame {
    overFrame?:    string | number;
    outFrame?:     string | number;
    downFrame?:    string | number;
    upFrame?:      string | number;
    disableFrame?: string | number;
}

export interface ButtonSound {
    overSound?: Three.Audio;
    outSound?:  Three.Audio;
    downSound?: Three.Audio;
    upSound?:   Three.Audio;
}

enum MouseState {
    up   = 0,
    down = 1,
    out  = 2,
    over = 3,
}

export default class Button extends Cube implements ButtonEvent {
    public onEnableChange: Signal = new Signal();
    public onInputDown:    Signal = new Signal();
    public onInputUp:      Signal = new Signal();
    public onInputOver:    Signal = new Signal();
    public onInputOut:     Signal = new Signal();

    public stateTint: ButtonTint = {
                                    over:    0xFFFFFF,
                                    out:     0xFFFFFF,
                                    down:    0xFFFFFF,
                                    up:      0xFFFFFF,
                                    disable: 0xFFFFFF,
                                };

    private enableValue: boolean = true;

    private stateChangeSignal?: Signal;

    private mouseState: MouseState = MouseState.out;

    private texture?: Three.Texture;
    private tex?:     AltasTexture;

    private stateFrame: ButtonFrame;
    private frameName?: string | number;

    private game: Game;

    constructor(game: Game, geometry?: Three.Geometry | Three.BufferGeometry, material?: Three.Material | Three.Material[], x?: number, y?: number, z?: number, texture?: string, textureConfig?: string, callback?: () => void, callbackContext?: any, overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number) {
        super(geometry, material, x, y, z);
        this.game = game;

        if (texture) {
            this.texture = new Three.Texture(game.cache[texture]);
            this.texture.needsUpdate = true;
            if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
                material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
                    material.map = this.texture;
            }
        }
        if (textureConfig) {
            this.tex = new AltasTexture(game.cache[textureConfig].frames, game.cache[texture]);
        }
        this.stateFrame = { overFrame, outFrame, downFrame, upFrame, disableFrame };

        this.onInputDown.add(() => {
            if (this.stateTint.down) {
                this.tint = this.stateTint.down;
            }
            if (this.stateFrame.downFrame) {
                this.frame = this.stateFrame.downFrame;
            }
            this.StateChangeHandler();
        });
        this.onInputUp.add(() => {
            if (this.stateTint.up) {
                this.tint = this.stateTint.up;
            }
            if (this.stateFrame.upFrame) {
                this.frame = this.stateFrame.upFrame;
            }
            this.StateChangeHandler();
        });
        this.onInputOver.add(() => {
            if (this.stateTint.over) {
                this.tint = this.stateTint.over;
            }
            if (this.stateFrame.overFrame) {
                this.frame = this.stateFrame.overFrame;
            }
            this.StateChangeHandler();
        });
        this.onInputOut.add(() => {
            if (this.stateTint.out) {
                this.tint = this.stateTint.out;
            }
            if (this.stateFrame.outFrame) {
                this.frame = this.stateFrame.outFrame;
            }
            this.StateChangeHandler();
        });
        this.onEnableChange.add((enable: boolean) => {
            if (enable) {
                if (this.stateTint.out) {
                    this.tint = this.stateTint.out;
                }
                if (this.stateFrame.outFrame) {
                    this.frame = this.stateFrame.outFrame;
                }
            } else if (this.stateTint.disable) {
                if (this.stateTint.disable) {
                    this.tint = this.stateTint.disable;
                }
                if (this.stateFrame.disableFrame) {
                    this.frame = this.stateFrame.disableFrame;
                }
            } else {
                if (this.stateTint.out) {
                    this.tint = this.stateTint.out;
                }
                if (this.stateFrame.outFrame) {
                    this.frame = this.stateFrame.outFrame;
                }
            }
            this.StateChangeHandler();
        });
        game.domevent.addEventListener(this, "mousedown", this.mouseDown.bind(this), false);
        game.domevent.addEventListener(this, "mouseup",   this.mouseUp.bind(this),   false);
        game.domevent.addEventListener(this, "mouseout",  this.mouseOut.bind(this),  false);
        game.domevent.addEventListener(this, "mousemove", this.mouseOver.bind(this), false);
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
        return this.frameName;
    }
    public set frame(value: string | number) {
        this.frameName = value;
        if (this.tex) {
            this.setButtonFrame(this.material);
        }
    }

    public setFrames(buttonFrame: ButtonFrame): void;
    public setFrames(overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number): void;
    public setFrames(overFrame?: string | number | ButtonFrame, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number): void {
        this.stateFrame = (typeof overFrame === "object") ? overFrame : { overFrame, outFrame, downFrame, upFrame, disableFrame };
        this.frame = this.outFrame;
        if (!this.enable) {
            this.frame = this.disableFrame;
        }
    }

    public removeAllEvent() {
        this.game.domevent.removeEventListener(this, "mousedown", this.mouseDown.bind(this), false);
        this.game.domevent.removeEventListener(this, "mouseup",   this.mouseUp.bind(this),   false);
        this.game.domevent.removeEventListener(this, "mouseout",  this.mouseOut.bind(this),  false);
        this.game.domevent.removeEventListener(this, "mousemove", this.mouseOver.bind(this), false);
    }

    private mouseDown() {
        if (this.enable && (this.mouseState === MouseState.over || this.mouseState === MouseState.up)) {
            this.mouseState = MouseState.down;
            this.onInputDown.dispatch();
        }
    }

    private mouseUp() {
        if (this.enable && (this.mouseState === MouseState.down)) {
            this.mouseState = MouseState.up;
            this.onInputUp.dispatch();
        }
    }

    private mouseOut() {
        if (this.enable) {
            this.mouseState = MouseState.out;
            this.onInputOut.dispatch();
        }
    }

    private mouseOver() {
        if (this.enable && (this.mouseState === MouseState.out)) {
            this.mouseState = MouseState.over;
            this.onInputOver.dispatch();
        }
    }

    private StateChangeHandler() {
        if (this.stateChangeSignal) {
            this.stateChangeSignal.dispatch();
        }
    }

    private setButtonFrame(material: Three.Material | Three.Material[]) {
        if (material instanceof Array) {
            material.forEach((m) => this.setButtonFrame(m));
        } else if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
                   material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
            const frame = String(this.frame);
            material.map = this.tex.Get(frame);
        }
    }
}
