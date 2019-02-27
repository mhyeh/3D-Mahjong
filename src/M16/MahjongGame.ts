import * as io from "socket.io-client";
import * as Three from "three";
import * as Assets from "./Assets";
import State from "mahjongh5/State";
import Game from "mahjongh5/Game";
import Input from "mahjongh5/input/Input";
import UIController from "./UIController";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";
import * as System from "mahjongh5/System";
import { COMMAND_TYPE } from "./data/typeSM/MahjongArgs";
import ButtonKey from "mahjongh5/input/ButtonKey";
import ChoseLackDialog from "./ChoseLackDialog";
import CommandDialog from "./CommandDialog";
import InfoDialog from "./InfoDialog";
import EffectController from "./EffectController";
import DoorTileList from "mahjongh5/component/tile/DoorTileList";
import Text from "mahjongh5/ui/Text";
import Cube from "mahjongh5/ui/Cube";

import Timer from "mahjongh5/component/Timer";

export default class MahjongGame extends State {
    public loadMessage = "Loading Scene";

    public game: Game;

    public door:   DoorTileList[];
    public sea:    CommonTileList[];
    public hand:   CommonTileList[];
    public flower: CommonTileList[];
    public draw:   CommonTileList;

    public commandDialog: CommandDialog;
    public infoDialog:    InfoDialog;

    public remainTile: Text;

    public timer: Timer;
    public arrow: Cube[];

    public socket: SocketIOClient.Socket;

    private uiController: UIController;

    private id: number;

    private effectController: EffectController;

    private score: number[] = [0, 0, 0, 0];

    public get effect(): EffectController {
        if (!this.effectController) {
            this.effectController = new EffectController();
        }
        return this.effectController;
    }

    public get ui(): UIController {
        if (!this.uiController) {
            this.uiController = new UIController();
        }
        return this.uiController;
    }

