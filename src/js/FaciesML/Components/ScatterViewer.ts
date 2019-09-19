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
    // selects
    private selectXAxis: HTMLSelectElement = null;
    private selectYAxis: HTMLSelectElement = null;
    private selectFacies: HTMLSelectElement = null;
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
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parentScatter.appendChild(this.layoutCanvas);
        
        // create header elements
        // legend sizes
        let legendWidth = LAYOUT_SCATTRER_SIZE - 2;
        // create header
        let divHeader = document.createElement("div");
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.display = "flex";
        divHeader.style.flexDirection = "column";
        this.parentHeadrs.appendChild(divHeader);

        // create axis header
        let divAxis = document.createElement("div");
        divAxis.style.display = "flex";
        divAxis.style.flexDirection = "row";
        divHeader.appendChild(divAxis);

        // create x-axis select
        let labelXAxis = document.createElement("div");
        labelXAxis.textContent = "X-Axis:";
        this.selectXAxis = document.createElement("select");
        this.selectXAxis.className = "select-axis";
        this.selectXAxis.onchange = this.onSelectXAxisChange.bind(this);
        // create y-axis select
        let labelYAxis = document.createElement("div");
        labelYAxis.textContent = "Y-Axis:";
        this.selectYAxis = document.createElement("select");
        this.selectYAxis.className = "select-axis";
        this.selectYAxis.onchange = this.onSelectYAxisChange.bind(this);
        // create color select
        let labelFacies = document.createElement("div");
        labelFacies.textContent = "Facies:";
        this.selectFacies = document.createElement("select");
        this.selectFacies.className = "select-axis";
        this.selectFacies.onchange = this.onSelectFaciesChange.bind(this);

        divAxis.appendChild(labelXAxis);
        divAxis.appendChild(this.selectXAxis);
        divAxis.appendChild(labelYAxis);
        divAxis.appendChild(this.selectYAxis);
        divAxis.appendChild(labelFacies);
        divAxis.appendChild(this.selectFacies);
    }

    // onSelectXAxisChange
    private onSelectXAxisChange() {
        let dataValues: DataValues = this.selectXAxis.children[this.selectXAxis.selectedIndex]["dataValue"];
        this.layoutInfo.scatterXAxis = dataValues;
        this.drawLayoutInfo();
    }

    // onSelectYAxisChange
    private onSelectYAxisChange() {
        let dataValues: DataValues = this.selectXAxis.children[this.selectYAxis.selectedIndex]["dataValue"];
        this.layoutInfo.scatterYAxis = dataValues;
        this.drawLayoutInfo();
    }

    // onSelectFaciesChange
    private onSelectFaciesChange() {
        let dataFacies = this.selectFacies.children[this.selectFacies.selectedIndex]["dataFacies"];
        this.layoutInfo.scatterColor = dataFacies;
        this.drawLayoutInfo();
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
        // clear childs
        while (this.selectXAxis.firstChild) this.selectXAxis.removeChild(this.selectXAxis.firstChild);
        while (this.selectYAxis.firstChild) this.selectYAxis.removeChild(this.selectYAxis.firstChild);
        while (this.selectFacies.firstChild) this.selectFacies.removeChild(this.selectFacies.firstChild);
    }

    // drawLayoutInfo
    public drawLayoutInfo(): void {
        if (!this.layoutInfo) return;
        this.updateHeader();
        this.drawScatter();
    }

    // updateHeader
    private updateHeader(): void {
        this.clearHeaders();
        // update x-axis select
        for(let dataValue of this.layoutInfo.dataTable.dataValues) {
            let option = document.createElement('option') as HTMLOptionElement;
            option.textContent = dataValue.name;
            option["dataValue"] = dataValue;
            option.selected = dataValue === this.layoutInfo.scatterXAxis;
            this.selectXAxis.appendChild(option);
        }
        // update y-axis select
        for(let dataValue of this.layoutInfo.dataTable.dataValues) {
            let option = document.createElement('option') as HTMLOptionElement;
            option.textContent = dataValue.name;
            option["dataValue"] = dataValue;
            option.selected = dataValue === this.layoutInfo.scatterYAxis;
            this.selectYAxis.appendChild(option);
        }
        // update facies select
        for(let dataFacies of this.layoutInfo.dataTable.dataFacies) {
            let option = document.createElement('option') as HTMLOptionElement;
            option.textContent = dataFacies.name;
            option["dataFacies"] = dataFacies;
            option.selected = dataFacies === this.layoutInfo.scatterColor;
            this.selectFacies.appendChild(option);
        }
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