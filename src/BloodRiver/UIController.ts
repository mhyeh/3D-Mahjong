import UIController from "mahjongh5/component/UIController";
import Button from "mahjongh5/ui/Button";
import Sound from "mahjongh5/ui/Sound";

export default class MahjongUI extends UIController {
    public spinSound:     Sound;
    public countSound:    Sound;
    public countEndSound: Sound;
    public betSound:      Sound;
    public betMaxSound:   Sound;
    public roundSound:    Sound;

    public infoNextButton:     Button;
    public infoPreviousButton: Button;
    public settingButton:      Button;
    public cancelHelpButton:   Button;
    public checkButton:        Button;
    public readyButton:        Button;

    public avatar: Button[];

    constructor() {
        super();
        // 設定UI樣式設定
    }
}
