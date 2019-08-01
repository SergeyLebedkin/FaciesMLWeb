import { DataTable } from "./DataTable";
import { DataArray } from "./DataArray";

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
}