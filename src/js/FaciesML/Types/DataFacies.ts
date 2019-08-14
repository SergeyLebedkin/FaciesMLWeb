import { DataSamples } from "./DataSamples";

// DataFacies
export class DataFacies {
    // fields
    public name: string = "";
    public recomended: boolean = false;
    public values: Array<number> = [];
    public samples: Array<DataSamples> = [];
    public selected: boolean = false;
    // constructor
    constructor() {
        this.name = "";
        this.recomended = false;
        this.values = [];
        this.samples = [];
        this.selected = false;
    }
}