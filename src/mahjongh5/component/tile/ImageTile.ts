import * as Three from "three";
import Tile from "./Tile";
import ImageTileTable from "./ImageTileTable";
import Game from "mahjongh5/Game";
import RoundEdgedBox from "mahjongh5/Util/RoundBoxGeometry";
import Cube from "mahjongh5/ui/Cube";

export default class ImageTile extends Tile<ImageTileTable> {
    private frontMaterial: Three.Material;
    private backMaterial:  Three.Material;

    private front: Cube;
    private back:  Cube;

    constructor(game: Game, tileW: number, tileH: number, tileD: number, tileR: number, tileTable: ImageTileTable, x?: number, y?: number, z?: number, w?: number, h?: number, r?: number) {
        const geometry = RoundEdgedBox(tileW, tileH, tileD, tileR, 1, 1, 1, tileR);
        const material = new Three.MeshLambertMaterial({ color: 0xFFFFFF });

        super(game, geometry, material, tileTable, x, y, z);

        const planeGeometry = new Three.PlaneGeometry(tileW - tileR * 2, tileH - tileR * 2);
        this.frontMaterial  = new Three.MeshLambertMaterial({ color: 0xFFFFFF });
        this.backMaterial   = new Three.MeshLambertMaterial({ color: 0x026300, side: Three.DoubleSide });

        this.front = new Cube(planeGeometry, this.frontMaterial);
        this.back  = new Cube(planeGeometry, this.backMaterial);
        this.front.position.z =  this.depth / 2 + 2;
        this.back.position.z  = -this.depth / 2 - 3;
        this.add(this.front);
        this.add(this.back);

        if (tileTable.GetConfig(0)) {
            this.ID = tileTable.GetConfig(0).tile;
        }
    }

    public setTint(disable: number = 0xFFFFFF, down: number = 0xFFFFFF, out: number = 0xFFFFFF, over: number = 0xFFFFFF, up: number = 0xFFFFFF) {
        this.stateTint.disable = disable;
        this.stateTint.down    = down;
        this.stateTint.out     = out;
        this.stateTint.over    = over;
        this.stateTint.up      = up;
    }

    protected OnIDChangedHandler() {
        this.UpdateImages();
        super.OnIDChangedHandler();
    }

    private UpdateImages(): void {
        const texture = this.tileTable.GetTexture(this.ID);
        if (this.frontMaterial instanceof Three.MeshBasicMaterial    || this.frontMaterial instanceof Three.MeshLambertMaterial ||
            this.frontMaterial instanceof Three.MeshStandardMaterial || this.frontMaterial instanceof Three.MeshPhongMaterial) {
            if (texture) {
                this.frontMaterial.map = texture;
            }
        }
        this.front.visible = texture !== undefined;
    }
}
