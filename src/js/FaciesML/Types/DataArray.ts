// DataArray
export class DataArray {
    // fields
    public name: string = "";
    public unit: string = "";
    public min: number = 0;
    public max: number = 0;
    public values: Array<number> = [];
    // constructor
    constructor() {
        this.name = "";
        this.unit = "";
        this.min = 0;
        this.max = 0;
        this.values = [];
    }
};
