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
            // TODO: change data facies recomendations
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
            for (let dataSamples of dataFacies.samples) {
                if (dataSamples.selected) count++;
            }
        }
        return count;
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
};
