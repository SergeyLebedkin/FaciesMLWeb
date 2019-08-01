import { DataTable } from "../Types/DataTable";
import { DataArray } from "../Types/DataArray";
import { LayoutInfo } from "../Types/LayoutInfo";

const LAYOUT_COLUMN_WIDTH: number = 256;
const LAYOUT_LEGENT_HEIGHT: number = 100;
const LAYOUT_AXES_HINT_STEP: number = 100;
const LAYOUT_AXES_HINT_LENGTH: number = 10;

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
        this.drawLegend(0, 0, 
            this.layoutInfo.dataTable.data[0].name + " (" + this.layoutInfo.dataTable.data[0].unit + ")",
            this.layoutInfo.dataTable.data[0].min,
            this.layoutInfo.dataTable.data[0].max);
        this.drawYAxis(this.layoutInfo.dataTable.data[0], 0, LAYOUT_LEGENT_HEIGHT);
        this.layoutInfo.dataArrays.forEach((dataArray, index) => {
            this.drawLegend((index + 1) * LAYOUT_COLUMN_WIDTH, 0, dataArray.name + " (" + dataArray.unit + ")", dataArray.min, dataArray.max);
            this.drawGrid(dataArray, (index + 1) * LAYOUT_COLUMN_WIDTH, LAYOUT_LEGENT_HEIGHT);
            this.drawPlot(dataArray, (index + 1) * LAYOUT_COLUMN_WIDTH, LAYOUT_LEGENT_HEIGHT, gColorTable[index]);
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
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(name, legendWidth * 0.5, legendHeight * 0.25);
        this.layoutCanvasCtx.fillText("min:" + min, legendWidth * 0.25, legendHeight * 0.75);
        this.layoutCanvasCtx.fillText("max:" + max, legendWidth * 0.75, legendHeight * 0.75);
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawLegend
    private drawPlot(dataArray: DataArray, x: number, y: number, color: string): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.strokeStyle = "#FFFFFF";
        this.layoutCanvasCtx.strokeRect(0, 0, LAYOUT_COLUMN_WIDTH, dataArray.values.length);
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 2;
        this.layoutCanvasCtx.strokeStyle = color;
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
        this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
        for (let i = LAYOUT_AXES_HINT_STEP; i < dataArray.values.length; i += LAYOUT_AXES_HINT_STEP) {
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "24px Arial";
            this.layoutCanvasCtx.strokeStyle = "BBBBBB";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.fillText(dataArray.values[i].toString(), LAYOUT_COLUMN_WIDTH * 0.5, i);
            this.layoutCanvasCtx.moveTo(0, i);
            this.layoutCanvasCtx.lineTo(0 + LAYOUT_AXES_HINT_LENGTH, i);
            this.layoutCanvasCtx.moveTo(LAYOUT_COLUMN_WIDTH - LAYOUT_AXES_HINT_LENGTH, i);
            this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, i);
        }
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawGrid
    private drawGrid(dataArray: DataArray, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
        this.layoutCanvasCtx.moveTo(0, 0);
        this.layoutCanvasCtx.lineTo(0, dataArray.values.length);
        this.layoutCanvasCtx.moveTo(LAYOUT_COLUMN_WIDTH, 0);
        this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, dataArray.values.length);
        for (let i = LAYOUT_AXES_HINT_STEP; i < dataArray.values.length; i += LAYOUT_AXES_HINT_STEP) {
            this.layoutCanvasCtx.moveTo(0, i);
            this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, i);
        }
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }
}

let gColorTable: string[] = [
    "blue", "red", "green", "orange",
    "#B0187B","#8B7DA3", "#A545BB","#C7A248",
    "#39F992","#324CF7", "#D04D5E","#1E88E6",
    "#92BFB3","#858D1A", "#92E877","#1FDFD9",
    "#DD7488","#9DACBB", "#934591","#FC9AA4",
];