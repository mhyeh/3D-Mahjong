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

    private _color: Three.Color;

    private mouseState: MouseState = MouseState.out;

    private texture?: Three.Texture;
    private tex?:     AltasTexture;

    private stateFrame: ButtonFrame;
    private frameName?: string | number;

    constructor(game: Game, geometry: Three.Geometry | Three.BufferGeometry, material: Three.Material | Three.Material[], x?: number, y?: number, z?: number, texture?: string, textureConfig?: string, callback?: () => void, callbackContext?: any, overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, disableFrame?: string | number) {
        super(geometry, material, x, y, z);
        if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
            material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
            this._color = material.color.clone();
        }

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
            if (this.enable) {
                if (this.stateTint.down) {
                    this.setButtonTint(this, this.stateTint.down);
                }
                if (this.stateFrame.downFrame) {
                    this.frame = this.stateFrame.downFrame;
                }
            }
            this.StateChangeHandler();
        });
        this.onInputUp.add(() => {
            if (this.enable) {
                if (this.stateTint.up) {
                    this.setButtonTint(this, this.stateTint.up);
                }
                if (this.stateFrame.upFrame) {
                    this.frame = this.stateFrame.upFrame;
                }
            }
            this.StateChangeHandler();
        });
        this.onInputOver.add(() => {
            if (this.enable) {
                if (this.stateTint.over) {
                    this.setButtonTint(this, this.stateTint.over);
                }
                if (this.stateFrame.overFrame) {
                    this.frame = this.stateFrame.overFrame;
                }
            }
            this.StateChangeHandler();
        });
        this.onInputOut.add(() => {
            if (this.enable) {
                if (this.stateTint.out) {
                    this.setButtonTint(this, this.stateTint.out);
                }
                if (this.stateFrame.outFrame) {
                    this.frame = this.stateFrame.outFrame;
                }
            }
            this.StateChangeHandler();
        });
        this.onEnableChange.add((enable: boolean) => {
            if (enable) {
                if (this.stateTint.out) {
                    this.setButtonTint(this, this.stateTint.out);
                }
                if (this.stateFrame.outFrame) {
                    this.frame = this.stateFrame.outFrame;
                }
            } else if (this.stateTint.disable) {
                if (this.stateTint.disable) {
                    this.setButtonTint(this, this.stateTint.disable);
                }
                if (this.stateFrame.disableFrame) {
                    this.frame = this.stateFrame.disableFrame;
                }
            } else {
                if (this.stateTint.out) {
                    this.setButtonTint(this, this.stateTint.out);
                }
                if (this.stateFrame.outFrame) {
                    this.frame = this.stateFrame.outFrame;
                }
            }
            this.StateChangeHandler();
        });
        game.domevent.addEventListener(this, "mousedown", () => {
            if (this.mouseState === MouseState.over || this.mouseState === MouseState.up) {
                this.mouseState = MouseState.down;
                this.onInputDown.dispatch();
            }
        }, false);
        game.domevent.addEventListener(this, "mouseup", () => {
            if (this.mouseState === MouseState.down) {
                this.mouseState = MouseState.up;
                this.onInputUp.dispatch();
            }
        }, false);
        game.domevent.addEventListener(this, "mouseout", () => {
            this.mouseState = MouseState.out;
            this.mouseState = MouseState.over;
            this.onInputOut.dispatch();
        }, false);
        game.domevent.addEventListener(this, "mousemove", () => {
            if (this.mouseState === MouseState.out) {
                this.mouseState = MouseState.over;
                this.onInputOver.dispatch();
            }
        }, false);
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

    private StateChangeHandler() {
        if (this.stateChangeSignal) {
            this.stateChangeSignal.dispatch();
        }
    }

    private setButtonTint(mesh: Three.Mesh, tint: number) {
        if (mesh.material instanceof Array) {
            mesh.material.forEach((m) => this.setMaterialTint(m, tint));
        } else if (mesh.material instanceof Three.MeshBasicMaterial    || mesh.material instanceof Three.MeshLambertMaterial ||
                   mesh.material instanceof Three.MeshStandardMaterial || mesh.material instanceof Three.MeshPhongMaterial) {
            const color = this._color.clone();
            mesh.material.color.set(color.multiply(new Three.Color(tint)));
        }
        mesh.children.forEach((child) => {
            if (child instanceof Three.Mesh) {
                this.setMaterialTint(child.material, tint);
            }
        });
    }

    private setMaterialTint(material: Three.Material | Three.Material[], tint: number) {
        if (material instanceof Array) {
            material.forEach((m) => this.setMaterialTint(m, tint));
        } else if (material instanceof Three.MeshBasicMaterial    || material instanceof Three.MeshLambertMaterial ||
                   material instanceof Three.MeshStandardMaterial || material instanceof Three.MeshPhongMaterial) {
            const color = this._color.clone();
            material.color.set(color.multiply(new Three.Color(tint)));
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
