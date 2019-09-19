import { DataSamples } from "./DataSamples";

export class MergePair {
    public from: number = 0;
    public to: number = 0;
    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
    }
}

// DataFacies
export class DataFacies {
    // fields
    public name: string = "";
    public recommended: boolean = false;
    public values: Array<number> = [];
    public dataSamples: Array<DataSamples> = [];
    public colorTable: Array<string> = [];
    public selected: boolean = false;
    // merge data
    public valuesDisplay: Array<number> = [];
    public valuesMergePairs: Array<MergePair> = [];
    public valuesAvailable: Set<number> = null;
    // constructor
    constructor() {
        this.name = "";
        this.recommended = false;
        this.values = [];
        this.dataSamples = [];
        this.colorTable = Array.from(gFaciesColorTable);
        this.selected = false;
        // merge data
        this.valuesDisplay = new Array<number>();
        this.valuesMergePairs = new Array<MergePair>();
        this.valuesAvailable = new Set<number>();
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

    // addMergePair
    public addMergePair(from: number, to: number): void {
        this.valuesMergePairs.push(new MergePair(from, to));
        this.updateMergeData();
    }

    // addMergePair
    public removeLastMergePair(): void {
        this.valuesMergePairs.pop();
        this.updateMergeData();
    }

    // updateMergeData
    public updateMergeData(): void {
        this.valuesDisplay = Array.from(this.values);
        this.valuesAvailable = new Set<number>();
        // get all original available values
        for (let value of this.valuesDisplay)
            this.valuesAvailable.add(value);
        // update display data and available values
        for (let pair of this.valuesMergePairs)
            for (let i = 0; i < this.valuesDisplay.length; i++)
                if (this.valuesDisplay[i] === pair.from)
                    this.valuesDisplay[i] = pair.to;
        // update available values
        for (let pair of this.valuesMergePairs)
            this.valuesAvailable.delete(pair.from);
    }

    // loadFromJson
    public loadFromJson(json: any) {
        this.values = [];
        this.values.length = Object.keys(json).length;
        for (let index in json)
            this.values[parseInt(index)] = json[index];
        this.updateMergeData();
    }
}

const gFaciesColorTable: string[] = [
    "#FF0000", "#00FF00", "#0000FF", "#FF8800",
    "#B0187B", "#8B7DA3", "#A545BB", "#C7A248",
    "#39F992", "#324CF7", "#D04D5E", "#1E88E6",
    "#92BFB3", "#858D1A", "#92E877", "#1FDFD9",
    "#DD7488", "#9DACBB", "#934591", "#FC9AA4",
];
