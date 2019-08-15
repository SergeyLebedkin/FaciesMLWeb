import { DataValues } from "./DataValues"
import { DataFacies } from "./DataFacies"

// DataTable
export class DataTable {
    // fileds
    public fileRef: File = null;
    public name: string = "";
    public dataValues: Array<DataValues> = [];
    public dataFacies: Array<DataFacies> = [];
    public selections: Array<number> = [];
    public optimizedСlusterNum: number = 0.0;
    // events
    public onloadFileData: (this: DataTable, dataTable: DataTable) => any = null;
    // constructor
    constructor() {
        this.fileRef = null;
        this.name = "";
        this.dataValues = [];
        this.dataFacies = [];
        this.selections = [];
        this.optimizedСlusterNum = 0.0;
    }

    // setOptimizedСlusterNum
    public setOptimizedСlusterNum(optimizedСlusterNum: number) {
        if (this.optimizedСlusterNum !== optimizedСlusterNum) {
            this.optimizedСlusterNum = optimizedСlusterNum;
            for (let dataFacies of this.dataFacies) {
                dataFacies.recommended = (dataFacies.name == this.optimizedСlusterNum.toFixed());
            }
        }
    }

    // getSelectedCount
    public getSelectedCount(): number {
        let count = 0;
        // get count of data values selected
        for (let dataValues of this.dataValues) {
            if (dataValues.selected) count++;
        }
        // get count of data facies selected
        for (let dataFacies of this.dataFacies) {
            if (dataFacies.selected) count++;
            // get count of data samples selected
            for (let dataSamples of dataFacies.dataSamples) {
                if (dataSamples.selected) count++;
            }
        }
        return count;
    }

    // getSelectedCaption
    public getSelectedCaption(): string {
        let caption: string = "";
        // get count of data values selected
        for (let dataValues of this.dataValues) {
            if (dataValues.selected) caption += dataValues.name + ",";
        }
        // get count of data facies selected
        for (let dataFacies of this.dataFacies) {
            if (dataFacies.selected) caption += dataFacies.name + ",";
            // get count of data samples selected
            for (let dataSamples of dataFacies.dataSamples) {
                if (dataSamples.selected) caption += dataSamples.name + ",";
            }
        }
        return caption;
    }

    // getOrCreateDataValue - find or create data array
    public getOrCreateDataValues(name: string): DataValues {
        let dataValues = this.dataValues.find(dataValues => dataValues.name === name);
        if (!dataValues) {
            dataValues = new DataValues();
            dataValues.name = name;
            this.dataValues.push(dataValues);
        }
        return dataValues;
    }

    // getOrCreateDataFacies - find or create data array
    public getOrCreateDataFacies(name: string): DataFacies {
        let dataFacies = this.dataFacies.find(dataFacies => dataFacies.name === name);
        if (!dataFacies) {
            dataFacies = new DataFacies();
            dataFacies.name = name;
            this.dataFacies.push(dataFacies);
        }
        return dataFacies;
    }

    // saveSelectedToJson
    public saveSelectedToJson(): any {
        // create selection data
        let selectionsData = this.selections;
        if (selectionsData.findIndex(val => val > 0) < 0) {
            selectionsData = [];
            selectionsData.length = this.selections.length;
            selectionsData.fill(1);
        }
        // selection data node
        let json = {
            "Depth": {
                "unit": this.dataValues[0].unit,
                "data": this.dataValues[0].values
            },
            "selections": {
                "unit": "",
                "data": selectionsData
            }
        }
        // data array node
        for (let dataValues of this.dataValues) {
            if (dataValues.selected) {
                json[dataValues.name] = {
                    "unit": dataValues.unit,
                    "data": dataValues.values
                }
            }
        }
        return json;
    }

    // updateValuesFromJson
    public updateValuesFromJson(json: any): void {
        for (let key in json) {
            if (key === "Depth") {
                // skip
            } else if (key === "selections") {
                // skip
            } else if (!isNaN(Number(key))) {
                let dataFacies = this.getOrCreateDataFacies(key as string);
                dataFacies.loadFromJson(json[key]);
                dataFacies.recommended = (dataFacies.name === this.optimizedСlusterNum.toFixed(0));
            } else {
                let dataValues = this.getOrCreateDataValues(key as string);
                dataValues.loadPredictFromJson(json[key])
            }
        }
    }

