import { DataSamples } from "./DataSamples";

// DataFacies
export class DataFacies {
    // fields
    public name: string = "";
    public recommended: boolean = false;
    public values: Array<number> = [];
    public dataSamples: Array<DataSamples> = [];
    public selected: boolean = false;
    // constructor
    constructor() {
        this.name = "";
        this.recommended = false;
        this.values = [];
        this.dataSamples = [];
        this.selected = false;
    }

    // getOrCreateDataDataSamples - find or create data array
    public getOrCreateDataDataSamples(name: string): DataSamples {
        let dataSamples = this.dataSamples.find(dataSamples => dataSamples.name === name);
        if (!dataSamples) {
            dataSamples = new DataSamples();
            dataSamples.name = name;
            this.dataSamples.push(dataSamples);
        }
        return dataSamples;
    }

    // loadFromJson
    public loadFromJson(json: any) {
        this.values = [];
        this.values.length = Object.keys(json).length;
        for (let index in json)
            this.values[parseInt(index)] = json[index];
    }
}