import * as Three from "three";
import TileList from "./TileList";
import ImageTile from "./ImageTile";
import ImageTileTable from "./ImageTileTable";
import Input from "mahjongh5/input/Input";
import Game from "mahjongh5/Game";
import RoundEdgedBox from "mahjongh5/Util/RoundBoxGeometry";

export default class CommonTileList extends TileList<ImageTile> {
    public static intersectsScene:   Three.Scene;
    public static bufferGeometry:    Three.BufferGeometry;
    public static instancedGeometry: Three.InstancedBufferGeometry;
    public static rawShaderMaterial: Three.MeshLambertMaterial;

    public static Init(tileW: number, tileH: number, tileD: number, tileR: number, tileTable: ImageTileTable) {
        CommonTileList.maxNum            = 200;
        CommonTileList.bufferGeometry    = RoundEdgedBox(tileW, tileH, tileD, tileR, 1, 1, 1, 3);
        CommonTileList.intersectsScene   = new Three.Scene();
        CommonTileList.instancedGeometry = new Three.InstancedBufferGeometry();
        Object.keys(CommonTileList.bufferGeometry.attributes).forEach((attributeName) => {
            CommonTileList.instancedGeometry.attributes[attributeName] = CommonTileList.bufferGeometry.attributes[attributeName];
        });
        CommonTileList.instancedGeometry.index = CommonTileList.bufferGeometry.index;
        CommonTileList.instancedGeometry.maxInstancedCount = CommonTileList.maxNum;
        const mat4ArraySize = CommonTileList.maxNum * 4;
        CommonTileList.transformArray = [
            new Float32Array(mat4ArraySize),
            new Float32Array(mat4ArraySize),
            new Float32Array(mat4ArraySize),
            new Float32Array(mat4ArraySize),
        ];
        CommonTileList.tintArray         = new Float32Array(mat4ArraySize);
        CommonTileList.uvArray           = new Float32Array(mat4ArraySize);
        CommonTileList.rawShaderMaterial = new Three.MeshLambertMaterial({ map: tileTable.texture });
        CommonTileList.rawShaderMaterial.onBeforeCompile = (shader: Three.ShaderMaterialParameters) => {
            shader.vertexShader = `
                attribute vec4 aInstanceMatrix0;
                attribute vec4 aInstanceMatrix1;
                attribute vec4 aInstanceMatrix2;
                attribute vec4 aInstanceMatrix3;
                attribute vec4 uv_;
                attribute vec4 tint;
                varying vec4  vTint;
                varying vec3  vNorm;
                varying float vNorm_;
                varying vec2  vUv_;
                ${
                    shader.vertexShader.replace(
                        "#include <begin_vertex>",
                        `
                        vUv_    = uv_.xy;
                        vTint   = tint;
                        vNorm   = normal;
                        vNorm_  = position.z < 0.0 ? -1.0 : 1.0;
                        vUv_.x += position.x > 0.0 ? uv_.z: 0.0;
                        vUv_.y += position.y > 0.0 ? uv_.w: 0.0;
                        vec3 transformed = vec3(aInstanceMatrix * vec4(position, 1.));
                        `,
                    )
                }
            `;
            shader.vertexShader = shader.vertexShader.replace(
                `#include <beginnormal_vertex>`,
                `
                #include <beginnormal_vertex>
                vNorm = objectNormal;
                `,
            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <beginnormal_vertex>`,
                `
                mat4 aInstanceMatrix = mat4(
                  aInstanceMatrix0,
                  aInstanceMatrix1,
                  aInstanceMatrix2,
                  aInstanceMatrix3
                );
                vec3 objectNormal = vec3(aInstanceMatrix * vec4(normal, 0.));
                `,
            );
            shader.fragmentShader = `
                varying vec4  vTint;
                varying vec3  vNorm;
                varying float vNorm_;
                varying vec2  vUv_;
                ${
                    shader.fragmentShader.replace(
                        "#include <map_fragment>",
                        `
                        vec4 white = vec4(1, 1, 1, 1);
                        if (vNorm_ < -0.5f) {
                            diffuseColor *= vec4(0.12, 0.541, 0., 1.);
                        } else if (vNorm.z > 0.99) {
                            #ifdef USE_MAP
                                vec4 texelColor = texture2D(map, vUv_);

                                texelColor = mapTexelToLinear(texelColor);
                                diffuseColor *= texelColor;
                            #else
                                diffuseColor *= white;
                            #endif
                        } else {
                            diffuseColor *= white;
                        }
                        `,
                    )
                }
            `;
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                "diffuseColor *= vTint;",
            );
        };
        CommonTileList.tileTable = tileTable;
        for (let i = 0; i < CommonTileList.maxNum; i++) {
            CommonTileList.avaliableIndex.push(true);
        }
        CommonTileList.tiles = new Array<ImageTile>(CommonTileList.maxNum);
    }

    public static update() {
        CommonTileList.intersectsScene.updateMatrixWorld(true);
        for (let i = 0; i < CommonTileList.avaliableIndex.length; i++) {
            if (!CommonTileList.avaliableIndex[i] && CommonTileList.tiles[i].visible) {
                const color = new Three.Color(CommonTileList.tiles[i].tint);
                const uv    = CommonTileList.tileTable.GetUv(CommonTileList.tiles[i].ID);
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        CommonTileList.transformArray[r][i * 4 + c] = CommonTileList.tiles[i].matrixWorld.elements[r * 4 + c];
                    }
                    CommonTileList.tintArray[i * 4 + r] = color.toArray()[r];
                    CommonTileList.uvArray[i * 4 + r]   = uv.toArray()[r];
                }
            } else {
                const color = new Three.Color(0xFFFFFF);
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        CommonTileList.transformArray[r][i * 4 + c] = 0;
                    }
                    CommonTileList.tintArray[i * 4 + r] = color.toArray()[r];
                    CommonTileList.uvArray[i * 4 + r]   = 0;
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            const attribute   = new Three.InstancedBufferAttribute(CommonTileList.transformArray[i], 4);
            attribute.dynamic = true;
            CommonTileList.instancedGeometry.addAttribute(`aInstanceMatrix${i}`, attribute);
        }
        CommonTileList.instancedGeometry.addAttribute("tint", new Three.InstancedBufferAttribute(CommonTileList.tintArray, 4));
        CommonTileList.instancedGeometry.addAttribute("uv_",  new Three.InstancedBufferAttribute(CommonTileList.uvArray,   4));
    }

    protected static tileTable: ImageTileTable;
    protected static tiles:     ImageTile[];

    protected static addTile(tile: ImageTile) {
        tile.onStateChange.add(() => {
            CommonTileList.update();
        });
        for (let i = 0; i < CommonTileList.avaliableIndex.length; i++) {
            if (CommonTileList.avaliableIndex[i]) {
                CommonTileList.avaliableIndex[i] = false;
                tile.index = i;
                CommonTileList.tiles[i] = tile;
                break;
            }
        }
        CommonTileList.tileCount++;
    }

    protected static removeTile(tile: ImageTile) {
        CommonTileList.avaliableIndex[tile.index] = true;
        CommonTileList.tileCount--;
    }

    private static maxNum:         number;
    private static tileCount:      number = 0;
    private static avaliableIndex: boolean[] = [];
    private static transformArray: Float32Array[];
    private static tintArray:      Float32Array;
    private static uvArray:        Float32Array;

    public tileW: number;
    public tileH: number;
    public tileD: number;
    public tileR: number;

    protected game: Game;

    private sortable: boolean;

    constructor(game: Game, tileCount: number, tileW: number, tileH: number, tileD: number, clickable: boolean = false, maxLen = -1, sortable = true) {
        super(clickable, maxLen);
        this.game = game;

        this.tileW = tileW;
        this.tileH = tileH;
        this.tileD = tileD;
        this.tileR = TILE_R;

        for (let i = 0; i < tileCount; i++) {
            this.tiles.push(new ImageTile(game, CommonTileList.bufferGeometry, CommonTileList.tileTable));
            if (clickable) {
                this.tiles[i].setTint(0x707070, 0x707070);
            } else {
                this.tiles[i].enable = false;
            }
            this.tiles[i].ID = "None";
            this.add(this.tiles[i]);
            CommonTileList.addTile(this.tiles[i]);
        }
        this.ArrangeTile();

        this.sortable = sortable;
    }

    public AddTile(ID: string) {
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2, o: 3, f: 4};
        const newTile = new ImageTile(this.game, CommonTileList.bufferGeometry, CommonTileList.tileTable);
        if (this.sortable) {
            let index = 0;
            for (index = 0; index < this.tileCount; index++) {
                const t1 = this.tiles[index].ID;
                const t2 = ID;
                if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                    break;
                }
            }
            this.tiles.splice(index, 0, newTile);
        } else {
            this.tiles.push(newTile);
        }
        this.add(newTile);
        CommonTileList.addTile(newTile);
        newTile.ID    = ID;
        newTile.color = ID.slice(0, 1);
        if (this.clickable) {
            newTile.setTint(0x707070, 0x707070);
            this.Input.AddButton(newTile, Input.key.Throw, undefined, newTile.uuid);
        } else {
            newTile.enable = false;
        }
        this.ArrangeTile();
    }

    public ClearTileList() {
        const list = this.tiles.map((tile) => tile.ID);
        list.forEach((ID) => this.RemoveTile(ID));
    }

    public RemoveTile(ID: string) {
        let index = -1;
        if (this.sortable) {
            index = this.tiles.findIndex((tile) => tile.ID === ID);
        } else {
            const t = this.tiles.slice(0).reverse();
            index   = t.findIndex((tile) => tile.ID === ID);
            if (index !== -1) {
                index = this.tileCount - index - 1;
            }
        }
        if (index !== -1) {
            this.remove(this.tiles[index]);
            CommonTileList.removeTile(this.tiles[index]);
            this.tiles[index].removeAllEvent();
            this.tiles.splice(index, 1);
        }
        this.ArrangeTile();
    }

    protected ArrangeTile() {
        for (const [i, tile] of this.tiles.entries()) {
            tile.position.x =  (tile.width  + 5) *   (i % this.MaxLen);
            tile.position.y = -(tile.height + 5) * ~~(i / this.MaxLen);
        }
    }
}
