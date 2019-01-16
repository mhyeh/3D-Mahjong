import Effect from "./Effect";
import * as System from "mahjongh5/System";
import NumberDisplayer from "mahjongh5/ui/NumberDisplayer";
import Text from "mahjongh5/ui/Text";

const SEC = 1000;

export default class Timer extends Effect {
    private enableTint:  number;
    private disableTint: number;

    private timer: NumberDisplayer;

    public get Text(): Text {
        return this.timer.displayer;
    }

    constructor(timer: NumberDisplayer, enableTint: number = ENABLE_TINT, disableTint: number = DISABLE_TINT) {
        super();
        this.add(timer.displayer);
        this.timer = timer;
        this.enableTint  = enableTint;
        this.disableTint = disableTint;
        this.Text.tint   = this.disableTint;
    }

    protected *RunEffect(time: number): IterableIterator<Promise<void>> {
        this.timer.Value = time / SEC;
        this.Text.tint   = this.enableTint;
        while (this.timer.Value > 0) {
            yield System.Delay(SEC);
            this.timer.Value--;
        }
    }

    protected async EndEffect(): Promise<void> {
        this.timer.Value = 0;
        this.Text.tint   = this.disableTint;
    }
}
