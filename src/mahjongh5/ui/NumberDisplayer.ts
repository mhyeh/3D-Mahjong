import Text from "./Text";

export default class NumberDisplayer {
    public displayer: Text;

    private value: number;

    public get Value(): number {
        return this.value;
    }
    public set Value(value: number) {
        if (this.value !== value) {
            this.value = value;
            this.displayer.text = value.toString();
        }
    }

    constructor(displayer: Text) {
        this.displayer = displayer;
    }
}
