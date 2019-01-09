import * as Three from "three";
import * as io from "socket.io-client";
import * as Mahjongh5 from "mahjongh5/Mahjongh5";
import Game from "mahjongh5/Game";
import JoinState from "./JoinState";
import MahjongGame from "./MahjongGame";

export default function MahjongStart() {
    let isPlaying = false;

    const socket = io.connect("http://140.118.127.157:3000", { transports: ["websocket"] });
    socket.on("auth", () => {
        const uuid = localStorage.getItem("uuid");
        const room = localStorage.getItem("room");
        socket.emit("auth", uuid, room, (state: number) => {
            console.log(state);
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
        const joinState = new JoinState();
        const mahjong   = new MahjongGame();
        if (isPlaying) {
            game.gameState.push(mahjong);
        } else {
            game.gameState.push(joinState);
        }

        joinState.onCreate.add(() => {
            joinState.scene  = new Three.Scene();
            joinState.camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);
        });

        mahjong.onCreate.add(() => {
            mahjong.scene  = new Three.Scene();
            mahjong.camera = new Three.PerspectiveCamera(50, game.sceneWidth / game.sceneHeight, 0.1, 3000);
        });
    };
}
