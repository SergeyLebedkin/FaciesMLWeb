// DataSamples
export class DataSamples {
    // fields
    public name: string = "";
    public values: Array<number> = [];
    public recommended: boolean = false;
    public selected: boolean = false;
    // constructor
    constructor() {
        this.name = "";
        this.values = [];
        this.recommended = false;
        this.selected = false;
    };

    // loadFromCommaString
    public loadFromCommaString(str: string): void {
        this.values = [];
        str.split(",").forEach(value => this.values.push(parseInt(value)));
    };
}