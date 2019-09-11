import { DataSamples } from "./DataSamples";

// DataFacies
export class DataFacies {
    // fields
    public name: string = "";
    public recommended: boolean = false;
    public values: Array<number> = [];
    public dataSamples: Array<DataSamples> = [];
    public colorTable: Array<string> = [];
    public selected: boolean = false;
    // constructor
    constructor() {
        this.name = "";
        this.recommended = false;
        this.values = [];
        this.dataSamples = [];
        this.colorTable = Array.from(gFaciesColorTable);
        this.selected = false;
    }

    // getOrCreateDataDataSamples - find or create data array
    public getOrCreateDataSamples(name: string): DataSamples {
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

const gFaciesColorTable: string[] = [
    "blue", "red", "green", "orange",
    "#B0187B", "#8B7DA3", "#A545BB", "#C7A248",
    "#39F992", "#324CF7", "#D04D5E", "#1E88E6",
    "#92BFB3", "#858D1A", "#92E877", "#1FDFD9",
    "#DD7488", "#9DACBB", "#934591", "#FC9AA4",
];
