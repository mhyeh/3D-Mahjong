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

export default function MahjongStart() {
    const isPlaying = false;

    // const socket = io.connect("http://140.118.127.157:3000", { transports: ["websocket"] });
    // socket.on("auth", () => {
    //     const uuid = localStorage.getItem("uuid");
    //     const room = localStorage.getItem("room");
    //     socket.emit("auth", uuid, room, (state: number) => {
    //         console.log(state);
    //         localStorage.setItem("state", state.toString());
    //         if (state === -1 || state === 0) {
    //             window.location.href = "./index.html";
    //         } else if (state === 4) {
    //             isPlaying = true;
    //         }
    //         Mahjongh5.StartGame(init, "game");
    //     });
    // });
    const init = (game: Game) => {
        game.assets     = Assets;

        const joinState = new JoinState(game);
        const mahjong   = new MahjongGame(game);
        game.gameStates.push(mahjong);

        // if (isPlaying) {
        //     game.gameStates.push(mahjong);
        // } else {
        //     game.gameStates.push(joinState);
        //     game.gameStates.push(mahjong);
        // }

        game.loadState.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);

            game.loadState.scene  = scene;
            game.loadState.camera = camera;
        });

        joinState.onCreate.add(() => {
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);

            joinState.scene  = scene;
            joinState.camera = camera;
        });

        mahjong.onCreate.add(() => {
            console.log(game.cache);
            const scene  = new Three.Scene();
            const camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 5000);

            scene.background = new Three.Color( 0xAAAAAA );

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
            const material  = new Three.MeshLambertMaterial({ color: 0x593B00});
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

            const boardW = 2000;
            const boardH = 2000;
            const board = new Three.Mesh(new Three.BoxGeometry(boardW, boardH, 100), new Three.MeshLambertMaterial({ color: 0x0B5B00}));
            scene.add(board);

            const tileTable = new ImageTileTable(game.cache[Assets.tiles.tiles_config.key], Assets.tiles.tiles.key);
            const sea    = [];
            const hand   = [];
            const door   = [];
            const hu     = [];
            const tileW  = 92;
            const tileH  = 128;
            const tileD  = 68;
            for (let i = 0; i < 4; i++) {
                hand.push(new CommonTileList(game, 13, tileTable, tileW, tileH, tileD, i === 0, 16, false));
                hu.push(new   CommonTileList(game, 0,  tileTable, tileW, tileH, tileD, false,   16, false));
                sea.push(new  CommonTileList(game, 0,  tileTable, tileW, tileH, tileD, false,   8,  false));

                door.push(new DoorTileList(game, tileTable, tileW, tileH, tileD, 16, false));
            }

            // hand
            hand[0].rotateX(Math.PI * 80 / 180);
            new Three.Box3().setFromObject(hand[0]).getCenter(hand[0].position).multiplyScalar(- 1);
            hand[0].position.y = -900 + tileD / 2;
            hand[0].position.z =  50  + tileH / 2;

            hand[1].rotation.set(0, Math.PI / 2, Math.PI / 2);
            new Three.Box3().setFromObject(hand[1]).getCenter(hand[1].position).multiplyScalar(- 1);
            hand[1].position.x = 900 - tileD / 2;
            hand[1].position.z = 50  + tileH / 2;

            hand[2].rotation.set(Math.PI / 2, 0, Math.PI);
            new Three.Box3().setFromObject(hand[2]).getCenter(hand[2].position).multiplyScalar(- 1);
            hand[2].position.y = 900 - tileD / 2;
            hand[2].position.z = 50  + tileH / 2;

            hand[3].rotation.set(0, Math.PI / 2, Math.PI * 3 / 2);
            new Three.Box3().setFromObject(hand[3]).getCenter(hand[3].position).multiplyScalar(- 1);
            hand[3].position.x = -900 + tileD / 2;
            hand[3].position.z =  50  + tileH / 2;

            // hu
            hu[0].position.set(-6 * tileW, -750 + tileH / 2, 50 + tileD / 2);

            hu[1].rotateZ(Math.PI / 2);
            hu[1].position.set(750 - tileH / 2, -6 * tileW, 50 + tileD / 2);

            hu[2].rotateZ(Math.PI);
            hu[2].position.set(6 * tileW, 750 - tileH / 2, 50 + tileD / 2);

            hu[3].rotateZ(Math.PI * 3 / 2);
            hu[3].position.set(-750 + tileH / 2, 6 * tileW, 50 + tileD / 2);

            // sea
            sea[0].position.set(-6.5 * tileW, -300 + tileH / 2, 50 + tileD / 2);

            sea[1].rotateZ(Math.PI / 2);
            sea[1].position.set(300 - tileH / 2, -6.5 * tileW, 50 + tileD / 2);

            sea[2].rotateZ(Math.PI);
            sea[2].position.set(6.5 * tileW, 300 - tileH / 2, 50 + tileD / 2);

            sea[3].rotateZ(Math.PI * 3 / 2);
            sea[3].position.set(-300 + tileH / 2, 6.5 * tileW, 50 + tileD / 2);

            // door
            door[0].position.set(6 * tileW, -900 + tileH / 4, 50 + tileD / 2);

            door[1].rotateZ(Math.PI / 2);
            door[1].position.set(900 - tileH / 4, 6 * tileW, 50 + tileD / 2);

            door[2].rotateZ(Math.PI);
            door[2].position.set(-6 * tileW, 900 - tileH / 4, 50 + tileD / 2);

            door[3].rotateZ(Math.PI * 3 / 2);
            door[3].position.set(-900 + tileH / 4, -6 * tileW, 50 + tileD / 2);

            scene.add(...hand);
            scene.add(...hu);
            scene.add(...sea);
            scene.add(...door);

            const checkButton     = new Button(game, RoundEdgedBox(200, 130, 100, 30, 1, 1, 1, 40), new Three.MeshLambertMaterial({ color: 0xFFFF00 }));
            const checkButtonText = new Text(game, "確認", Assets.font.sourceHan.key, 40 , 1, new Three.MeshLambertMaterial({ color: 0x000000 }), -55, -27, 50);
            checkButton.position.set(820, -850, 40);
            checkButton.stateTint.down    = 0x707070;
            checkButton.stateTint.disable = 0x707070;
            checkButton.add(checkButtonText);
            checkButton.visible = false;

            scene.add(checkButton);

            const choseLackDialog = new ChoseLackDialog(game, (dialog: ChoseLackDialog) => {
                const buttonGeometry = new Three.CylinderGeometry(40, 40, 1, 50);
                buttonGeometry.rotateX(Math.PI / 2);

                dialog.text = new Text(game, "定缺:", Assets.font.sourceHan.key, 50, 1, new Three.MeshLambertMaterial({ color: 0xFFFFFF }), -210, -25, 5);

                const fontMaterial = new Three.MeshLambertMaterial({ color: 0x000000 });

                dialog.char   = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0xD10000 }));
                dialog.dot　  = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0x02C3E5 }));
                dialog.bamboo = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0xF7F71B }));

                dialog.char.add(new   Text(game, "萬", Assets.font.sourceHan.key, 40, 1, fontMaterial.clone(), -26,　-20, 0));
                dialog.dot.add(new    Text(game, "筒", Assets.font.sourceHan.key, 40, 1, fontMaterial.clone(), -26,　-20, 0));
                dialog.bamboo.add(new Text(game, "條", Assets.font.sourceHan.key, 40, 1, fontMaterial.clone(), -26,　-20, 0));

                dialog.char.position.x = 20;
                dialog.char.position.z = 5;
                dialog.char.stateTint.down    = 0x707070;
                dialog.char.stateTint.disable = 0x707070;
                dialog.dot.position.x = 110;
                dialog.dot.position.z = 5;
                dialog.dot.stateTint.down    = 0x707070;
                dialog.dot.stateTint.disable = 0x707070;
                dialog.bamboo.position.x = 200;
                dialog.bamboo.position.z = 5;
                dialog.bamboo.stateTint.down    = 0x707070;
                dialog.bamboo.stateTint.disable = 0x707070;
            });
            choseLackDialog.position.set(-400, -800, 300);

            scene.add(choseLackDialog);

            const commandDialog = new CommandDialog(game, (dialog: CommandDialog) => {
                const buttonGeometry = new Three.CylinderGeometry(50, 50, 1, 50);
                buttonGeometry.rotateX(Math.PI / 2);

                const fontMaterial = new Three.MeshLambertMaterial({ color: 0x000000 });

                dialog.pon    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0xF7F71B }));
                dialog.gon    = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0x02C3E5 }));
                dialog.hu     = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0xD10000 }));
                dialog.ongon  = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0x8B00E2 }));
                dialog.pongon = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0xE57200 }));
                dialog.none   = new Button(game, buttonGeometry, new Three.MeshLambertMaterial({ color: 0x00E212 }));

                dialog.pon.add(new    Text(game, "碰",   Assets.font.sourceHan.key, 40, 1, fontMaterial.clone(), -28, -20, 5));
                dialog.gon.add(new    Text(game, "槓",   Assets.font.sourceHan.key, 40, 1, fontMaterial.clone(), -28, -20, 5));
                dialog.hu.add(new     Text(game, "胡",   Assets.font.sourceHan.key, 40, 1, fontMaterial.clone(), -28, -20, 5));
                dialog.ongon.add(new  Text(game, "暗槓", Assets.font.sourceHan.key, 30, 1, fontMaterial.clone(), -43, -15, 5));
                dialog.pongon.add(new Text(game, "碰槓", Assets.font.sourceHan.key, 30, 1, fontMaterial.clone(), -43, -15, 5));
                dialog.none.add(new   Text(game, "略過", Assets.font.sourceHan.key, 30, 1, fontMaterial.clone(), -43, -15, 5));

                dialog.pon.position.x = -275;
                dialog.pon.position.z = 5;
                dialog.pon.stateTint.down    = 0x707070;
                dialog.pon.stateTint.disable = 0x707070;
                dialog.gon.position.x = -165;
                dialog.gon.position.z = 5;
                dialog.gon.stateTint.down    = 0x707070;
                dialog.gon.stateTint.disable = 0x707070;
                dialog.hu.position.x = -55;
                dialog.hu.position.z = 5;
                dialog.hu.stateTint.down    = 0x707070;
                dialog.hu.stateTint.disable = 0x707070;
                dialog.ongon.position.x = 55;
                dialog.ongon.position.z = 5;
                dialog.ongon.stateTint.down    = 0x707070;
                dialog.ongon.stateTint.disable = 0x707070;
                dialog.pongon.position.x = 165;
                dialog.pongon.position.z = 5;
                dialog.pongon.stateTint.down    = 0x707070;
                dialog.pongon.stateTint.disable = 0x707070;
                dialog.none.position.x = 275;
                dialog.none.position.z = 5;
                dialog.none.stateTint.down    = 0x707070;
                dialog.none.stateTint.disable = 0x707070;
            });
            commandDialog.position.set(500, -1150, 300);

            scene.add(commandDialog);

            mahjong.sea  = sea;
            mahjong.hu   = hu;
            mahjong.door = door;
            mahjong.hand = hand;

            mahjong.ui.checkButton = checkButton;

            mahjong.choseLackDialog = choseLackDialog;
            mahjong.commandDialog   = commandDialog;

            mahjong.scene  = scene;
            mahjong.camera = camera;
        });
    };
    Mahjongh5.StartGame(init, "game");
}
