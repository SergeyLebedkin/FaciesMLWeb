import { DataTable } from "./DataTable";
import { DataValues } from "./DataValues";
import { DataFacies } from "./DataFacies";
import { DataSamples } from "./DataSamples";
import { ImageInfo } from "./ImageInfo";

// LayoutInfo - this is a simple data table reference, but it will store some metadata
export class LayoutInfo {
    // fields
    public dataTable: DataTable = null;
    public imageInfoList: Array<ImageInfo> = null;
    public scatterXAxis: DataValues = null;
    public scatterYAxis: DataValues = null;
    public scatterFacies: DataFacies = null;
    public scatterSamples: DataSamples = null;

    // constructor
    constructor(dataTable: DataTable) {
        this.dataTable = dataTable;
        this.imageInfoList = [];
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

    // getMaxImageWidth
    public getMaxImageWidth(): number {
        let maxWidth: number = 0;
        for (let imageInfo of this.imageInfoList)
            maxWidth = Math.max(maxWidth, imageInfo.canvasImage.width);
        return maxWidth;
    }
}