    // updateSamplesFromJson
    public updateSamplesFromJson(json: any): void {
        if (!json["samples_mask"]) return;
        if (!json["num_clusters"]) return;

        // read samples one by one
        Object.keys(json["samples_mask"]).forEach((value, index) => {
            let faciesName = json["num_clusters"][value] as string;
            let dataFacies = this.dataFacies.find(dataFacies => dataFacies.name == faciesName);
            if (dataFacies) {
                // create sample mask
                let dataSamples = dataFacies.getOrCreateDataDataSamples(json["num_samples"][value]);
                dataSamples.recommended = (json["optimized_samples"][value] == 1);
                dataSamples.loadFromCommaString(json["samples_mask"][value]);
            }
        });
    }

    // loadFromFileLAS
    public loadFromFileLAS(file: File) {
        // check for null
        if (file === null) return;
        // store name
        this.fileRef = file;
        this.name = file.name;
        // read file
        var fileReader = new FileReader();
        fileReader.onload = event => {
            this.loadFromStringLAS(event.currentTarget["result"]);
            this.onloadFileData && this.onloadFileData(this);
        }
        fileReader.readAsText(this.fileRef);
    }

    // loadFromStringLAS
    public loadFromStringLAS(str: string): void {
        // get strings list
        let strings: Array<string> = str.split('\n');
        // find first row table string index
        let firstRowTableStringIndex = strings.findIndex(value => value.includes("~A"));
        if (firstRowTableStringIndex < 0) return;
        firstRowTableStringIndex++;

        // create daеa table
        this.dataValues = [];
        let paramsStr = strings[firstRowTableStringIndex].trim();
        let valuesCount = paramsStr.split(" ").filter(val => val != "").length;
        for (let i = 0; i < valuesCount; i++) {
            this.dataValues.push(new DataValues());
        }

        // parce rows
        for (let rowIndex = firstRowTableStringIndex; rowIndex < strings.length; rowIndex++) {
            let paramsStr = strings[rowIndex].trim();
            let values = paramsStr.split(" ").filter(val => val != "");
            values.forEach((value, index) => this.dataValues[index].values.push(parseFloat(value)));
        }

        // find first row table string index
        let firstRowNameUnit = firstRowTableStringIndex = strings.findIndex(value => value.includes("~Curve Information Block"));
        if (firstRowNameUnit < 0) return;
        firstRowNameUnit += 3;

        // parce name and unit
        for (let rowIndex = 0; rowIndex < valuesCount; rowIndex++) {
            let params = strings[firstRowNameUnit + rowIndex];
            this.dataValues[rowIndex].name = params.split(".")[0].trim();
            this.dataValues[rowIndex].unit = params.split(".")[1].split(" ")[0].trim();
        }

        // update min and max ranges
        this.dataValues.forEach(dataArray => dataArray.updateMinMax());
        this.selections.length = this.dataValues[0].values.length;
        this.selections.fill(0);
    }

    // saveToCSV
    public saveToCSV(): string {
        let csv = "";
        if (this.dataValues.length === 0) return csv;
        // save depth
        csv += this.dataValues[0].name + ",";
        for (let dataValues of this.dataValues)
            if (dataValues.selected)
                csv += dataValues.name + ",";
        for (let dataFacies of this.dataFacies) {
            if (dataFacies.selected)
                csv += dataFacies.name + ",";
            for (let dataSamples of dataFacies.dataSamples) {
                if (dataSamples.selected)
                    csv += dataSamples.name + ",";
            }
        }
        csv += "\r\n";
        for (let i = 0; i < this.dataValues[0].values.length; i++) {
            csv += this.dataValues[0].values[i] + ",";
            for (let dataValues of this.dataValues)
                if (dataValues.selected) {
                    if (dataValues.isPredict())
                        csv += dataValues.predicts[i] + ","
                    else
                        csv += dataValues.values[i] + ","
                }
            for (let dataFacies of this.dataFacies) {
                if (dataFacies.selected)
                    csv += dataFacies.values[i] + ",";
                for (let dataSamples of dataFacies.dataSamples) {
                    if (dataSamples.selected)
                        csv += dataSamples.values[i] + ",";
                }
            }
            csv += "\r\n";
        }
        return csv;
    }
};
