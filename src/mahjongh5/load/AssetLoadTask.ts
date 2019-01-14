import * as Three from "three";
import { Loadable } from "./LoadState";
import Game from "../Game";

export default class AssetLoadTask implements Loadable {
    /**
     * 產生載入資源的任務
     * @param game 當前的遊戲
     * @param assets 含有資源設定的物件
     * @param section 如果不指定就是載入所有section，如果是string或string[]就是直接指定要載入的一個或多個section，如果是包含flag的物件就是以flag為filter載入符合條件的section
     */
    public static CreateLoadTask(game: Game, assets: { [section: string]: any }, section?: string | string[] | any, version?: any): AssetLoadTask {
        const assetConfigs: any[] = [];
        if (section === undefined) {
            this.AddAssetsToArray(assets, assetConfigs, version);
        } else if (typeof section === "string") {
            if (assets.hasOwnProperty(section)) {
                this.AddAssetsToArray(assets[section], assetConfigs, version);
            } else {
                console.warn("unknow section: " + section);
            }
        } else if (section instanceof Array) {
            for (const sectionName of section) {
                if (assets.hasOwnProperty(sectionName)) {
                    this.AddAssetsToArray(assets[sectionName], assetConfigs, version);
                } else {
                    console.warn("unknow section: " + sectionName);
                }
            }
        } else {
            for (const key in assets) {
                if (assets.hasOwnProperty(key)) {
                    let isTarget = true;
                    for (const flag of Object.getOwnPropertySymbols(section)) {
                        if ((section[flag] && section[flag] !== assets[key][flag]) || (!section[flag] && assets[key][flag])) {
                            isTarget = false;
                            break;
                        }
                    }
                    if (isTarget) {
                        this.AddAssetsToArray(assets[key], assetConfigs, version);
                    }
                }
            }
        }
        return new AssetLoadTask(game, assetConfigs);
    }

    private static assetCounter: number = 0;
    private static AddAssetsToArray(data: any, array: any[], version?: any) {
        // 只要遇到有type這個Property就不繼續往下找了
        if (data.hasOwnProperty("type")) {
            const args = data.args;
            if (!data.key) {
                data.key = "vmtltaoh" + AssetLoadTask.assetCounter++;
            }
            if (version && data.ver && data.ver[version]) {
                data.ver[version].forEach((element: any, index: number) => {
                    args[index] = element;
                });
            }
            array.push({ type: data.type, args: [data.key, ...args] });
        } else if (typeof data === "object") {
            for (const key in data) {
                if (data.hasOwnProperty(key) && (typeof data[key] === "object")) {
                    this.AddAssetsToArray(data[key], array, version);
                }
            }
        }
    }

    public loadMessage: string = "Loading Assets";
    public progressWeight: number;
    private game: Game;
    private assetInfos: AssetConfig[] = [];
    /** 是否需要待考慮 TODO */
    // private loadCompleteSignal?: Signal;

    constructor(game: Game, assetInfos: AssetConfig[]) {
        this.game           = game;
        this.assetInfos     = assetInfos;
        this.progressWeight = assetInfos.length;
    }

    /** 目前寫法在一個LoadState中有很多個AssetLoadTask會造成混亂 */
    public LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.assetInfos.length === 0) {
                resolve();
            }
            this.AddToLoader();
            const onFileErrorHandler = (url: string) => reject(new Error(`[${url}]: error`));
            let onFileCompleteHandler: ((item: any, loaded: number, total: number) => void) | undefined;

            if (progressCallback) {
                onFileCompleteHandler = (item: any, loaded: number, total: number) => progressCallback(loaded / total);
                this.game.load.onLoadProgress.add(onFileCompleteHandler);
            }
            this.game.load.onLoadError.add(onFileErrorHandler);
            this.game.load.onLoadComplete.add(() => {
                if (onFileCompleteHandler) {
                    this.game.load.onLoadProgress.remove(onFileCompleteHandler);
                }
                this.game.load.onLoadError.remove(onFileErrorHandler);
                resolve();
            });
        });
    }

    /** 單純把東西加入loader的queue */
    public AddToLoader(): void {
        for (const assetInfo of this.assetInfos) {
            if (assetInfo.type === "json") {
                const loader = new Three.FileLoader(this.game.load).setResponseType("json");
                loader.load(assetInfo.args[1], (data: any) => {
                    this.game.cache[assetInfo.args[0]] = data;
                }, () => {}, () => {});
            } else if ((Three as any)[assetInfo.type + "Loader"]) {
                const loader = new (Three as any)[assetInfo.type + "Loader"](this.game.load);
                loader.load(assetInfo.args[1], (data: any) => {
                    this.game.cache[assetInfo.args[0]] = data;
                }, () => {}, () => {});
            } else {
                console.warn(new Error("unknow asset type: " + assetInfo.type));
            }
        }
        // 加完把清單清空避免重複加
        this.assetInfos = [];
    }
}

export interface AssetConfig {
    type: string;
    args: any[];
}
