import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import State from "./State";
import LoadState from "./load/LoadState";
import * as Assets from "./Assets";
import Loader from "./load/Loader";
import DomEvents from "./Util/DomEvents";

export default class Game {
    public assets: typeof Assets | Array<typeof Assets> = Assets;
    public gameStates: State[] = [];
    public domevent: DomEvents;

    public load:  Loader;
    public cache: { [key: string]: any } = {};

    public renderer: Three.WebGLRenderer;

    public renderState: State;

    private loadStateValue?: LoadState;

    public get loadState(): LoadState {
        if (!this.loadStateValue) {
            this.loadStateValue = new LoadState(this);
        }
        return this.loadStateValue;
    }
    public set loadState(value: LoadState) {
        this.loadStateValue = value;
    }

    public get sceneWidth(): number {
        return Math.min(window.innerWidth, window.innerHeight * ASPECT);
    }

    public get sceneHeight(): number {
        return this.sceneWidth / ASPECT;
    }

    constructor(display: string) {
        const _canvas  = document.createElement("canvas");
        const _context = _canvas.getContext("webgl2");
        this.renderer  = new Three.WebGLRenderer({ antialias: true, canvas: _canvas, context : (_context as any) });
        this.load      = new Loader();
        this.renderer.setSize(this.sceneWidth, this.sceneWidth);
        document.getElementById(display).appendChild(this.renderer.domElement);
        this.domevent = new DomEvents(this.renderer.domElement);
    }

    public async Start() {
        this.loadState.onPreload.add(() => {
            if (this.assets instanceof Array) {
                for (const asset of this.assets) {
                    asset.CreateLoadTask(this, { [asset.sectionFlag.preload]: true }).AddToLoader();
                }
            } else {
                this.assets.CreateLoadTask(this, { [this.assets.sectionFlag.preload]: true }).AddToLoader();
            }
        });
        // 加入載入任務
        if (this.assets instanceof Array) {
            for (const asset of this.assets) {
                this.loadState.loadQueue.push(asset.CreateLoadTask(this, { [asset.sectionFlag.preload]: false }));
            }
        } else {
            this.loadState.loadQueue.push(this.assets.CreateLoadTask(this, { [this.assets.sectionFlag.preload]: false }));
        }

        if (this.gameStates.length > 0) {
            this.loadState.onAllComplete.add(() => this.SwitchScene(this.gameStates[0]));
        }
        this.loadState.onTaskError.add((sender: any, error: any) => window.location.reload());
        await this.SwitchScene(this.loadState);
        this.render();
    }

    public async SwitchScene(state: State) {
        await state.create();
        this.renderer.setSize(this.sceneWidth, this.sceneHeight);
        this.domevent.camera = state.camera;
        this.renderState     = state;
    }

    public render() {
        requestAnimationFrame(this.render.bind(this));
        Tween.update();
        this.renderer.render(this.renderState.scene, this.renderState.camera);
    }

    public Resize() {
        for (const state of this.gameStates) {
            if (state.camera) {
                state.camera.aspect = this.sceneWidth / this.sceneHeight;
                state.camera.updateProjectionMatrix();
            }
        }
        this.renderer.setSize(this.sceneWidth, this.sceneHeight);
    }
}
