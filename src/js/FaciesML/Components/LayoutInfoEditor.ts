import { DataTable } from "../Types/DataTable";
import { DataArray } from "../Types/DataArray";
import { LayoutInfo } from "../Types/LayoutInfo";

const LAYOUT_COLUMN_WIDTH: number = 256;
const LAYOUT_LEGENT_HEIGHT: number = 100;

// LayoutInfoEditor
export class LayoutInfoEditor {
    // parent
    private parent: HTMLDivElement = null;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    public layoutScale: number = 1.0;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // constructor
    constructor(parent: HTMLDivElement) {
        // setup parent
        this.parent = parent;
        // image parameters
        this.layoutInfo = null;
        this.layoutScale = 1.0;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.style.border = "1px solid orange";
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parent.appendChild(this.layoutCanvas);
    }

    // setLayoutInfo
    public setLayoutInfo(layoutInfo: LayoutInfo): void {
        // setup new image info
        if (this.layoutInfo != layoutInfo) {
            this.layoutInfo = layoutInfo;
            this.drawLayoutInfo();
        }
    }

    // drawLayoutInfo
    public drawLayoutInfo(): void {
        this.layoutCanvas.width = (this.layoutInfo.dataArrays.length + 1) * LAYOUT_COLUMN_WIDTH;
        this.layoutCanvas.height = this.layoutInfo.dataTable.data[0].values.length + LAYOUT_LEGENT_HEIGHT;
        this.clearCanvas();
        this.drawPlot(this.layoutInfo.dataTable.data[0], 0, LAYOUT_LEGENT_HEIGHT);
        this.layoutInfo.dataArrays.forEach((dataArray, index) => {
            this.drawLegend((index + 1) * LAYOUT_COLUMN_WIDTH, 0, dataArray.name + " (" + dataArray.unit + ")", dataArray.min, dataArray.max);
            this.drawPlot(dataArray, (index + 1) * LAYOUT_COLUMN_WIDTH, LAYOUT_LEGENT_HEIGHT);
        });
        this.layoutInfo.dataArrays.forEach((dataArray, index) => {

        });
    }

    // clearCanvas
    private clearCanvas() {
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, this.layoutCanvas.width, this.layoutCanvas.height);
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.closePath();
    }

    // drawLegend
    private drawLegend(x: number, y: number, name: string, min: number, max: number): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH;

        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, legendWidth, legendHeight);
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.rect(0, 0, legendWidth, legendHeight);
        this.layoutCanvasCtx.rect(0, legendHeight * 0.5, legendWidth * 0.5, legendHeight * 0.5);
        this.layoutCanvasCtx.rect(legendWidth * 0.5, legendHeight * 0.5, legendWidth, legendHeight * 0.5);
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "16px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(name, legendWidth * 0.5, legendHeight * 0.25);
        this.layoutCanvasCtx.fillText("min:" + min, legendWidth * 0.25, legendHeight * 0.75);
        this.layoutCanvasCtx.fillText("max:" + max, legendWidth * 0.75, legendHeight * 0.75);
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawLegend
    private drawPlot(dataArray: DataArray, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = "#000000";
        this.layoutCanvasCtx.moveTo((dataArray.values[0] - dataArray.min) / (dataArray.max - dataArray.min) * LAYOUT_COLUMN_WIDTH, 0);
        for (let i = 1; i < dataArray.values.length; i++) {
            let xPoint = (dataArray.values[i] - dataArray.min) / (dataArray.max - dataArray.min) * LAYOUT_COLUMN_WIDTH;
            let yPoint = i;
            this.layoutCanvasCtx.lineTo(xPoint, yPoint);
        }
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawYAxis
    private drawYAxis(dataArray: DataArray, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = "#FFFFFF";
        this.layoutCanvasCtx.moveTo((dataArray.values[0] - dataArray.min) / (dataArray.max - dataArray.min) * LAYOUT_COLUMN_WIDTH, 0);
        for (let i = 1; i < dataArray.values.length; i++) {
            let xPoint = (dataArray.values[i] - dataArray.min) / (dataArray.max - dataArray.min) * LAYOUT_COLUMN_WIDTH;
            let yPoint = i;
            this.layoutCanvasCtx.lineTo(xPoint, yPoint);
        }
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }
}
