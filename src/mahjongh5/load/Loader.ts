import * as Three from "three";
import { Signal } from "@robotlegsjs/signals";

export default class Loader extends Three.LoadingManager {
    private errorSignal?:   Signal;
    private loadSignal?:    Signal;
    private progessSignal?: Signal;

    public get onLoadError(): Signal {
        if (!this.errorSignal) {
            this.errorSignal = new Signal();
        }
        return this.errorSignal;
    }

    public get onLoadComplete(): Signal {
        if (!this.loadSignal) {
            this.loadSignal = new Signal();
        }
        return this.loadSignal;
    }

    public get onLoadProgress(): Signal {
        if (!this.progessSignal) {
            this.progessSignal = new Signal();
        }
        return this.progessSignal;
    }

    constructor() {
        super();
        const self = this;
        this.onError = (url: string) => {
            if (self.errorSignal) {
                self.errorSignal.dispatch(url);
            }
        };
        this.onLoad = () => {
            if (self.loadSignal) {
                self.loadSignal.dispatch();
            }
        };
        this.onProgress = (item: any, loaded: number, total: number) => {
            if (self.progessSignal) {
                self.progessSignal.dispatch(item, loaded, total);
            }
        };
    }
}
