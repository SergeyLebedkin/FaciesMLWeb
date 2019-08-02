import { DataArray } from "./DataArray"

// DataTable
export class DataTable {
    // fileds
    public fileRef: File = null;
    public name: string = "";
    public data: Array<DataArray> = null;
    public selections: Array<number> = null;
    // events
    public onloadFileData: (this: DataTable, dataTable: DataTable) => any = null;
    // constructor
    constructor() {
        this.fileRef = null;
        this.name = "";
        this.data = [];
        this.selections = [];
    }

    // loadFromFile
    public loadFromFile(file: File) {
        // check for null
        if (file === null) return;
        // store name
        this.fileRef = file;
        this.name = file.name;
        // read file
        var fileReader = new FileReader();
        fileReader.onload = event => {
            this.loadFromString(event.currentTarget["result"]);
            this.onloadFileData && this.onloadFileData(this);
        }
        fileReader.readAsText(this.fileRef);
    }

    // loadFromString
    public loadFromString(str: string) {
        // get strings list
        let strings: Array<string> = str.split('\n');
        // find first row table string index
        let firstRowTableStringIndex = strings.findIndex(value => value.includes("~A"));
        if (firstRowTableStringIndex < 0) return;
        firstRowTableStringIndex++;

        // create daеa table
        this.data = [];
        let paramsStr = strings[firstRowTableStringIndex].trim();
        let valuesCount = paramsStr.split(" ").filter(val => val != "").length;
        for (let i = 0; i < valuesCount; i++) {
            this.data.push(new DataArray());
        }

        // parce rows
        for (let rowIndex = firstRowTableStringIndex; rowIndex < strings.length; rowIndex++) {
            let paramsStr = strings[rowIndex].trim();
            let values = paramsStr.split(" ").filter(val => val != "");
            values.forEach((value, index) => this.data[index].values.push(parseFloat(value)));
        }

        // find first row table string index
        let firstRowNameUnit = firstRowTableStringIndex = strings.findIndex(value => value.includes("~Curve Information Block"));
        if (firstRowNameUnit < 0) return;
        firstRowNameUnit += 3;

        // parce name and unit
        for (let rowIndex = 0; rowIndex < valuesCount; rowIndex++) {
            let params = strings[firstRowNameUnit + rowIndex];
            this.data[rowIndex].name = params.split(".")[0].trim();
            this.data[rowIndex].unit = params.split(".")[1].split(" ")[0].trim();
        }

        // update min and max ranges
        this.data.forEach(dataArray => {
            // get min and max values
            let minValue = dataArray.values[0];
            let maxValue = dataArray.values[0];
            for (let value of dataArray.values) {
                if (minValue > value)
                    minValue = value;
                if (maxValue < value)
                    maxValue = value;
            }
            dataArray.min = minValue;
            dataArray.max = maxValue;
        })
        this.selections.length = this.data[0].values.length;
        this.selections.fill(0);
    }
};
