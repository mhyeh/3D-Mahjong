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
import ChangeTileEffect from "./effect/ChangeTileEffect";
import LackEffect from "./effect/LackEffect";

export default function MahjongStart() {
    let isPlaying = false;

    const socket = io.connect("http://140.118.127.157:3000", { transports: ["websocket"] });
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
        game.gameStates.push(joinState);

        if (isPlaying) {
            game.gameStates.push(mahjong);
        } else {
            game.gameStates.push(joinState);
            game.gameStates.push(mahjong);
        }

        game.loadState.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);

            game.loadState.scene  = scene;
            game.loadState.camera = camera;
        });

        joinState.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);

            camera.position.set(0, -1800, 1500);
            camera.rotateX(0.8);

            const ambientLight = new Three.AmbientLight(0xAAAAAA);
            scene.add(ambientLight);

            const pointLight = new Three.PointLight(0x050505, 25);

            pointLight.position.set(0, -2000, 1000);
            pointLight.lookAt(0, 0, 0);
            scene.add(pointLight);

            const title = new Text(game, "配對成功", Assets.font.jhengHei.key, 200, 1, new Three.MeshLambertMaterial({ color: 0xFFFFFF }), 0, 0, 0, true);
            title.rotation.setFromVector3(camera.rotation.toVector3());
            title.position.y += 800;
            title.position.z += 300;
            scene.add(title);

            const nameBlock = [];
            const name      = [];
            for (let i = 0; i < 4; i++) {
                nameBlock.push(new Cube(RoundEdgedBox(500, 500, 100, 50, 1, 1, 1, 50), new Three.MeshLambertMaterial({ color: 0xAAAAAA })));
                nameBlock[i].add(new Text(game, "ID", Assets.font.jhengHei.key, 100, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 0, 100, 60, true));

                name.push(new Text(game, "name", Assets.font.jhengHei.key, 50, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 0, -100, 60, true));
                nameBlock[i].add(name[i]);

                nameBlock[i].lookAt(camera.position);
            }
            nameBlock[0].position.x = -1000;
            nameBlock[1].position.x = -335;
            nameBlock[2].position.x =  335;
            nameBlock[3].position.x =  1000;
            scene.add(...nameBlock);

            const ready = new Button(game, RoundEdgedBox(400, 200, 40, 50, 1, 1, 1, 20), new Three.MeshLambertMaterial({ color: 0x10A3E8, transparent: true, opacity: 0.8}));
            ready.add(new Text(game, "Ready", Assets.font.jhengHei.key, 60, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 5, 0, 30, true));
            ready.position.y    -= 900;
            ready.stateTint.down = 0x808080;
            ready.stateTint.up   = 0xFFFFFF;
            ready.lookAt(camera.position);
            scene.add(ready);

            joinState.socket = socket;

            joinState.ui.readyButton = ready;

            joinState.name      = name;
            joinState.nameBlock = nameBlock;

            joinState.mahjongGame = mahjong;

            joinState.scene  = scene;
            joinState.camera = camera;
        });

        mahjong.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 5000);

            scene.background = new Three.Color(0xAAAAAA);

            camera.position.set(0, -1800, 1500);
            camera.rotateX(0.8);

            const ambientLight = new Three.AmbientLight(0xAAAAAA);
            scene.add(ambientLight);

            const pointLight = new Three.PointLight(0x050505, 25);

            pointLight.position.set(0, -2000, 1000);
            pointLight.lookAt(0, 0, 0);
            scene.add(pointLight);

            const outBoardW = 2200;
            const outBoardH = 100;
            const geometry  = RoundEdgedBox(outBoardW, outBoardH, 150, 30, 1, 1, 1, 6);
            const material  = new Three.MeshLambertMaterial({ color: 0xA38511});
            const outBoard1 = new Three.Mesh(geometry, material);
            outBoard1.position.set(0, -1050, 25);

            const outBoard2 = new Three.Mesh(geometry, material);
            outBoard2.position.set(1050, 0, 25);
            outBoard2.rotateZ(Math.PI / 2);

            const outBoard3 = new Three.Mesh(geometry, material);
            outBoard3.position.set(0, 1050, 25);

            const outBoard4 = new Three.Mesh(geometry, material);
            outBoard4.position.set(-1050, 0, 25);
            outBoard4.rotateZ(Math.PI / 2);

            scene.add(outBoard1);
            scene.add(outBoard2);
            scene.add(outBoard3);
            scene.add(outBoard4);

            const board = new Three.Mesh(new Three.BoxGeometry(BOARD_W, BOARD_H, 100), new Three.MeshLambertMaterial({ color: 0x0B440C}));
            scene.add(board);

            const remainTile = new Text(game, "剩餘張數: 56", Assets.font.jhengHei.key, 40, 1, new Three.MeshLambertMaterial({ color: 0x000000}));
            remainTile.rotation.setFromVector3(camera.rotation.toVector3());
            remainTile.position.set(-1500, 300, 650);
            scene.add(remainTile);

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
            const sea    = [];
            const hand   = [];
            const door   = [];
            const hu     = [];
            const name   = [];
            const score  = [];
            const arrow  = [];
            for (let i = 0; i < 4; i++) {
                hand.push(new CommonTileList(game, 13, tileTable, TILE_W, TILE_H, TILE_D, i === 0, 16, true));
                hu.push(new   CommonTileList(game, 0,  tileTable, TILE_W, TILE_H, TILE_D, false,   16, false));
                sea.push(new  CommonTileList(game, 0,  tileTable, TILE_W, TILE_H, TILE_D, false,   8,  false));

                door.push(new DoorTileList(game, tileTable, TILE_W, TILE_H, TILE_D, 16, true));

                name.push(new Text(game, "ID: ", Assets.font.jhengHei.key, 50, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 0, 0, 70));
                name[i].rotation.setFromVector3(camera.rotation.toVector3());

                score.push(new Text(game, "score: ", Assets.font.jhengHei.key, 50, 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 0, 0, 70));
                score[i].rotation.setFromVector3(camera.rotation.toVector3());

                arrow.push(new Cube(new Three.ExtrudeGeometry(shape, extrudeSettings), new Three.MeshLambertMaterial({ color: 0xF0F40E }), 0, 0));
                arrow[i].tint = DISABLE_TINT;
            }
            const draw = new CommonTileList(game, 0, tileTable, TILE_W, TILE_H, TILE_D, true);

            // hand
            hand[0].rotateX(Math.PI);
            new Three.Box3().setFromObject(hand[0]).getCenter(hand[0].position).multiplyScalar(-1);
            hand[0].position.y = -900 + TILE_H / 2;
            hand[0].position.z = (BOARD_D + TILE_D) / 2;

            hand[1].rotation.set(0, Math.PI, Math.PI / 2);
            new Three.Box3().setFromObject(hand[1]).getCenter(hand[1].position).multiplyScalar(-1);
            hand[1].position.x = 900 - TILE_H / 2;
            hand[1].position.z = (BOARD_D + TILE_D) / 2;

            hand[2].rotation.set(Math.PI, 0, Math.PI);
            new Three.Box3().setFromObject(hand[2]).getCenter(hand[2].position).multiplyScalar(-1);
            hand[2].position.y = 900 - TILE_H / 2;
            hand[2].position.z = (BOARD_D + TILE_D) / 2;

            hand[3].rotation.set(0, Math.PI, Math.PI * 3 / 2);
            new Three.Box3().setFromObject(hand[3]).getCenter(hand[3].position).multiplyScalar(-1);
            hand[3].position.x = -900 + TILE_H / 2;
            hand[3].position.z = (BOARD_D + TILE_D) / 2;

            // draw
            draw.rotateX(Math.PI  * 80 / 180);
            draw.position.set(7.5 * TILE_W, -900 + TILE_H / 2, (BOARD_D + TILE_H) / 2);

            // hu
            hu[0].position.set(-6 * TILE_W, -750 + TILE_H / 2, (BOARD_D + TILE_D) / 2);

            hu[1].rotateZ(Math.PI / 2);
            hu[1].position.set(750 - TILE_H / 2, -6 * TILE_W, (BOARD_D + TILE_D) / 2);

            hu[2].rotateZ(Math.PI);
            hu[2].position.set(6 * TILE_W, 750 - TILE_H / 2, (BOARD_D + TILE_D) / 2);

            hu[3].rotateZ(Math.PI * 3 / 2);
            hu[3].position.set(-750 + TILE_H / 2, 6 * TILE_W, (BOARD_D + TILE_D) / 2);

            // sea
            sea[0].position.set(-6.5 * TILE_W, -300 + TILE_H / 2, (BOARD_D + TILE_D) / 2);

            sea[1].rotateZ(Math.PI / 2);
            sea[1].position.set(300 - TILE_H / 2, -6.5 * TILE_W, (BOARD_D + TILE_D) / 2);

            sea[2].rotateZ(Math.PI);
            sea[2].position.set(6.5 * TILE_W, 300 - TILE_H / 2, (BOARD_D + TILE_D) / 2);

            sea[3].rotateZ(Math.PI * 3 / 2);
            sea[3].position.set(-300 + TILE_H / 2, 6.5 * TILE_W, (BOARD_D + TILE_D) / 2);

            // door
            door[0].position.set(9 * TILE_W, -900 + TILE_H / 4, (BOARD_D + TILE_D) / 2);

            door[1].rotateZ(Math.PI / 2);
            door[1].position.set(900 - TILE_H / 4, 9 * TILE_W, (BOARD_D + TILE_D) / 2);

            door[2].rotateZ(Math.PI);
            door[2].position.set(-9 * TILE_W, 900 - TILE_H / 4, (BOARD_D + TILE_D) / 2);

            door[3].rotateZ(Math.PI * 3 / 2);
            door[3].position.set(-900 + TILE_H / 4, -9 * TILE_W, (BOARD_D + TILE_D) / 2);

            // name
            // name[0].position.x -= 900;
            // name[0].position.y -= 1100;
            // name[0].position.z += 50;

            // name[1].position.x += 1200;

            // name[2].position.x -= 1500;

            // name[3].position.x -= 1200;

            // score
            // score[0].position.x -= 900;
            // score[0].position.y -= 1100;
            // score[0].position.z += 50;

            // score[1].position.x += 1200;

            // score[2].position.x -= 1500;

            // score[3].position.x -= 1200;

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

            scene.add(...hand);
            scene.add(...hu);
            scene.add(...sea);
            scene.add(...door);
            // scene.add(...name);
            // scene.add(...score);
            scene.add(...arrow);
            scene.add(draw);

            const checkButton     = new Button(game, RoundEdgedBox(200, 130, 100, 30, 1, 1, 1, 40), new Three.MeshLambertMaterial({ color: 0xFFFF00 }));
            const checkButtonText = new Text(game, "確認", Assets.font.jhengHei.key, 40 , 1, new Three.MeshLambertMaterial({ color: 0x000000 }), 0, 0, 52, true);
            checkButton.position.set(820, -850, 40);
            checkButton.stateTint.down    = DISABLE_TINT;
            checkButton.stateTint.disable = DISABLE_TINT;
            checkButton.add(checkButtonText);
            checkButton.visible = false;
            scene.add(checkButton);

            const timer = new Timer(new NumberDisplayer(new Text(game, "0", Assets.font.jhengHei.key, 80 , 20, new Three.MeshLambertMaterial({ color: 0xFFFFFF }), 0, 0, 50, true)), undefined, DISABLE_TINT);
            scene.add(timer);

            const choseLackDialog = new ChoseLackDialog(game, (dialog: ChoseLackDialog) => {
                const buttonGeometry = new Three.CylinderGeometry(40, 40, 1, 50);
                buttonGeometry.rotateX(Math.PI / 2);

                dialog.text = new Text(game, "定缺:", Assets.font.jhengHei.key, 50, 1, new Three.MeshLambertMaterial({ color: 0xFFFFFF }), -150, 0, 5, true);

                const fontMaterial = new Three.MeshLambertMaterial({ color: 0x000000 });

                dialog.char   = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: CHAR_COLOR }));
                dialog.dot　  = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: DOT_COLOR }));
                dialog.bamboo = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: BAMBOO_COLOR }));

                dialog.char.add(new   Text(game, "萬", Assets.font.jhengHei.key, 40, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.dot.add(new    Text(game, "筒", Assets.font.jhengHei.key, 40, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.bamboo.add(new Text(game, "條", Assets.font.jhengHei.key, 40, 1, fontMaterial.clone(), 0, 0, 2, true));

                dialog.char.position.x = 20;
                dialog.char.position.z = 5;
                dialog.char.stateTint.down    = DOWN_TINT;
                dialog.char.stateTint.disable = DISABLE_TINT;
                dialog.dot.position.x = 110;
                dialog.dot.position.z = 5;
                dialog.dot.stateTint.down    = DOWN_TINT;
                dialog.dot.stateTint.disable = DISABLE_TINT;
                dialog.bamboo.position.x = 200;
                dialog.bamboo.position.z = 5;
                dialog.bamboo.stateTint.down    = DOWN_TINT;
                dialog.bamboo.stateTint.disable = DISABLE_TINT;
            });
            choseLackDialog.position.set(-400, -800, 300);
            scene.add(choseLackDialog);

            const commandDialog = new CommandDialog(game, (dialog: CommandDialog) => {
                const buttonGeometry = new Three.CylinderGeometry(50, 50, 1, 50);
                buttonGeometry.rotateX(Math.PI / 2);

                const fontMaterial = new Three.MeshLambertMaterial({ color: 0x000000 });

                dialog.pon    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: PON_COLOR }));
                dialog.gon    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: GON_COLOR }));
                dialog.hu     = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: HU_COLOR }));
                dialog.ongon  = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: ONGON_COLOR }));
                dialog.pongon = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: PONGON_COLOR }));
                dialog.none   = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: SKIP_COLOR }));

                dialog.pon.add(new    Text(game, "碰",   Assets.font.jhengHei.key, 40, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.gon.add(new    Text(game, "槓",   Assets.font.jhengHei.key, 40, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.hu.add(new     Text(game, "胡",   Assets.font.jhengHei.key, 40, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.ongon.add(new  Text(game, "暗槓", Assets.font.jhengHei.key, 30, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.pongon.add(new Text(game, "碰槓", Assets.font.jhengHei.key, 30, 1, fontMaterial.clone(), 0, 0, 2, true));
                dialog.none.add(new   Text(game, "略過", Assets.font.jhengHei.key, 30, 1, fontMaterial.clone(), 0, 0, 2, true));

                dialog.pon.position.x = -275;
                dialog.pon.position.z = 5;
                dialog.pon.stateTint.down    = DOWN_TINT;
                dialog.pon.stateTint.disable = DISABLE_TINT;
                dialog.gon.position.x = -165;
                dialog.gon.position.z = 5;
                dialog.gon.stateTint.down    = DOWN_TINT;
                dialog.gon.stateTint.disable = DISABLE_TINT;
                dialog.hu.position.x = -55;
                dialog.hu.position.z = 5;
                dialog.hu.stateTint.down    = DOWN_TINT;
                dialog.hu.stateTint.disable = DISABLE_TINT;
                dialog.ongon.position.x = 55;
                dialog.ongon.position.z = 5;
                dialog.ongon.stateTint.down    = DOWN_TINT;
                dialog.ongon.stateTint.disable = DISABLE_TINT;
                dialog.pongon.position.x = 165;
                dialog.pongon.position.z = 5;
                dialog.pongon.stateTint.down    = DOWN_TINT;
                dialog.pongon.stateTint.disable = DISABLE_TINT;
                dialog.none.position.x = 275;
                dialog.none.position.z = 5;
                dialog.none.stateTint.down    = DOWN_TINT;
                dialog.none.stateTint.disable = DISABLE_TINT;
            });
            commandDialog.position.set(500, -1150, 300);
            scene.add(commandDialog);

            const changeTileEffect = new ChangeTileEffect(game, tileTable);
            scene.add(changeTileEffect);

            const lackEffect = [];
            lackEffect.push(new LackEffect(game, 0, -650, BOARD_D / 2 + 10, -750, -900, BOARD_D / 2 + 10));
            lackEffect.push(new LackEffect(game, 650, 0,  BOARD_D / 2 + 10,  900, -750, BOARD_D / 2 + 10));
            lackEffect.push(new LackEffect(game, 0, 650,  BOARD_D / 2 + 10,  750,  900, BOARD_D / 2 + 10));
            lackEffect.push(new LackEffect(game, -650, 0, BOARD_D / 2 + 10, -900,  750, BOARD_D / 2 + 10));
            scene.add(...lackEffect);

            mahjong.socket = socket;

            mahjong.remainTile = remainTile;

            mahjong.name      = name;
            mahjong.scoreText = score;
            mahjong.arrow     = arrow;

            mahjong.sea  = sea;
            mahjong.hu   = hu;
            mahjong.door = door;
            mahjong.hand = hand;
            mahjong.draw = draw;

            mahjong.effect.changeTileEffect = changeTileEffect;
            mahjong.effect.lackEffect       = lackEffect;

            mahjong.ui.checkButton = checkButton;

            mahjong.timer = timer;

            mahjong.choseLackDialog = choseLackDialog;
            mahjong.commandDialog   = commandDialog;

            mahjong.scene  = scene;
            mahjong.camera = camera;
        });
    };
}
