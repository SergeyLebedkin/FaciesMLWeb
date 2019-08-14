import { DataTable } from "./DataTable";

// LayoutInfo - this is a simple data table reference, but it will store some metadata
export class LayoutInfo {
    // fields
    public dataTable: DataTable = null;
    // constructor
    constructor(dataTable: DataTable) {
        this.dataTable = dataTable;
    }
}