import Game from "./Game";

export function StartGame(config: (game: Game) => void, display: string) {
    const game = new Game(display);
    config(game);
    game.Start();

    window.addEventListener("resize", game.Resize.bind(game), false);
}
