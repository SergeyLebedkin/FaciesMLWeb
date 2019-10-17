import { DataTable } from "./DataTable";
import { DataValues } from "./DataValues";
import { DataFacies } from "./DataFacies";
import { DataSamples } from "./DataSamples";
import { ImageInfoList } from "./ImageInfoList";

// LayoutInfo - this is a simple data table reference, but it will store some metadata
export class LayoutInfo {
    // fields
    public dataTable: DataTable = null;
    public imageInfoList: ImageInfoList = null;
    public scatterXAxis: DataValues = null;
    public scatterYAxis: DataValues = null;
    public scatterFacies: DataFacies = null;
    public scatterSamples: DataSamples = null;

    // constructor
    constructor(dataTable: DataTable) {
        this.dataTable = dataTable;
        // create new imageinfo list
        this.imageInfoList = new ImageInfoList(
            dataTable.dataValues[0].min,
            dataTable.dataValues[0].max,
            dataTable.dataValues[0].values.length);
        this.scatterXAxis = null;
        this.scatterYAxis = null;
        this.scatterFacies = null;
        this.scatterSamples = null;
        this.scatterSamples = null;
        this.resetScatter();
    }

    // reset scatter
    resetScatter() {
        this.scatterXAxis = this.scatterXAxis ? this.scatterXAxis : this.dataTable.dataValues[1];
        this.scatterYAxis = this.scatterYAxis ? this.scatterYAxis : this.dataTable.dataValues[2];
        this.scatterFacies = this.scatterFacies ? this.scatterFacies : this.dataTable.dataFacies[0];
        if (this.scatterFacies)
            this.scatterSamples = this.scatterSamples ? this.scatterSamples : this.scatterFacies.dataSamples[0];
    }
}