import { DataTable } from "./DataTable";
import { DataArray, DataArrayType } from "./DataArray";

// LayoutInfo
export class LayoutInfo {
    // fields
    public name: string = "";
    public dataTable: DataTable = null;
    public dataArrays: Array<DataArray> = null;
    // constructor
    constructor(dataTable: DataTable, dataArrays: Array<DataArray>) {
        // set data
        this.dataTable = dataTable;
        this.dataArrays = dataArrays;
        // create some name
        this.name = "";
        for (let dataArray of this.dataArrays)
            this.name += dataArray.name + ",";
    }

    // getJSON
    public getJSON(): object {
        // create selection data
        let selectionsData = this.dataTable.selections;
        if (selectionsData.findIndex(val => val > 0) < 0) {
            selectionsData = [];
            selectionsData.length = this.dataTable.selections.length;
            selectionsData.fill(1);
        }
        // selection data node
        let json = {
            "Depth": {
                "unit": this.dataTable.data[0].unit,
                "data": this.dataTable.data[0].values
            },
            "selections": {
                "unit": "",
                "data": selectionsData
            }
        }
        // data array node
        for (let dataArray of this.dataArrays) {
            if (dataArray.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_VALUE) {
                json[dataArray.name] = {
                    "unit": dataArray.unit,
                    "data": dataArray.values
                };
            }
        };
        return json;
    }
}