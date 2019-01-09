import * as Three from "three";
import { Signal } from "@robotlegsjs/signals";

export default class State {

    public scene:  Three.Scene;
    public camera: Three.PerspectiveCamera;

    private initSignal?:    Signal;
    private preloadSignal?: Signal;
    private createSignal?:  Signal;

    constructor() {

    }

    public get onInit(): Signal {
        if (!this.initSignal) {
            this.initSignal = new Signal();
        }
        return this.initSignal;
    }

    public get onPreload(): Signal {
        if (!this.preloadSignal) {
            this.preloadSignal = new Signal();
        }
        return this.preloadSignal;
    }

    public get onCreate(): Signal {
        if (!this.createSignal) {
            this.createSignal = new Signal();
        }
        return this.createSignal;
    }

    public init() {
        if (this.initSignal) {
            this.initSignal.dispatch(this);
        }
    }

    public preload() {
        if (this.preloadSignal) {
            this.preloadSignal.dispatch(this);
        }
    }

    public create() {
        if (this.createSignal) {
            this.createSignal.dispatch(this);
        }
    }

    public shutdown() {

    }

    public render() {
    }

    public LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        if (progressCallback) {
            progressCallback(1);
        }
        return Promise.resolve();
    }
}