    /**
     * 載入及初始化場景
     * 正常此function只會在loading時被呼叫一次
     * 而且這裡不是產生場景UI物件，所以不能在這建立Phaser的UI物件
     * @param progressCallback 回傳載入進度的callback function
     * @returns 此任務的Promise
     */
    public async LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        // 連線取得現在盤面資料
        if (progressCallback) {
            progressCallback(0.8);
        }
    }

    public init() {
        super.init();
    }

    public async create() {
        super.create();

        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.code === "KeyZ") {
                this.infoDialog.Show();
            }
        }, false);

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            if (event.code === "KeyZ") {
                this.infoDialog.Hide();
            }
        }, false);

        this.ui.Input.AddButton(this.commandDialog.pon,  Input.key.command, undefined, Input.key.Pon);
        this.ui.Input.AddButton(this.commandDialog.gon,  Input.key.command, undefined, Input.key.Gon);
        this.ui.Input.AddButton(this.commandDialog.hu,   Input.key.command, undefined, Input.key.Hu);
        this.ui.Input.AddButton(this.commandDialog.none, Input.key.command, undefined, Input.key.None);
        this.ui.Input.AddButton(this.commandDialog.eat,  Input.key.command, undefined, Input.key.Eat);

        this.ui.Input.AddButton(this.commandDialog.pongon, Input.key.Gon, undefined, COMMAND_TYPE.COMMAND_PONGON);
        this.ui.Input.AddButton(this.commandDialog.ongon,  Input.key.Gon, undefined, COMMAND_TYPE.COMMAND_ONGON);

        this.ui.Refresh();

        this.id = Number(localStorage.getItem("ID"));

        const playerList = JSON.parse(localStorage.getItem("players"));
        for (let i = 0; i < 4; i++) {
            this.infoDialog.nameText[i].text += playerList[i].slice(0, 8);
            this.infoDialog.scoreText[i].text = "score:   " + this.score[i];
        }

        const state = localStorage.getItem("state");
        const uuid  = localStorage.getItem("uuid");
        const room  = localStorage.getItem("room");
        if (state === "4") {
            this.socket.emit("getWindAndRound", room, (wind: number, round: number) => {
                const map = ["東", "南", "西", "北"];
                this.infoDialog.windText.text = map[wind] + "風" + map[round];
            });
            this.socket.emit("getHand", uuid, room, (hand: string[]) => {
                if (typeof hand[0] !== "undefined") {
                    while (this.hand[0].tileCount > hand.length) {
                        this.hand[0].RemoveTile("None");
                    }
                    this.hand[0].SetImmediate(hand);
                    this.hand[0].DisableAll();
                    const map    = ["x", "y"];
                    for (let i = 0; i < 4; i++) {
                        (this.hand[i].rotation as any)[map[i % 2]] = Math.PI / 2 * (i < 2 ? 1 : -1);
                        this.hand[i].position.z = (BOARD_D + TILE_H) / 2;
                    }
                    this.hand[0].rotation.x = Math.PI * 80 / 180;
                    CommonTileList.update();
                }
            });
            this.socket.emit("getPlayerList", room, (nameList: string[]) => {
                const players = [];
                for (let i = 0; i < 4; i++) {
                    players.push(nameList[(i + this.id) % 4]);
                }
                for (let i = 0; i < 4; i++) {
                    this.infoDialog.nameText[i].text = "ID:   " + players[i].slice(0, 8);
                }
                localStorage.setItem("players", JSON.stringify(players));
            });
            this.socket.emit("getHandCount", room, (handCount: number[]) => {
                if (typeof handCount[0] !== "undefined") {
                    for (let i = 0; i < 4; i++) {
                        if (i !== 0) {
                            const idx = this.getID(i);
                            while (this.hand[idx].tileCount > handCount[i]) {
                                this.hand[idx].RemoveTile("None");
                            }
                        }
                    }
                    CommonTileList.update();
                }
            });
            this.socket.emit("getRemainCount", room, (count: number) => {
                this.remainTile.text = "剩餘張數: " + count;
                this.remainTile.visible = true;
            });
            this.socket.emit("getDoor", uuid, room, (door: string[][][], inVisibleCount: number[], err: boolean) => {
                if (!err) {
                    for (let i = 0; i < 4; i++) {
                        const idx = this.getID(i);
                        if (door[i][0] !== null) {
                            for (const tile of door[i][0]) {
                                this.door[idx].Eat(tile);
                                this.moveDoor(idx, 3);
                            }
                        }
                        if (door[i][1] !== null) {
                            for (const tile of door[i][1]) {
                                this.door[idx].Pon(tile);
                                this.moveDoor(idx, 3);
                            }
                        }
                        if (door[i][2] !== null) {
                            for (const tile of door[i][2]) {
                                this.door[idx].Gon(tile);
                                this.moveDoor(idx, 3);
                            }
                        }
                        if (door[i][3] !== null) {
                            for (const tile of door[i][3]) {
                                this.door[idx].Gon(tile);
                                this.moveDoor(idx, 3);
                            }
                        }
                        if (inVisibleCount[i] !== null) {
                            while (inVisibleCount[i]) {
                                this.door[idx].Gon("None");
                                this.moveDoor(idx, 3);
                                inVisibleCount[i]--;
                            }
                        }
                    }
                    CommonTileList.update();
                }
            });
            this.socket.emit("getSea", room, (sea: string[][], err: boolean) => {
                if (!err) {
                    for (let i = 0; i < 4; i++) {
                        if (sea[i] != null) {
                            for (const tile of sea[i]) {
                                this.sea[this.getID(i)].AddTile(tile);
                            }
                        }
                    }
                    CommonTileList.update();
                }
            });
            this.socket.emit("getFlower", room, (flower: string[][], err: boolean) => {
                if (!err) {
                    this.BuHua(flower);
                }
            });
            this.socket.emit("getCurrentIdx", room, (playerIdx: number) => {
                if (playerIdx !== -1) {
                    const idx = this.getID(playerIdx);
                    this.arrow[idx].tint = ENABLE_TINT;
                    for (let i = 0; i < 4; i++) {
                        if (i !== idx) {
                            this.arrow[i].tint = DISABLE_TINT;
                        }
                    }
                }
            });
            this.socket.emit("getScore", room, (score: number[]) => {
                if (typeof score[0] !== "undefined") {
                    for (let i = 0; i < 4; i++) {
                        this.score[this.getID(i)] = score[i];
                    }
                }
            });
        }

        this.socket.on("broadcastWindAndRound", (wind: number, round: number) => {
            const map = ["東", "南", "西", "北"];
            this.infoDialog.windText.text = map[wind] + "風" + map[round];
        });

        this.socket.on("broadcastOpenDoor", () => {
            const map = ["x", "y"];
            for (let i = 0; i < 4; i++) {
                this.door[i].ClearDoor();
                this.flower[i].ClearTileList();
                this.sea[i].ClearTileList();

                while (this.hand[i].tileCount < 16) {
                    this.hand[i].AddTile("None");
                }

                (this.hand[i].rotation as any)[map[i % 2]] = Math.PI;
                this.hand[i].position.z = (BOARD_D + TILE_D) / 2;
            }
            CommonTileList.update();
        });

        this.socket.on("dealTile", (hand: string[]) => {
            this.hand[0].SetImmediate(hand);
            const map    = ["x", "y"];
            for (let i = 0; i < 4; i++) {
                (this.hand[i].rotation as any)[map[i % 2]] = Math.PI / 2 * (i < 2 ? 1 : -1);
                this.hand[i].position.z = (BOARD_D + TILE_H) / 2;
            }
            this.hand[0].rotation.x = Math.PI * 80 / 180;
            CommonTileList.update();
        });

        this.socket.on("broadcastBuHua", (flower: string[][]) => this.BuHua(flower));

        this.socket.on("draw", (tile: string) => {
            this.draw.AddTile(tile);
            CommonTileList.update();
        });
        this.socket.on("broadcastDraw", (id: number, remainTile: number) => this.BroadcastDraw(id, remainTile));
        this.socket.on("broadcastHua", (id: number, tile: string) => this.BroadcastHua(id, tile));

        this.socket.on("throw", async (tile: string, time: number) => this.Throw(tile, time));
        this.socket.on("broadcastThrow", (id: number, tile: string) => this.BroadcastThrow(id, tile));

        this.socket.on("command", async (tileMap: {[key: number]: string[]}, command: COMMAND_TYPE, idx: number, time: number) => this.Command(tileMap, command, time));
        this.socket.on("success", (from: number, command: COMMAND_TYPE, tile: string, score: number) => this.Success(from, command, tile, score));
        this.socket.on("broadcastCommand", (from: number, to: number, command: COMMAND_TYPE, tile: string, score: number) => this.BroadcastSuccess(from, to, command, tile, score));
        this.socket.on("robGon", (id: number, tile: string) => {
            for (let i = 0; i < 4; i++) {
                if (this.getID(id) === i) {
                    if (i === 0) {
                        this.clearDraw();
                    }
                    this.hand[i].RemoveTile(i === 0 ? tile : "None");
                }
            }
            CommonTileList.update();
        });

        this.socket.on("end", (data: string) => this.End(data));
    }

    private getID(id: number) {
        return (4 + id - this.id) % 4;
    }

    private BuHua(flower: string[][]) {
        for (let i = 0; i < 4; i++) {
            if (flower[i] != null) {
                for (const tile of flower[i]) {
                    this.flower[this.getID(i)].AddTile(tile);
                }
            }
        }
        CommonTileList.update();
    }

    private BroadcastDraw(id: number, remainTile: number) {
        this.remainTile.text = "剩餘張數: " + remainTile;
        this.remainTile.visible = true;
        const idx = this.getID(id);
        for (let i = 0; i < 4; i++) {
            if (idx === i) {
                this.arrow[i].tint = ENABLE_TINT;
            } else {
                this.arrow[i].tint = DISABLE_TINT;
            }
        }
        if (idx !== 0) {
            this.hand[idx].AddTile("None");
        }
        CommonTileList.update();
    }

    private BroadcastHua(id: number, tile: string) {
        const idx = this.getID(id);
        if (idx !== 0) {
            this.hand[idx].RemoveTile("None");
        } else {
            this.draw.RemoveTile(tile);
        }
        this.flower[idx].AddTile(tile);
        CommonTileList.update();
    }

    private async Throw(tile: string, time: number) {
        this.hand[0].EnableAll();
        this.draw.EnableAll();
        const defaultTile = System.DelayValue(time, tile);

        this.timer.Play(time);
        const throwTile = await Promise.race([this.hand[0].getClickTileID(), this.draw.getClickTileID(), defaultTile]);
        this.timer.ForceStop();
        this.hand[0].DisableAll();
        this.socket.emit("throwTile", throwTile);
    }

    private BroadcastThrow(id: number, tile: string) {
        for (let i = 0; i < 4; i++) {
            this.arrow[i].tint = DISABLE_TINT;
        }
        const idx = this.getID(id);
        if (idx === 0) {
            this.clearDraw();
            this.hand[0].RemoveTile(tile);
            this.hand[0].DisableAll();
            this.setDrawPosition();
        } else {
            this.hand[idx].RemoveTile("None");
        }
        this.sea[idx].AddTile(tile);
        CommonTileList.update();
    }

    private async Command(tileMap: {[key: number]: string[]}, command: COMMAND_TYPE, time: number) {
        this.commandDialog.Show();
        this.commandDialog.hu.enable  = Boolean(command & Input.key.Hu);
        this.commandDialog.pon.enable = Boolean(command & Input.key.Pon);
        this.commandDialog.gon.enable = Boolean(command & Input.key.Gon);
        this.commandDialog.eat.enable = Boolean(command & Input.key.Eat);

        this.hand[0].DisableAll();
        this.draw.DisableAll();
        for (const key in tileMap) {
            for (const id of tileMap[key]) {
                this.hand[0].Enable(id);
                this.draw.Enable(id);
            }
        }

        const defaultCommand = System.DelayValue(time, { cmd: COMMAND_TYPE.NONE, tile: "" });

        this.timer.Play(time);
        const result = await Promise.race([this.ChooseCommand(tileMap, command), defaultCommand]);
        this.timer.ForceStop();

        this.clearDraw();
        this.hand[0].DisableAll();
        this.commandDialog.Hide();
        this.socket.emit("sendCommand", JSON.stringify({Command: result.cmd, Tile: result.tile, Score: 0}));
        CommonTileList.update();
    }

    private async ChooseCommand(tiles: {[key: number]: string[]}, commands: COMMAND_TYPE): Promise<{cmd: COMMAND_TYPE, tile: string}> {
        const action = await this.ui.Input.WaitKeyUp(Input.key.command);
        this.commandDialog.hu.enable  = false;
        this.commandDialog.pon.enable = false;
        this.commandDialog.gon.enable = false;
        this.commandDialog.eat.enable = false;
        let resultTile = "";
        let resultCommand = COMMAND_TYPE.NONE;
        if (action === ButtonKey.None) {
            return { cmd: COMMAND_TYPE.NONE, tile: resultTile };
        }
        if (action === ButtonKey.Hu) {
            if (commands & COMMAND_TYPE.COMMAND_HU) {
                resultCommand = COMMAND_TYPE.COMMAND_HU;
            } else {
                resultCommand = COMMAND_TYPE.COMMAND_ZIMO;
            }
            resultTile = tiles[resultCommand][0];
        } else if (action === ButtonKey.Pon) {
            resultCommand = COMMAND_TYPE.COMMAND_PON;
            resultTile = tiles[resultCommand][0];
        } else if (action === ButtonKey.Eat) {
            resultCommand = COMMAND_TYPE.COMMAND_EAT;

            const centerTile = Number(tiles[resultCommand][0].charAt(1));
            if (tiles[resultCommand].length === 2) {
                resultTile = tiles[resultCommand][1];
            } else {
                const eatTile = tiles[COMMAND_TYPE.COMMAND_EAT];
                for (let i = 1; i < eatTile.length; i++) {
                    for (let j = 0; j < 3; j++) {
                        this.hand[0].Enable(eatTile[i].charAt(0) + (Number(eatTile[i].charAt(1)) + i));
                    }
                }
                for (const tile of this.hand[0].tiles) {
                    const over = () => {
                        const tileID = Number(tile.ID.charAt(1));
                        for (let i = 0; i < 3; i++) {
                            let uptile;
                            if (tileID === centerTile - 2) {
                                uptile = this.hand[0].tiles.find((t) => t.ID === tiles[resultCommand][0].charAt(0) + (tileID + i));
                            } else if (tileID > centerTile - 2 && tileID < centerTile + 2) {
                                uptile = this.hand[0].tiles.find((t) => t.ID === tiles[resultCommand][0].charAt(0) + (centerTile + i - 1));
                            } else if (tileID === centerTile + 2) {
                                uptile = this.hand[0].tiles.find((t) => t.ID === tiles[resultCommand][0].charAt(0) + (centerTile + i));
                            }
                            if (uptile !== undefined) {
                                uptile.position.y += 50;
                            }
                        }
                        CommonTileList.update();
                    };
                    const out = () => {
                        const tileID = Number(tile.ID.charAt(1));
                        for (let i = 0; i < 3; i++) {
                            let uptile;
                            if (tileID === centerTile - 2) {
                                uptile = this.hand[0].tiles.find((t) => t.ID === tiles[resultCommand][0].charAt(0) + (tileID + i));
                            } else if (tileID > centerTile - 2 && tileID < centerTile + 2) {
                                uptile = this.hand[0].tiles.find((t) => t.ID === tiles[resultCommand][0].charAt(0) + (centerTile + i - 1));
                            } else if (tileID === centerTile + 2) {
                                uptile = this.hand[0].tiles.find((t) => t.ID === tiles[resultCommand][0].charAt(0) + (centerTile + i));
                            }
                            if (uptile !== undefined) {
                                uptile.position.y -= 50;
                            }
                        }
                        CommonTileList.update();
                    };
                    tile.onInputOver.add(over);
                    tile.onInputOut.add(out);
                }
                const chooseTile   = await this.hand[0].getClickTileID();
                const chooseTileID = Number(chooseTile.charAt(1));
                resultTile         = chooseTile.charAt(0);
                if (chooseTileID === centerTile - 2) {
                    resultTile += centerTile - 2;
                } else if (chooseTileID > centerTile - 2 && chooseTileID < centerTile + 2) {
                    resultTile += centerTile - 1;
                } else if (chooseTileID === centerTile + 2) {
                    resultTile += centerTile  + 2;
                }
                for (const tile of this.hand[0].tiles) {
                    tile.onInputOver.removeAll();
                    tile.onInputOut.removeAll();
                }
            }
        } else {
            const isOnGon  = Boolean(commands & COMMAND_TYPE.COMMAND_ONGON);
            const isPonGon = Boolean(commands & COMMAND_TYPE.COMMAND_PONGON);

            if (isOnGon && isPonGon) {
                this.commandDialog.pongon.visible = true;
                this.commandDialog.ongon.visible  = true;

                this.hand[0].DisableAll();
                this.draw.DisableAll();
                for (const key in tiles) {
                    if (parseInt(key, 10) === COMMAND_TYPE.COMMAND_ONGON || parseInt(key, 10) === COMMAND_TYPE.COMMAND_PONGON) {
                        for (const id of tiles[key]) {
                            this.hand[0].Enable(id);
                            this.draw.EnableAll();
                        }
                    }
                }

                resultCommand = await this.ui.Input.WaitKeyUp(Input.key.Gon);
            } else {
                if (!isOnGon && !isPonGon) {
                    resultCommand = COMMAND_TYPE.COMMAND_GON;
                } else if (isOnGon && !isPonGon) {
                    resultCommand = COMMAND_TYPE.COMMAND_ONGON;
                } else {
                    resultCommand = COMMAND_TYPE.COMMAND_PONGON;
                }
            }

            if (tiles[resultCommand].length > 1) {
                resultTile = await Promise.race([this.hand[0].getClickTileID(), this.draw.getClickTileID()]);
            } else {
                resultTile = tiles[resultCommand][0];
            }
        }
        return { cmd: resultCommand, tile: resultTile };
    }

    private Success(from: number, command: COMMAND_TYPE, tile: string, score: number) {
        this.clearDraw();
        const idx = this.getID(from);
        if (command & COMMAND_TYPE.COMMAND_HU) {
            this.HU(0, idx, tile, score);
        } else if (command & COMMAND_TYPE.COMMAND_ZIMO) {
            this.ZEMO(0, tile, score);
        } else if (command & COMMAND_TYPE.COMMAND_GON) {
            this.GON(0, idx, tile, score);
        } else if (command & COMMAND_TYPE.COMMAND_ONGON) {
            this.ONGON(0, tile, score);
        } else if (command & COMMAND_TYPE.COMMAND_PONGON) {
            this.PONGON(0, tile, score);
        } else if (command & COMMAND_TYPE.COMMAND_PON) {
            this.PON(0, idx, tile);
        } else if (command & COMMAND_TYPE.COMMAND_EAT) {
            this.EAT(0, idx, tile);
        }
        this.setDrawPosition();
        CommonTileList.update();
    }

    private BroadcastSuccess(from: number, to: number, command: COMMAND_TYPE, tile: string, score: number) {
        const toIdx   = this.getID(to);
        const fromIdx = this.getID(from);
        if (toIdx !== 0) {
            if (command & COMMAND_TYPE.COMMAND_HU) {
                this.HU(toIdx, fromIdx, tile, score);
            } else if (command & COMMAND_TYPE.COMMAND_ZIMO) {
                this.ZEMO(toIdx, tile, score);
            } else if (command & COMMAND_TYPE.COMMAND_GON) {
                this.GON(toIdx, fromIdx, tile, score);
            } else if (command & COMMAND_TYPE.COMMAND_ONGON) {
                this.ONGON(toIdx, "None", score);
            } else if (command & COMMAND_TYPE.COMMAND_PONGON) {
                this.PONGON(toIdx, tile, score);
            } else if (command & COMMAND_TYPE.COMMAND_PON) {
                this.PON(toIdx, fromIdx, tile);
            } else if (command & COMMAND_TYPE.COMMAND_EAT) {
                this.EAT(toIdx, fromIdx, tile);
            }
        }
        this.updateScore();
    }

    private async End(data: string) {
        const gameResult = JSON.parse(data);
        const map = ["x", "y"];
        for (let i = 0; i < 4; i++) {
            const idx = this.getID(i);
            this.door[idx].ClearDoor();
            if (gameResult[i].Door !== null) {
                if (gameResult[i].Door[0] !== null) {
                    for (const tile of gameResult[i].Door[0]) {
                        this.door[idx].Eat(tile);
                        this.moveDoor(idx, 3);
                    }
                }
                if (gameResult[i].Door[1] !== null) {
                    for (const tile of gameResult[i].Door[1]) {
                        this.door[idx].Pon(tile);
                        this.moveDoor(idx, 3);
                    }
                }
                if (gameResult[i].Door[2] !== null) {
                    for (const tile of gameResult[i].Door[2]) {
                        this.door[idx].Gon(tile);
                        this.moveDoor(idx, 3);
                    }
                }
                if (gameResult[i].Door[3] !== null) {
                    for (const tile of gameResult[i].Door[3]) {
                        this.door[idx].Gon(tile);
                        this.moveDoor(idx, 3);
                    }
                }
            }
            this.hand[idx].SetImmediate(gameResult[i].Hand);
            (this.hand[idx].rotation as any)[map[idx % 2]] = 0;
            this.hand[idx].position.z = (BOARD_D + TILE_D) / 2;
            this.score[idx] = gameResult[i].Score;
            let tmp = "";
            if (gameResult[i].ScoreLog !== null) {
                for (const scoreLog of gameResult[i].ScoreLog) {
                    tmp += scoreLog.Message + ": " + scoreLog.Score + "\n";
                }
            }
            // this.infoDialog[idx].scoreLog.text.text = tmp;
            // this.infoDialog[idx].scoreLog.visible   = true;
            // this.infoDialog[idx].Redraw();
        }
        this.updateScore();
        CommonTileList.update();
        await System.Delay(5000);
        // window.location.href = "./index.html";
    }

    private updateScore() {
        for (let i = 0; i < 4; i++) {
            this.infoDialog.scoreText[i].text = "score:   " + this.score[i];
        }
    }
    private HU(id: number, fromId: number, tile: string, score: number) {
        this.score[id]     += score;
        this.score[fromId] -= score;
    }

    private ZEMO(id: number, tile: string, score: number) {
        this.score[id] += score * 3;
        for (let i = 0; i < 4; i++) {
            if (i !== id) {
                this.score[i] -= score;
            }
        }
    }

    private GON(id: number, fromId: number, tile: string, score: number) {
        this.sea[fromId].RemoveTile(tile);
        for (let i = 0; i < 3; i++) {
            this.hand[id].RemoveTile(id === 0 ? tile : "None");
        }
        this.door[id].Gon(tile);
        this.moveDoor(id, 3);
        this.score[id]     += score;
        this.score[fromId] -= score;
    }

    private ONGON(id: number, tile: string, score: number) {
        for (let i = 0; i < 4; i++) {
            this.hand[id].RemoveTile(id === 0 ? tile : "None");
        }
        this.door[id].Gon(id === 0 ? tile : "None");
        this.score[id] += score * 3;
        for (let i = 0; i < 4; i++) {
            if (i !== id) {
                this.score[i] -= score;
            }
        }
        this.moveDoor(id, 3);
    }

    private PONGON(id: number, tile: string, score: number) {
        this.hand[id].RemoveTile(id === 0 ? tile : "None");
        this.door[id].PonGon(tile);
        this.score[id] += score * 3;
        for (let i = 0; i < 4; i++) {
            if (i !== id) {
                this.score[i] -= score;
            }
        }
    }

    private PON(id: number, fromId: number, tile: string) {
        this.sea[fromId].RemoveTile(tile);
        for (let i = 0; i < 2; i++) {
            this.hand[id].RemoveTile(id === 0 ? tile : "None");
        }
        this.door[id].Pon(tile);
        this.moveDoor(id, 3);
    }

    private EAT(id: number, fromId: number, tile: string) {
        const tiles = tile.split(",");
        const v     = Number(tiles[0].charAt(1));
        this.sea[fromId].RemoveTile(tiles[1]);
        for (let i = 0; i < 3; i++) {
            if (id !== 0) {
                this.hand[id].RemoveTile("None");
            } else if (v + i !== Number(tiles[1].charAt(1))) {
                console.log(tiles[0].charAt(0) + (v + i));
                this.hand[id].RemoveTile(tiles[0].charAt(0) + (v + i));
            }
        }
        this.door[id].Eat(tiles[0]);
        this.moveDoor(id, 3);
    }

    private moveDoor(id: number, n: number) {
        const len = this.door[id].tileW * n;
        const map = ["x", "y"];
        (this.door[id].position as any)[map[id % 2]] += len * (id < 2 ? -1 : 1);
    }

    private clearDraw() {
        if (this.draw.tileCount > 0) {
            const tile = this.draw.tiles[0].ID;
            this.draw.RemoveTile(tile);
            this.hand[0].AddTile(tile);
            this.hand[0].DisableAll();
        }
    }

    private setDrawPosition() {
        this.draw.position.x = this.hand[0].position.x + (TILE_W + 5) * this.hand[0].tileCount + 10;
    }
}
