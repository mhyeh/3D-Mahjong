import * as Three from "three";
import * as io from "socket.io-client";
import * as Mahjongh5 from "mahjongh5/Mahjongh5";
import Game from "mahjongh5/Game";
import JoinState from "./JoinState";
import MahjongGame from "./MahjongGame";
import RoundEdgedBox from "mahjongh5/Util/RoundBoxGeometry";
import CommonTileList from "mahjongh5/component/tile/CommonTileList";
import ImageTileTable from "mahjongh5/component/tile/ImageTileTable";
import DoorTileList from "mahjongh5/component/tile/DoorTileList";
import ChoseLackDialog from "./ChoseLackDialog";
import CommandDialog from "./CommandDialog";
import Button from "mahjongh5/ui/Button";
import * as Assets from "./Assets";
import Text from "mahjongh5/ui/Text";
import Timer from "mahjongh5/component/Timer";
import NumberDisplayer from "mahjongh5/ui/NumberDisplayer";
import Cube from "mahjongh5/ui/Cube";
import DiceEffect from "./effect/DiceEffect";
import RoundRetangleGeometry from "mahjongh5/Util/RoundRectangleGeometry";
import InfoDialog from "./InfoDialog";

export default function MahjongStart() {
    let isPlaying = false;

    const socket = io.connect(SERVER_URL, { transports: ["websocket"] });
    socket.on("auth", () => {
        const uuid = localStorage.getItem("uuid");
        const room = localStorage.getItem("room");
        socket.emit("auth", uuid, room, (state: number) => {
            localStorage.setItem("state", state.toString());
            if (state === -1 || state === 0) {
                window.location.href = "./index.html";
            } else if (state === 4) {
                isPlaying = true;
            }
            Mahjongh5.StartGame(init, "game");
        });
    });
    const init = (game: Game) => {
        game.assets     = Assets;

        const joinState = new JoinState(game);
        const mahjong   = new MahjongGame(game);

        if (isPlaying) {
            game.gameStates.push(mahjong);
        } else {
            game.gameStates.push(joinState);
            game.gameStates.push(mahjong);
        }

        game.loadState.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);

            game.loadState.scene.push(scene);
            game.loadState.camera.push(camera);
        });

        joinState.onCreate.add(() => {
            const w = 1000;
            const h = w / ASPECT;
            const scene  = new Three.Scene();
            const camera = new Three.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);

            const title = new Text(game, "配對成功", Assets.font.jhengHei.key, 50, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 1, true);
            title.position.y = 200;

            const nameBlock = [];
            const name      = [];
            for (let i = 0; i < 4; i++) {
                nameBlock.push(new Cube(RoundRetangleGeometry(150, 150, 15, 15), new Three.MeshBasicMaterial({ color: 0xAAAAAA })));
                nameBlock[i].add(new Text(game, "ID", Assets.font.jhengHei.key, 30, 1, new Three.MeshBasicMaterial({ color: 0x000000 }), 0, 30, 1, true));
                nameBlock[i].position.y = -50;
                name.push(new Text(game, "name", Assets.font.jhengHei.key, 20, 1, new Three.MeshBasicMaterial({ color: 0x000000 }), 0, -25, 1, true));
                nameBlock[i].add(name[i]);
            }
            nameBlock[0].position.x = -375;
            nameBlock[1].position.x = -125;
            nameBlock[2].position.x =  125;
            nameBlock[3].position.x =  375;

            const ready = new Button(game, RoundRetangleGeometry(100, 50, 10, 10), new Three.MeshBasicMaterial({ color: 0x10A3E8 }));
            ready.add(new Text(game, "Ready", Assets.font.jhengHei.key, 20, 1, new Three.MeshBasicMaterial({ color: 0x000000 }), 0, 0, 1, true));
            ready.frustumCulled  = false;
            ready.position.y    -= 250;
            ready.stateTint.down = 0x808080;
            ready.stateTint.up   = 0xFFFFFF;

            scene.add(title);
            scene.add(...nameBlock);
            scene.add(ready);

            joinState.socket = socket;

            joinState.ui.readyButton = ready;

            joinState.name      = name;
            joinState.nameBlock = nameBlock;

            joinState.mahjongGame = mahjong;

            joinState.scene.push(scene);
            joinState.camera.push(camera);
        });

        mahjong.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 5000);

            const w = 1000;
            const h = w / ASPECT;
            const orthoScene  = new Three.Scene();
            const orthoCamera = new Three.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);

            const diceScene  = new Three.Scene();
            const diceCamera = new Three.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);

            scene.background = new Three.Color(0xAAAAAA);

            camera.position.set(0, -1800, 1500);
            camera.rotateX(0.8);

            const ambientLight = new Three.AmbientLight(0xA0A0A0);
            scene.add(ambientLight);

            const pointLight = new Three.PointLight(0x070707, 15);

            pointLight.position.set(0, -2000, 1000);
            pointLight.lookAt(0, 0, 0);
            scene.add(pointLight);

            const outBoardW = 2200;
            const outBoardH = 100;
            const halfOutW  = outBoardW / 2;
            const halfOutH  = outBoardH / 2;
            const geometry  = new Three.Geometry().fromBufferGeometry(RoundEdgedBox(outBoardW, outBoardH, 150, 30, 1, 1, 1, 5));
            const geometry2 = geometry.clone();
            const geometry3 = geometry.clone();
            const geometry4 = geometry.clone();
            geometry.translate(0, -halfOutW + halfOutH, 0);
            geometry2.translate(0, halfOutW - halfOutH, 0);
            geometry2.rotateZ(Math.PI / 2);
            geometry3.translate(0,  halfOutW - halfOutH, 0);
            geometry4.translate(0, -halfOutW + halfOutH, 0);
            geometry4.rotateZ(Math.PI / 2);
            geometry.merge(geometry2);
            geometry.merge(geometry3);
            geometry.merge(geometry4);
            geometry.mergeVertices();
            const material = new Three.MeshLambertMaterial({ color: 0xA38511 });
            const outBoard = new Three.Mesh(geometry, material);
            scene.add(outBoard);

            const board = new Three.Mesh(new Three.BoxBufferGeometry(BOARD_W, BOARD_H, 100), new Three.MeshLambertMaterial({ color: 0x0B440C }));
            scene.add(board);

            // arrow setting
            const sideLen1 = 60;
            const sideLen2 = 60;
            const angle    = 90;
            const height   = 10;
            const shape = new Three.Shape();
            let x = 0;
            let y = 0;
            shape.moveTo(x, y);
            x += sideLen1;
            shape.lineTo(x, y);
            x -= sideLen2 * Math.cos(Math.PI * angle / 180);
            y += sideLen2 * Math.sin(Math.PI * angle / 180);
            shape.lineTo(x, y);
            shape.lineTo(0, 0);

            const extrudeSettings = {
                depth:          height,
                bevelEnabled:   true,
                bevelThickness: 1,
                bevelSize:      8,
                bevelSegments:  1,
            };

            const tileTable = new ImageTileTable(game, game.cache[Assets.tiles.tiles_config.key], Assets.tiles.tiles.key, Assets.tiles.tilesJson.key);
            CommonTileList.Init(TILE_W, TILE_H, TILE_D, TILE_R, tileTable);

            const sea    = [];
            const hand   = [];
            const door   = [];
            const flower     = [];
            const arrow  = [];
            for (let i = 0; i < 4; i++) {
                hand.push(new   CommonTileList(game, 16, TILE_W, TILE_H, TILE_D, i === 0, 16, true));
                flower.push(new CommonTileList(game, 0,  TILE_W, TILE_H, TILE_D, false,   16, false));
                sea.push(new    CommonTileList(game, 0,  TILE_W, TILE_H, TILE_D, false,   6,  false));

                door.push(new DoorTileList(game, TILE_W, TILE_H, TILE_D, 16, false));

                arrow.push(new Cube(new Three.ExtrudeBufferGeometry(shape, extrudeSettings), new Three.MeshLambertMaterial({ color: 0xF0F40E }), 0, 0));
                arrow[i].tint = DISABLE_TINT;
            }
            const draw = new CommonTileList(game, 0, TILE_W, TILE_H, TILE_D, true);

            // hand
            hand[0].rotateX(Math.PI);
            new Three.Box3().setFromObject(hand[0]).getCenter(hand[0].position).multiplyScalar(-1);
            hand[0].position.y = -900;
            hand[0].position.z = (BOARD_D + TILE_D) / 2;

            hand[1].rotation.set(0, Math.PI, Math.PI / 2);
            new Three.Box3().setFromObject(hand[1]).getCenter(hand[1].position).multiplyScalar(-1);
            hand[1].position.x = 900;
            hand[1].position.z = (BOARD_D + TILE_D) / 2;

            hand[2].rotation.set(Math.PI, 0, Math.PI);
            new Three.Box3().setFromObject(hand[2]).getCenter(hand[2].position).multiplyScalar(-1);
            hand[2].position.y = 900;
            hand[2].position.z = (BOARD_D + TILE_D) / 2;

            hand[3].rotation.set(0, Math.PI, Math.PI * 3 / 2);
            new Three.Box3().setFromObject(hand[3]).getCenter(hand[3].position).multiplyScalar(-1);
            hand[3].position.x = -900;
            hand[3].position.z = (BOARD_D + TILE_D) / 2;

            // flower
            flower[0].position.set(-6 * TILE_W, -750, (BOARD_D + TILE_D) / 2);

            flower[1].rotateZ(Math.PI / 2);
            flower[1].position.set(750, -6 * TILE_W, (BOARD_D + TILE_D) / 2);

            flower[2].rotateZ(Math.PI);
            flower[2].position.set(6 * TILE_W, 750, (BOARD_D + TILE_D) / 2);

            flower[3].rotateZ(Math.PI * 3 / 2);
            flower[3].position.set(-750, 6 * TILE_W, (BOARD_D + TILE_D) / 2);

            // sea
            sea[0].position.set(-4.5 * TILE_W, -300 + TILE_H / 2, (BOARD_D + TILE_D) / 2);

            sea[1].rotateZ(Math.PI / 2);
            sea[1].position.set(300 - TILE_H / 2, -4.5 * TILE_W, (BOARD_D + TILE_D) / 2);

            sea[2].rotateZ(Math.PI);
            sea[2].position.set(4.5 * TILE_W, 300 - TILE_H / 2, (BOARD_D + TILE_D) / 2);

            sea[3].rotateZ(Math.PI * 3 / 2);
            sea[3].position.set(-300 + TILE_H / 2, 4.5 * TILE_W, (BOARD_D + TILE_D) / 2);

            // door
            door[0].position.set(10.5 * TILE_W, -900, (BOARD_D + TILE_D) / 2);

            door[1].rotateZ(Math.PI / 2);
            door[1].position.set(900, 10.5 * TILE_W, (BOARD_D + TILE_D) / 2);

            door[2].rotateZ(Math.PI);
            door[2].position.set(-10.5 * TILE_W, 900, (BOARD_D + TILE_D) / 2);

            door[3].rotateZ(Math.PI * 3 / 2);
            door[3].position.set(-900, -10.5 * TILE_W, (BOARD_D + TILE_D) / 2);

            // arrow
            arrow[0].rotateZ(-Math.PI * 45  / 180);
            new Three.Box3().setFromObject(arrow[0]).getCenter(arrow[0].position).multiplyScalar(-1);
            arrow[0].position.y -= 100;
            arrow[0].position.z  = 50;

            arrow[1].rotateZ( Math.PI * 45  / 180);
            new Three.Box3().setFromObject(arrow[1]).getCenter(arrow[1].position).multiplyScalar(-1);
            arrow[1].position.x += 100;
            arrow[1].position.z  = 50;

            arrow[2].rotateZ( Math.PI * 135 / 180);
            new Three.Box3().setFromObject(arrow[2]).getCenter(arrow[2].position).multiplyScalar(-1);
            arrow[2].position.y += 100;
            arrow[2].position.z  = 50;

            arrow[3].rotateZ( Math.PI * 225 / 180);
            new Three.Box3().setFromObject(arrow[3]).getCenter(arrow[3].position).multiplyScalar(-1);
            arrow[3].position.x -= 100;
            arrow[3].position.z  = 50;

            CommonTileList.intersectsScene.add(...hand);
            CommonTileList.intersectsScene.add(...flower);
            CommonTileList.intersectsScene.add(...sea);
            CommonTileList.intersectsScene.add(...door);
            CommonTileList.intersectsScene.add(draw);
            scene.add(...arrow);

            const timer = new Timer(new NumberDisplayer(new Text(game, "0", Assets.font.jhengHei.key, 80 , 20, new Three.MeshLambertMaterial({ color: 0xFFFFFF }), 0, 0, 50, true)), undefined, DISABLE_TINT);
            scene.add(timer);

            const diceEffect = new DiceEffect(game);
            diceScene.add(diceEffect);

            const commandDialog = new CommandDialog(game, (dialog: CommandDialog) => {
                const buttonGeometry = new Three.CircleGeometry(50, 30);

                const eatTex    = new Three.Texture(game.cache[Assets.button.eat.key]);
                const ponTex    = new Three.Texture(game.cache[Assets.button.pon.key]);
                const gonTex    = new Three.Texture(game.cache[Assets.button.gon.key]);
                const huTex     = new Three.Texture(game.cache[Assets.button.hu.key]);
                const tingTex   = new Three.Texture(game.cache[Assets.button.ting.key]);
                const ongonTex  = new Three.Texture(game.cache[Assets.button.ongon.key]);
                const pongonTex = new Three.Texture(game.cache[Assets.button.pongon.key]);
                const noneTex   = new Three.Texture(game.cache[Assets.button.none.key]);
                eatTex.needsUpdate    = true;
                ponTex.needsUpdate    = true;
                gonTex.needsUpdate    = true;
                huTex.needsUpdate     = true;
                tingTex.needsUpdate   = true;
                ongonTex.needsUpdate  = true;
                pongonTex.needsUpdate = true;
                noneTex.needsUpdate   = true;

                dialog.eat    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: eatTex }));
                dialog.pon    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: ponTex }));
                dialog.gon    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: gonTex }));
                dialog.hu     = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: huTex }));
                dialog.ting   = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: tingTex }));
                dialog.ongon  = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: ongonTex }));
                dialog.pongon = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: pongonTex }));
                dialog.none   = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ map: noneTex }));

                dialog.eat.position.x = -385;
                dialog.eat.position.z = 2;
                dialog.eat.stateTint.down    = DOWN_TINT;
                dialog.eat.stateTint.disable = DISABLE_TINT;
                dialog.pon.position.x = -275;
                dialog.pon.position.z = 2;
                dialog.pon.stateTint.down    = DOWN_TINT;
                dialog.pon.stateTint.disable = DISABLE_TINT;
                dialog.gon.position.x = -165;
                dialog.gon.position.z = 2;
                dialog.gon.stateTint.down    = DOWN_TINT;
                dialog.gon.stateTint.disable = DISABLE_TINT;
                dialog.hu.position.x = -55;
                dialog.hu.position.z = 2;
                dialog.hu.stateTint.down    = DOWN_TINT;
                dialog.hu.stateTint.disable = DISABLE_TINT;
                dialog.ting.position.x = 55;
                dialog.ting.position.z = 2;
                dialog.ting.stateTint.down    = DOWN_TINT;
                dialog.ting.stateTint.disable = DISABLE_TINT;
                dialog.ongon.position.x = 165;
                dialog.ongon.position.z = 2;
                dialog.ongon.stateTint.down    = DOWN_TINT;
                dialog.ongon.stateTint.disable = DISABLE_TINT;
                dialog.pongon.position.x = 275;
                dialog.pongon.position.z = 2;
                dialog.pongon.stateTint.down    = DOWN_TINT;
                dialog.pongon.stateTint.disable = DISABLE_TINT;
                dialog.none.position.x = 385;
                dialog.none.position.z = 2;
                dialog.none.stateTint.down    = DOWN_TINT;
                dialog.none.stateTint.disable = DISABLE_TINT;
            });

            const remainTile = new Text(game, "剩餘張數: ", Assets.font.jhengHei.key, 40, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), -1200, 600, 300);
            remainTile.visible = false;

            const group = new Three.Group();
            group.rotation.setFromVector3(camera.rotation.toVector3());
            group.add(commandDialog);
            group.add(remainTile);
            commandDialog.position.set(600, -700, 850);

            scene.add(group);

            const instanceTlies = new Three.Mesh(CommonTileList.instancedGeometry, CommonTileList.rawShaderMaterial);
            scene.add(instanceTlies);

            const infoDialog = new InfoDialog(game, (dialog: InfoDialog) => {
                const huTex          = new Three.Texture(game.cache[Assets.button.hu.key]);
                const tingTex        = new Three.Texture(game.cache[Assets.button.ting.key]);
                const circleGeometry = new Three.CircleGeometry(15, 30);
                huTex.needsUpdate    = true;
                tingTex.needsUpdate  = true;

                dialog.nameList   = [];
                dialog.nameText   = [];
                dialog.score      = [];
                dialog.scoreText  = [];
                dialog.scoreLog   = [];
                dialog.windText   = [];
                dialog.bankerText = [];
                dialog.seasonText = [];
                dialog.huIcon     = [];
                dialog.tingIcon   = [];

                for (let i = 0; i < 4; i++) {
                    dialog.nameText.push(new   Text(game, "ID: ",    Assets.font.jhengHei.key, 15, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, false));
                    dialog.scoreText.push(new  Text(game, "score: ", Assets.font.jhengHei.key, 15, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, false));
                    dialog.scoreLog.push(new   Text(game, "",        Assets.font.jhengHei.key, 15, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, false));
                    dialog.windText.push(new   Text(game, "",        Assets.font.jhengHei.key, 15, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, false));
                    dialog.bankerText.push(new Text(game, "",        Assets.font.jhengHei.key, 15, 1, new Three.MeshBasicMaterial({ color: 0xFF0000 }), 0, 0, 0, false));
                    dialog.seasonText.push(new Text(game, "",        Assets.font.jhengHei.key, 15, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, false));
                    dialog.huIcon.push(new Three.Mesh(circleGeometry, new Three.MeshBasicMaterial({ map: huTex })));
                    dialog.huIcon.push(new Three.Mesh(circleGeometry, new Three.MeshBasicMaterial({ map: tingTex })));
                    dialog.huIcon[i].position.z = 2;
                    dialog.huIcon[i].visible    = false;
                    dialog.tingIcon[i].position.z = 2;
                    dialog.tingIcon[i].visible    = false;
                }
                dialog.windAndRoundText = new Text(game, "", Assets.font.jhengHei.key, 45, 1, new Three.MeshBasicMaterial({ color: 0xFFFFFF }), 0, 0, 0, true);

                // name
                dialog.nameText[0].PosX = -50;
                dialog.nameText[0].PoxY = -h / 2 + 140;

                dialog.nameText[1].AnchorX = 1;
                dialog.nameText[1].PosX    = w / 2 - 80;
                dialog.nameText[1].PoxY    = 70;

                dialog.nameText[2].PosX = -50;
                dialog.nameText[2].PoxY = h / 2 - 100;

                dialog.nameText[3].PosX = -w / 2 + 80;
                dialog.nameText[3].PoxY = 70;

                // score
                dialog.scoreText[0].PosX = -50;
                dialog.scoreText[0].PoxY = -h / 2 + 110;

                dialog.scoreText[1].AnchorX = 1;
                dialog.scoreText[1].PosX    = w / 2 - 80;
                dialog.scoreText[1].PoxY    = 40;

                dialog.scoreText[2].PosX = -50;
                dialog.scoreText[2].PoxY = h / 2 - 130;

                dialog.scoreText[3].PosX = -w / 2 + 80;
                dialog.scoreText[3].PoxY = 40;

                // scoreLog
                dialog.scoreLog[0].PosX = -50;
                dialog.scoreLog[0].PoxY = -h / 2 + 50;

                dialog.scoreLog[1].AnchorX = 1;
                dialog.scoreLog[1].PosX    = w / 2 - 80;
                dialog.scoreLog[1].PoxY    = -20;

                dialog.scoreLog[2].PosX = -50;
                dialog.scoreLog[2].PoxY = h / 2 - 190;

                dialog.scoreLog[3].PosX = -w / 2 + 80;
                dialog.scoreLog[3].PoxY = -20;

                // wind
                dialog.windText[0].PosX = -50;
                dialog.windText[0].PoxY = -h / 2 + 170;

                dialog.windText[1].AnchorX = 1;
                dialog.windText[1].PosX = w / 2 - 80;
                dialog.windText[1].PoxY = 100;

                dialog.windText[2].PosX = -50;
                dialog.windText[2].PoxY = h / 2 - 70;

                dialog.windText[3].PosX = -w / 2 + 80;
                dialog.windText[3].PoxY = 100;

                // banker
                dialog.bankerText[0].PoxY = -h / 2 + 80;

                dialog.bankerText[1].AnchorX = 1;
                dialog.bankerText[1].PosX = w / 2 - 130;
                dialog.bankerText[1].PoxY = 10;

                dialog.bankerText[2].PoxY = h / 2 - 160;

                dialog.bankerText[3].PosX = -w / 2 + 130;
                dialog.bankerText[3].PoxY = 10;

                // season
                dialog.seasonText[0].PosX = -50;
                dialog.seasonText[0].PoxY = -h / 2 + 80;

                dialog.seasonText[1].AnchorX = 1;
                dialog.seasonText[1].PosX = w / 2 - 80;
                dialog.seasonText[1].PoxY = 10;

                dialog.seasonText[2].PosX = -50;
                dialog.seasonText[2].PoxY = h / 2 - 160;

                dialog.seasonText[3].PosX = -w / 2 + 80;
                dialog.seasonText[3].PoxY = 10;

                // huIcon
                dialog.huIcon[0].position.x = 35;
                dialog.huIcon[0].position.y = -h / 2 + 180;

                dialog.huIcon[1].position.x = w / 2 - 210;
                dialog.huIcon[1].position.y = 110;

                dialog.huIcon[2].position.x = 35;
                dialog.huIcon[2].position.y = h / 2 - 60;

                dialog.huIcon[3].position.x = -w / 2 + 180;
                dialog.huIcon[3].position.y = 110;

                // tingIcon
                dialog.tingIcon[0].position.x = 65;
                dialog.tingIcon[0].position.y = -h / 2 + 180;

                dialog.tingIcon[1].position.x = w / 2 - 180;
                dialog.tingIcon[1].position.y = 110;

                dialog.tingIcon[2].position.x = 65;
                dialog.tingIcon[2].position.y = h / 2 - 60;

                dialog.tingIcon[3].position.x = -w / 2 + 210;
                dialog.tingIcon[3].position.y = 110;
            });
            infoDialog.visible    = false;
            infoDialog.position.z = 10;

            orthoScene.add(infoDialog);

            mahjong.socket = socket;

            mahjong.remainTile = remainTile;

            mahjong.arrow = arrow;

            mahjong.sea    = sea;
            mahjong.flower = flower;
            mahjong.door   = door;
            mahjong.hand   = hand;
            mahjong.draw   = draw;

            mahjong.effect.diceEffect = diceEffect;

            mahjong.timer = timer;

            mahjong.commandDialog = commandDialog;
            mahjong.infoDialog    = infoDialog;

            mahjong.scene.push(scene);
            mahjong.camera.push(camera);
            mahjong.scene.push(diceScene);
            mahjong.camera.push(diceCamera);
            mahjong.scene.push(orthoScene);
            mahjong.camera.push(orthoCamera);
        });
    };
}
