import * as Three from "three";
import Effect from "mahjongh5/component/Effect";
import ImageTileTable from "mahjongh5/component/tile/ImageTileTable";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";

export default class ChangeTileEffect extends Effect {
    // private animTile: CommonTileList[] = [];
    // private anim:     Three.AnimationClip[];
    // private part2:    Three.AnimationClip[];

    constructor(scene: Three.Scene, tileTable: ImageTileTable) {
        super();

        // for (let i = 0; i < 4; i++) {
        //     this.animTile.push(new CommonTileList(3, tileTable, 64, 46, 34, i, false, 3));
        //     this.animTile[i].TileAnchor = new Three.Vector3(0.5, 0.5, 0.5);
        //     this.animTile[i].visible = false;
        // }

        // this.animTile[0].position = new Three.Vector3(scene.width / 2, 1400, this.animTile[0].position.z);
        // this.animTile[0].pivot.x = 55;
        // this.animTile[1].position = new Three.Vector3(1850, scene.height / 2, this.animTile[1].position.z);
        // this.animTile[1].pivot.y = 105;
        // this.animTile[2].position = new Three.Vector3(scene.width / 2, 100, this.animTile[2].position.z);
        // this.animTile[2].pivot.x = 105;
        // this.animTile[3].position = new Three.Vector3(150, scene.height / 2, this.animTile[3].position.z);
        // this.animTile[3].pivot.y = 55;

        // this.anim = new Array<Three.AnimationClip>(4);
        // this.anim[0] = scene.add.Three.AnimationClip(this.animTile[0]).to({ y: scene.height / 2 + 300 }, 1000, Easing.Linear.None, false);
        // this.anim[1] = scene.add.Three.AnimationClip(this.animTile[1]).to({ x: scene.width  / 2 + 300 }, 1000, Easing.Linear.None, false);
        // this.anim[2] = scene.add.Three.AnimationClip(this.animTile[2]).to({ y: scene.height / 2 - 300 }, 1000, Easing.Linear.None, false);
        // this.anim[3] = scene.add.Three.AnimationClip(this.animTile[3]).to({ x: scene.width  / 2 - 300 }, 1000, Easing.Linear.None, false);

        // this.part2 = new Array<Three.AnimationClip>(4);
    }

    protected *RunEffect(mode: number, index: number): IterableIterator<Promise<void>> {
        // if (mode === 0) {
        //     this.animTile[index].visible = true;
        //     this.anim[index].start();
        // } else {
        //     if (index === 0) {
        //         this.part2[0] = this.scene.add.tween(this.animTile[0]).to({ x: 1850 }, 1000, Easing.Linear.None, false);
        //         this.part2[1] = this.scene.add.tween(this.animTile[1]).to({ y: 100  }, 1000, Easing.Linear.None, false);
        //         this.part2[2] = this.scene.add.tween(this.animTile[2]).to({ x: 150  }, 1000, Easing.Linear.None, false);
        //         this.part2[3] = this.scene.add.tween(this.animTile[3]).to({ y: 1400 }, 1000, Easing.Linear.None, false);

        //         for (let i = 0; i < 4; i++) {
        //             this.scene.add.tween(this.animTile[i]).to({ z: i * 90, angle: -90 }, 1000, Easing.Linear.None, true).onUpdateCallback(() => {
        //                 this.animTile[i].position.x = this.scene.width  / 2 + Math.floor(300 * Math.cos(this.animTile[i].z * Math.PI / 180));
        //                 this.animTile[i].position.y = this.scene.height / 2 - Math.floor(300 * Math.sin(this.animTile[i].z * Math.PI / 180));
        //             }).onComplete.addOnce(() => {
        //                 this.part2[i].start().onComplete.addOnce(() => {
        //                     this.animTile[i].visible = false;
        //                 });
        //             });
        //         }
        //     } else if (index === 2) {
        //         this.part2[0] = this.scene.add.tween(this.animTile[0]).to({ x: 150  }, 1000, Easing.Linear.None, false);
        //         this.part2[1] = this.scene.add.tween(this.animTile[1]).to({ y: 1400 }, 1000, Easing.Linear.None, false);
        //         this.part2[2] = this.scene.add.tween(this.animTile[2]).to({ x: 1850 }, 1000, Easing.Linear.None, false);
        //         this.part2[3] = this.scene.add.tween(this.animTile[3]).to({ y: 100  }, 1000, Easing.Linear.None, false);

        //         for (let i = 0; i < 4; i++) {
        //             this.scene.add.tween(this.animTile[i]).to({ z: i * 90, angle: 90 }, 1000, Easing.Linear.None, true).onUpdateCallback(() => {
        //                 this.animTile[i].position.x = this.scene.width  / 2 - Math.pow(-1, i) * Math.floor(300 * Math.cos(this.animTile[i].z * Math.PI / 180));
        //                 this.animTile[i].position.y = this.scene.height / 2 - Math.pow(-1, i) * Math.floor(300 * Math.sin(this.animTile[i].z * Math.PI / 180));
        //             }).onComplete.addOnce(() => {
        //                 this.part2[i].start().onComplete.addOnce(() => {
        //                     this.animTile[i].visible = false;
        //                 });
        //             });
        //         }
        //     } else {
        //         this.part2[0] = this.scene.add.tween(this.animTile[0]).to({ y: 100  }, 2000, Easing.Linear.None, false);
        //         this.part2[1] = this.scene.add.tween(this.animTile[1]).to({ x: 150  }, 2000, Easing.Linear.None, false);
        //         this.part2[2] = this.scene.add.tween(this.animTile[2]).to({ y: 1400 }, 2000, Easing.Linear.None, false);
        //         this.part2[3] = this.scene.add.tween(this.animTile[3]).to({ x: 1850 }, 2000, Easing.Linear.None, false);

        //         for (let i = 0; i < 4; i++) {
        //             this.part2[(i + 1) % 4].start().onComplete.addOnce(() => {
        //                 this.animTile[i].visible = false;
        //             });
        //         }
        //     }
        // }
    }
}
