import { DataTable } from "./DataTable";
import { DataValues } from "./DataValues";
import { DataFacies } from "./DataFacies";
import { DataSamples } from "./DataSamples";

// LayoutInfo - this is a simple data table reference, but it will store some metadata
export class LayoutInfo {
    // fields
    public dataTable: DataTable = null;
    public scatterXAxis: DataValues = null;
    public scatterYAxis: DataValues = null;
    public scatterColor: DataFacies = null;
    public scatterSamples: DataSamples = null;

    // constructor
    constructor(dataTable: DataTable) {
        this.dataTable = dataTable;
        this.scatterXAxis = null;
        this.scatterYAxis = null;
        this.scatterColor = null;
        this.scatterSamples = null;
        this.resetScatter();
    }

    // reset scatter
    resetScatter() {
        this.scatterXAxis = this.scatterXAxis ? this.scatterXAxis : this.dataTable.dataValues[Math.max(0, 1)];
        this.scatterYAxis = this.scatterYAxis ? this.scatterYAxis : this.dataTable.dataValues[Math.max(0, 2)];
        this.scatterColor = this.scatterColor ? this.scatterColor : this.dataTable.dataFacies[0];
        if (this.scatterColor)
            this.scatterSamples = this.scatterSamples ? this.scatterSamples : this.scatterColor.dataSamples[0];
    }
}