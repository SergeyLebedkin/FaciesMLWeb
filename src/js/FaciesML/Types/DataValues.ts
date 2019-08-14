// DATA_MINIMAL_VALUE
export const DATA_MINIMAL_VALUE = -999;

// DataValues
export class DataValues {
    // fields
    public name: string = "";
    public unit: string = "";
    public min: number = 0;
    public max: number = 0;
    public values: Array<number> = [];
    public predicts: Array<number> = [];
    public selected: boolean = false;
    // constructor
    constructor() {
        this.name = "";
        this.unit = "";
        this.min = 0;
        this.max = 0;
        this.values = [];
        this.predicts = [];
        this.selected = false;
    }

    // isPredict
    public isPredict(): boolean {
        return (this.values.length <= this.predicts.length);
    }

    // cleanPredicts
    public cleanPredicts(): void {
        this.predicts = [];
    }

    // updateMinMax
    public updateMinMax(): void {
        // filter values
        let localData = this.values.filter(value => value > DATA_MINIMAL_VALUE);
        if (localData.length === 0)
            localData = this.values;
        // find mina and max values
        this.min = localData[0];
        this.max = localData[0];
        for (let value of localData) {
            this.min = Math.min(this.min, value);
            this.max = Math.max(this.max, value);
        }
    }
}