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
        this.dataTable = dataTable;
        this.dataArrays = dataArrays;
        dataArrays.forEach(dataArray => this.name += dataArray.name + ",");
    }
}