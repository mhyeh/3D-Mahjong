import * as Three from "three";
import State from "./State";

export default class Game {
    public gameState: State[] = [];

    public renderer = new Three.WebGLRenderer();

    public get sceneWidth(): number {
        return window.innerWidth;
    }

    public get sceneHeight(): number {
        return window.innerHeight;
    }

    constructor(display: string) {
        this.renderer.setSize(this.sceneWidth, this.sceneWidth);
        document.getElementById(display).appendChild(this.renderer.domElement);
    }

    public Start() {
        // TODO
    }

    public Resize() {
        this.renderer.setSize(this.sceneWidth, this.sceneHeight);
        for (const state of this.gameState) {
            state.camera.aspect = this.sceneWidth / this.sceneHeight;
            state.camera.updateProjectionMatrix();
        }
    }
}
