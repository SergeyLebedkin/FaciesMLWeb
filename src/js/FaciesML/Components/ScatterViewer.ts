import { LayoutInfo } from "../Types/LayoutInfo";
import { DataValues } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";

const LAYOUT_SCATTRER_SIZE: number = 600;

// ScatterViewer
export class ScatterViewer {
    // parents
    private parentHeadrs: HTMLDivElement;
    private parentScatter: HTMLDivElement;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // constructor
    constructor(parentHeadrs: HTMLDivElement, parentScatter: HTMLDivElement) {
        // setup parent
        this.parentHeadrs = parentHeadrs;
        this.parentScatter = parentScatter;
        // image parameters
        this.layoutInfo = null;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        //this.layoutCanvas.onmouseup = this.onMouseUp.bind(this);
        //this.layoutCanvas.onmousemove = this.onMouseMove.bind(this);
        //this.layoutCanvas.onmousedown = this.onMouseDown.bind(this);
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parentScatter.appendChild(this.layoutCanvas);
    }

    // setLayoutInfo
    public setLayoutInfo(layoutInfo: LayoutInfo): void {
        // setup new image info
        if (this.layoutInfo != layoutInfo) {
            this.layoutInfo = layoutInfo;
            this.drawLayoutInfo();
        }
    }

    // clearHeaders
    private clearHeaders() {
        if (!this.parentHeadrs) return;
        while (this.parentHeadrs.firstChild)
            this.parentHeadrs.removeChild(this.parentHeadrs.firstChild);
    }

    // drawLayoutInfo
    public drawLayoutInfo(): void {
        if (!this.layoutInfo) return;
        this.clearHeaders();
        this.addHeader();
        this.drawScatter();
    }

    // addScatterHeader
    private addHeader(): void {
        // legend sizes
        let legendWidth = LAYOUT_SCATTRER_SIZE - 2;
        // create header
        let divHeader = document.createElement("div");
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.display = "flex";
        divHeader.style.flexDirection = "column";
        this.parentHeadrs.appendChild(divHeader);
        // create header name
        let divHeaderName = document.createElement("div");
        divHeaderName.style.width = legendWidth.toString() + "px";
        divHeaderName.style.textAlign = "center";
        divHeaderName.innerText = this.layoutInfo.scatterColor ? this.layoutInfo.scatterColor.name : "";
        divHeader.appendChild(divHeaderName);
    }

    // drawScatter
    private drawScatter(): void {
        let scatterHeight = LAYOUT_SCATTRER_SIZE;
        let scatterWidth = LAYOUT_SCATTRER_SIZE;
        let scatterPadding = 40;
        this.layoutCanvas.height = scatterHeight;
        this.layoutCanvas.width = scatterWidth;
        // draw some data
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, scatterWidth, scatterHeight);
        this.layoutCanvasCtx.stroke();
        // draw scatter grid
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.rect(scatterPadding, scatterPadding, scatterWidth - scatterPadding * 2, scatterHeight - scatterPadding * 2);
        this.layoutCanvasCtx.stroke();
        // draw X-axis
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(this.layoutInfo.scatterXAxis.name, scatterWidth / 2, scatterHeight - scatterPadding / 2);
        // draw Y-axis name
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.translate(scatterPadding / 2, scatterHeight / 2);
        this.layoutCanvasCtx.rotate(-Math.PI / 2);
        this.layoutCanvasCtx.fillText(this.layoutInfo.scatterYAxis.name, 0, 0);
        this.layoutCanvasCtx.resetTransform();
        if (!this.layoutInfo.scatterColor) {
            // draw X-axis
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "14px Arial";
            this.layoutCanvasCtx.strokeStyle = "black";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.fillText("Select Facies", scatterWidth / 2, scatterHeight / 2);
            return;
        }
        // draw values
        for (let i = 0; i < this.layoutInfo.scatterXAxis.values.length; i++) {
            let x = (this.layoutInfo.scatterXAxis.values[i] - this.layoutInfo.scatterXAxis.min) / (this.layoutInfo.scatterXAxis.max - this.layoutInfo.scatterXAxis.min);
            let y = (this.layoutInfo.scatterYAxis.values[i] - this.layoutInfo.scatterYAxis.min) / (this.layoutInfo.scatterYAxis.max - this.layoutInfo.scatterYAxis.min);
            x = x * (scatterWidth - scatterPadding * 2) + scatterPadding;
            y = y * (scatterHeight - scatterPadding * 2) + scatterPadding;
            y = scatterHeight - y;
            this.layoutCanvasCtx.beginPath();
            this.layoutCanvasCtx.arc(x, y, 3, 0, 2 * Math.PI, false);
            this.layoutCanvasCtx.fillStyle = this.layoutInfo.scatterColor.colorTable[this.layoutInfo.scatterColor.values[i]];
            this.layoutCanvasCtx.fill();
            this.layoutCanvasCtx.lineWidth = 1;
            this.layoutCanvasCtx.strokeStyle = this.layoutInfo.scatterColor.colorTable[this.layoutInfo.scatterColor.values[i]];
            this.layoutCanvasCtx.stroke();
        }
    }
}