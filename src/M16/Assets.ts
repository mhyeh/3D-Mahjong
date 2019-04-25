// 未來希望能用工具產生，現在先手動修改
import AssetLoadTask from "mahjongh5/load/AssetLoadTask";
import * as DefaultAssets from "mahjongh5/Assets";
import Game from "mahjongh5/Game";
/**
 * 產生載入資源的任務
 * @param game 當前的遊戲
 * @param section 如果不指定就是載入所有section，如果是string或string[]就是直接指定要載入的一個或多個section，如果是包含flag的物件就是以flag為filter載入符合條件的section
 */
export function CreateLoadTask(game: Game, section?: string | string[] | any, version?: any): AssetLoadTask {
    return AssetLoadTask.CreateLoadTask(game, loadAssets, section, version);
}

export const sectionFlag = {
    preload: DefaultAssets.sectionFlag.preload,
};

export const preload = {
    [sectionFlag.preload]: true,
};

export const image = {
    avatar: { type: "Image", key: "", args: [require("assets/Mahjong/avatar.png")] },
};

export const button = {
    char: { type: "Image", key: "", args: [require("assets/Mahjong/Char.png")] },
    dot: { type: "Image", key: "", args: [require("assets/Mahjong/Dot.png")] },
    bamboo: { type: "Image", key: "", args: [require("assets/Mahjong/Bamboo.png")] },
    eat: { type: "Image", key: "", args: [require("assets/Mahjong/Eat.png")] },
    pon: { type: "Image", key: "", args: [require("assets/Mahjong/Pon.png")] },
    gon: { type: "Image", key: "", args: [require("assets/Mahjong/Gon.png")] },
    pongon: { type: "Image", key: "", args: [require("assets/Mahjong/PonGon.png")] },
    ongon: { type: "Image", key: "", args: [require("assets/Mahjong/OnGon.png")] },
    hu: { type: "Image", key: "", args: [require("assets/Mahjong/Hu.png")] },
    none: { type: "Image", key: "", args: [require("assets/Mahjong/None.png")] },
    ting: { type: "Image", key: "", args: [require("assets/Mahjong/Ting.png")] },
};

export const tiles = {
    tiles: { type: "Image", key: "tiles", args: [require("assets/Mahjong/tiles/tiles.png")] },
    tilesJson: { type: "json", key: "", args: [require("assets/Mahjong/tiles/tiles.json")] },
    tiles_config: { type: "json", key: "", args: [require("assets/Mahjong/tiles/tiles_config.json")] },
};

export const font = {
    sourceHan: {type: "Font", key: "", args: [require("assets/Mahjong/SourceHanSansTW_Regular_Regular.json")] },
    jhengHei: {type: "Font", key: "", args: [require("assets/Mahjong/Microsoft JhengHei_Regular.json")] },
};

// 如果直接把上面的東西都加到這裡面不個別export的話，在別的地方import之後就要打Assets.assets.background這樣多包了一層
export const loadAssets: { [section: string]: any } = {
    ["preLoad"]: preload,
    image,
    tiles,
    font,
    button,
};
