import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import Effect from "mahjongh5/component/Effect";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";
import Game from "mahjongh5/Game";

export default class ChangeTileEffect extends Effect {
    private animTile: CommonTileList[] = [];
    private anim:     Tween.Tween[];
    private part2:    Tween.Tween[];

    constructor(game: Game) {
        super();

        for (let i = 0; i < 4; i++) {
            this.animTile.push(new CommonTileList(game, 3, TILE_W, TILE_H, TILE_D, false, 3));
            this.animTile[i].tiles.forEach((tile) => tile.visible = false);
        }

        this.animTile[0].rotateX(Math.PI);
        new Three.Box3().setFromObject(this.animTile[0]).getCenter(this.animTile[0].position).multiplyScalar(-1);
        this.animTile[0].position.y = -900 + TILE_H;
        this.animTile[0].position.z = (BOARD_D + TILE_D) / 2;

        this.animTile[1].rotation.set(0, Math.PI, Math.PI / 2);
        new Three.Box3().setFromObject(this.animTile[1]).getCenter(this.animTile[1].position).multiplyScalar(-1);
        this.animTile[1].position.x = 900 - TILE_H;
        this.animTile[1].position.z = (BOARD_D + TILE_D) / 2;

        this.animTile[2].rotation.set(Math.PI, 0, Math.PI);
        new Three.Box3().setFromObject(this.animTile[2]).getCenter(this.animTile[2].position).multiplyScalar(-1);
        this.animTile[2].position.y = 900 - TILE_H;
        this.animTile[2].position.z = (BOARD_D + TILE_D) / 2;

        this.animTile[3].rotation.set(0, Math.PI, Math.PI * 3 / 2);
        new Three.Box3().setFromObject(this.animTile[3]).getCenter(this.animTile[3].position).multiplyScalar(-1);
        this.animTile[3].position.x = -900 + TILE_H;
        this.animTile[3].position.z = (BOARD_D + TILE_D) / 2;

        this.anim    = new Array<Tween.Tween>(4);
        this.anim[0] = new Tween.Tween(this.animTile[0].position).to({ y: -500 + TILE_H / 2 }, 700);
        this.anim[1] = new Tween.Tween(this.animTile[1].position).to({ x:  500 - TILE_H / 2 }, 700);
        this.anim[2] = new Tween.Tween(this.animTile[2].position).to({ y:  500 - TILE_H / 2 }, 700);
        this.anim[3] = new Tween.Tween(this.animTile[3].position).to({ x: -500 + TILE_H / 2 }, 700);
        this.anim.forEach((anim) => {
            anim.onUpdate(() => {
                CommonTileList.update();
            });
        });

        this.add(...this.animTile);

        this.part2 = new Array<Tween.Tween>(4);
    }

    protected *RunEffect(mode: number, index: number): IterableIterator<Promise<void>> {
        if (mode === 0) {
            this.animTile[index].tiles.forEach((tile) => tile.visible = true);
            this.anim[index].start();
            CommonTileList.update();
        } else {
            if (index === 1) {
                this.part2[0] = new Tween.Tween(this.animTile[0].position).to({ y:  900 - TILE_H }, 1400);
                this.part2[1] = new Tween.Tween(this.animTile[1].position).to({ x: -900 + TILE_H }, 1400);
                this.part2[2] = new Tween.Tween(this.animTile[2].position).to({ y: -900 + TILE_H }, 1400);
                this.part2[3] = new Tween.Tween(this.animTile[3].position).to({ x:  900 - TILE_H }, 1400);
                this.part2.forEach((part2) => {
                    part2.onUpdate(() => {
                        CommonTileList.update();
                    });
                });
                for (let i = 0; i < 4; i++) {
                    this.part2[i].start().onComplete(() => {
                        this.animTile[i].tiles.forEach((tile) => tile.visible = false);
                        CommonTileList.update();
                    });
                }
            } else {
                const pivot = new Three.Object3D();
                this.add(pivot);
                this.remove(...this.animTile);
                pivot.add(...this.animTile);
                const anim = new Tween.Tween(pivot.rotation).to({z: Math.PI / 2 * (index === 1 ? 1 : -1)}, 700);
                anim.onUpdate(() => {
                    CommonTileList.update();
                });
                this.part2[0] = new Tween.Tween(this.animTile[0].position).to({ y: -900 + TILE_H }, 700);
                this.part2[1] = new Tween.Tween(this.animTile[1].position).to({ x:  900 - TILE_H }, 700);
                this.part2[2] = new Tween.Tween(this.animTile[2].position).to({ y:  900 - TILE_H }, 700);
                this.part2[3] = new Tween.Tween(this.animTile[3].position).to({ x: -900 + TILE_H }, 700);
                this.part2.forEach((part2) => {
                    part2.onUpdate(() => {
                        CommonTileList.update();
                    });
                });
                anim.start().onComplete(() => {
                    pivot.remove(...this.animTile);
                    this.add(...this.animTile);
                    for (let i = 0; i < 4; i++) {
                        this.part2[i].start().onComplete(() => {
                            this.animTile[i].tiles.forEach((tile) => tile.visible = false);
                            CommonTileList.update();
                        });
                    }
                });
            }
        }
    }
}
