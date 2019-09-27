import { LayoutInfo } from "../Types/LayoutInfo";
import { DataValues } from "../Types/DataValues";
import { DisplayType } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";

const LAYOUT_SCATTRER_SIZE: number = 600;
const LAYOUT_SCATTRER_PENDING: number = 40;

// ScatterEditor
export class ScatterEditor {
    // parents
    private parentHeadrs: HTMLDivElement;
    private parentScatter: HTMLDivElement;
    // axis selects
    private selectXAxis: HTMLSelectElement = null;
    private selectYAxis: HTMLSelectElement = null;
    private selectFacies: HTMLSelectElement = null;
    private selectSamples: HTMLSelectElement = null;
    // merge controls
    private selectFrom: HTMLSelectElement = null;
    private selectTo: HTMLSelectElement = null;
    // display type
    private displayTypeX: DisplayType = DisplayType.LINEAR;
    private displayTypeY: DisplayType = DisplayType.LINEAR;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // events
    public onFaciesMerged: (this: ScatterEditor, dataFacies: DataFacies) => any = null;
    // constructor
    constructor(parentHeadrs: HTMLDivElement, parentScatter: HTMLDivElement) {
        // setup parent
        this.parentHeadrs = parentHeadrs;
        this.parentScatter = parentScatter;
        // image parameters
        this.layoutInfo = null;
        // display type
        this.displayTypeX = DisplayType.LINEAR;
        this.displayTypeY = DisplayType.LINEAR;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parentScatter.appendChild(this.layoutCanvas);
        // create header markup
        this.parentHeadrs.innerHTML = `
        <div style="display: flex; flex-direction: column;">
            <div style="display: flex; flex-direction: row;">
                <button id="buttonSaveImage">S</button>
                <button id="buttonDisplayTypeX">LX</button>
                <button id="buttonDisplayTypeY">LY</button>
            </div>
            <div><hr></div>
            <div style="display: flex; flex-direction: row;">
                <label class="select-label">X-Axis:</label>
                <select class="select-axis" id="selectXAxis"></select>
                <label class="select-label">Y-Axis:</label>
                <select class="select-axis" id="selectYAxis"></select>
                <label class="select-label">Facies:</label>
                <select class="select-axis" id="selectFacies"></select>
                <label class="select-label">Samples:</label>
                <select id="selectSamples"></select>
            </div>
            <div><hr></div>
            <div style="display: flex; flex-direction: row;">
                <button id="buttonUndo">Undo</button>
                <label>From:</label>
                <select id="selectFrom"></select>
                <label>To:</label>
                <select id="selectTo"></select>
                <button id="buttonApply">Apply</button>
            </div>
            <div><hr></div>
        </div>`;

        // get elements IDs
        let buttonSaveImage: HTMLButtonElement = document.getElementById("buttonSaveImage") as HTMLButtonElement;
        let buttonDisplayTypeX: HTMLButtonElement = document.getElementById("buttonDisplayTypeX") as HTMLButtonElement;
        let buttonDisplayTypeY: HTMLButtonElement = document.getElementById("buttonDisplayTypeY") as HTMLButtonElement;
        this.selectXAxis = document.getElementById("selectXAxis") as HTMLSelectElement;
        this.selectYAxis = document.getElementById("selectYAxis") as HTMLSelectElement;
        this.selectFacies = document.getElementById("selectFacies") as HTMLSelectElement;
        this.selectSamples = document.getElementById("selectSamples") as HTMLSelectElement;
        this.selectFrom = document.getElementById("selectFrom") as HTMLSelectElement;
        this.selectTo = document.getElementById("selectTo") as HTMLSelectElement;
        let buttonUndo: HTMLButtonElement = document.getElementById("buttonUndo") as HTMLButtonElement;
        let buttonApply: HTMLButtonElement = document.getElementById("buttonApply") as HTMLButtonElement;

        // get elements events
        buttonSaveImage.onclick = (() => { this.saveToImage(); this.drawLayoutInfo(); }).bind(this);
        buttonDisplayTypeX.onclick = this.onButtonDisplayTypeXClick.bind(this);
        buttonDisplayTypeY.onclick = this.onButtonDisplayTypeYClick.bind(this);
        this.selectXAxis.onchange = this.onSelectXAxisChange.bind(this);
        this.selectYAxis.onchange = this.onSelectYAxisChange.bind(this);
        this.selectFacies.onchange = this.onSelectFaciesChange.bind(this);
        this.selectSamples.onchange = this.onSelectSamplesChange.bind(this);
        buttonUndo.onclick = this.onButtonMergeUndoClick.bind(this);
        buttonApply.onclick = this.onButtonMergeApplyClick.bind(this);
    }

    // onButtonDisplayTypeXClick
    private onButtonDisplayTypeXClick() {
        if (this.displayTypeX === DisplayType.LINEAR)
            this.displayTypeX = DisplayType.LOG;
        else if (this.displayTypeX === DisplayType.LOG)
            this.displayTypeX = DisplayType.LINEAR;
        this.drawLayoutInfo();
    }

    // onButtonDisplayTypeYClick
    private onButtonDisplayTypeYClick() {
        if (this.displayTypeY === DisplayType.LINEAR)
            this.displayTypeY = DisplayType.LOG;
        else if (this.displayTypeY === DisplayType.LOG)
            this.displayTypeY = DisplayType.LINEAR;
        this.drawLayoutInfo();
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
        this.layoutInfo.scatterSamples = dataFacies.dataSamples[0];
        this.drawLayoutInfo();
    }

    // onSelectSamplesChange
    private onSelectSamplesChange() {
        let dataSamples = this.selectSamples.children[this.selectSamples.selectedIndex]["dataSamples"];
        this.layoutInfo.scatterSamples = dataSamples;
        this.drawLayoutInfo();
    }

    // onButtonMergeUndoClick
    private onButtonMergeUndoClick() {
        this.layoutInfo.scatterColor.removeLastMergePair();
        this.drawLayoutInfo();
        this.onFaciesMerged && this.onFaciesMerged(this.layoutInfo.scatterColor);
    }

    // onButtonMergeApply
    private onButtonMergeApplyClick() {
        if ((this.selectFrom.selectedIndex < 0) || (this.selectTo.selectedIndex < 0)) return;
        if (this.selectFrom.value === this.selectTo.value) return;
        this.layoutInfo.scatterColor.addMergePair(parseInt(this.selectFrom.value), parseInt(this.selectTo.value));
        this.drawLayoutInfo();
        this.onFaciesMerged && this.onFaciesMerged(this.layoutInfo.scatterColor);
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
        clearChilds(this.selectXAxis);
        clearChilds(this.selectYAxis);
        clearChilds(this.selectFacies);
        clearChilds(this.selectSamples);
        clearChilds(this.selectFrom);
        clearChilds(this.selectTo);
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
        for (let dataValue of this.layoutInfo.dataTable.dataValues) {
            let option = document.createElement('option') as HTMLOptionElement;
            option.textContent = dataValue.name;
            option["dataValue"] = dataValue;
            option.selected = dataValue === this.layoutInfo.scatterXAxis;
            this.selectXAxis.appendChild(option);
        }
        // update y-axis select
        for (let dataValue of this.layoutInfo.dataTable.dataValues) {
            let option = document.createElement('option') as HTMLOptionElement;
            option.textContent = dataValue.name;
            option["dataValue"] = dataValue;
            option.selected = dataValue === this.layoutInfo.scatterYAxis;
            this.selectYAxis.appendChild(option);
        }
        // update facies select
        for (let dataFacies of this.layoutInfo.dataTable.dataFacies) {
            let option = document.createElement('option') as HTMLOptionElement;
            option.textContent = dataFacies.name;
            option["dataFacies"] = dataFacies;
            option.selected = dataFacies === this.layoutInfo.scatterColor;
            this.selectFacies.appendChild(option);
        }
        // update samples select
        if (this.layoutInfo.scatterColor) {
            for (let dataSamples of this.layoutInfo.scatterColor.dataSamples) {
                let option = document.createElement('option') as HTMLOptionElement;
                option.textContent = dataSamples.name;
                option["dataSamples"] = dataSamples;
                option.selected = dataSamples === this.layoutInfo.scatterSamples;
                this.selectSamples.appendChild(option);
            }
        }
        // update merge selects
        if (this.layoutInfo.scatterColor) {
            let indexArray = [];
            this.layoutInfo.scatterColor.valuesAvailable.forEach(value => indexArray.push(value));
            indexArray.sort();
            // update from select
            for (let value of indexArray) {
                let option = document.createElement('option') as HTMLOptionElement;
                option.textContent = value.toString();
                option.value = value.toString();
                option.style.background = this.layoutInfo.scatterColor.colorTable[value];
                this.selectFrom.appendChild(option);
            };
            // update to select
            for (let value of indexArray) {
                let option = document.createElement('option') as HTMLOptionElement;
                option.textContent = value.toString();
                option.value = value.toString();
                option.style.background = this.layoutInfo.scatterColor.colorTable[value];
                this.selectTo.appendChild(option);
            };
        }
    }

    // drawScatter
    private drawScatter(): void {
        let scatterHeight = LAYOUT_SCATTRER_SIZE;
        let scatterWidth = LAYOUT_SCATTRER_SIZE;
        let scatterPadding = LAYOUT_SCATTRER_PENDING;
        this.layoutCanvas.height = scatterHeight;
        this.layoutCanvas.width = scatterWidth;
        // clear scatter
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, scatterWidth, scatterHeight);
        this.layoutCanvasCtx.stroke();
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
        if (!this.layoutInfo.scatterXAxis) return;
        if (!this.layoutInfo.scatterYAxis) return;
        // draw facies name
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(this.layoutInfo.scatterColor.name, scatterWidth / 2, scatterPadding / 2);
        // draw X-axis name
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

        // draw X-Axis grid
        if (this.displayTypeX === DisplayType.LINEAR) {
            this.drawLinearAxisX(5);
            this.drawLinearLegendX(5, this.layoutInfo.scatterXAxis.min, this.layoutInfo.scatterXAxis.max)
        } else if (this.displayTypeX === DisplayType.LOG) {
            this.drawLogAxisX(Math.floor(Math.log10(this.layoutInfo.scatterXAxis.max)) + 1);
            this.drawLogLegendX(Math.floor(Math.log10(this.layoutInfo.scatterXAxis.max)) + 1);
        }

        // draw Y-Axis grid
        if (this.displayTypeY === DisplayType.LINEAR) {
            this.drawLinearAxisY(5);
            this.drawLinearLegendY(5, this.layoutInfo.scatterYAxis.min, this.layoutInfo.scatterYAxis.max)
        } else if (this.displayTypeY === DisplayType.LOG) {
            this.drawLogAxisY(Math.floor(Math.log10(this.layoutInfo.scatterYAxis.max)) + 1);
            this.drawLogLegendY(Math.floor(Math.log10(this.layoutInfo.scatterYAxis.max)) + 1);
        }

        // draw scatter grid
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.rect(scatterPadding, scatterPadding, scatterWidth - scatterPadding * 2, scatterHeight - scatterPadding * 2);
        this.layoutCanvasCtx.stroke();
        // draw values
        this.drawValues();
        this.drawSamples();
    }

    // drawLinearAxisX
    private drawLinearAxisX(numSections: number) {
        // x-axis
        this.layoutCanvasCtx.strokeStyle = "#DDDDDD";
        for (let i = 0; i <= numSections; i++) {
            // get coords
            let xPoint = i / numSections;
            // draw line
            let x = this.transfomX(xPoint);
            let y0 = this.transfomY(0.0);
            let y1 = this.transfomY(1.0);
            this.layoutCanvasCtx.moveTo(x, y0);
            this.layoutCanvasCtx.lineTo(x, y1);
            this.layoutCanvasCtx.stroke();
        }
    }

    // drawLinearAxisX
    private drawLinearLegendX(numSections: number, min: number, max: number): void {
        // x-axis legend
        this.layoutCanvasCtx.textBaseline = "top";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "10px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        for (let i = 0; i <= numSections; i++) {
            // get coords
            let xPoint = i / numSections;
            let yPoint = 0;
            // draw text
            let x = this.transfomX(xPoint);
            let y = this.transfomY(yPoint);
            // get text
            let value = lerp(min, max, i / numSections);
            this.layoutCanvasCtx.fillText(value.toFixed(2).toString(), x, y);
        }
    }

    // drawLogAxisX
    private drawLogAxisX(numSections: number): void {
        this.layoutCanvasCtx.strokeStyle = "#DDDDDD";
        for (let i = 0; i < numSections; i++) {
            for (let j = 0; j < 10; j++) {
                // get coords
                let xPoint = Math.pow(10, i) * j;
                xPoint = Math.log10(xPoint) / numSections;
                // draw line
                let x = this.transfomX(xPoint);
                let y0 = this.transfomY(0.0);
                let y1 = this.transfomY(1.0);
                this.layoutCanvasCtx.moveTo(x, y0);
                this.layoutCanvasCtx.lineTo(x, y1);
                this.layoutCanvasCtx.stroke();
            }
        }
    }

    // drawLinearAxisX
    private drawLogLegendX(numSections: number): void {
        // x-axis legend
        this.layoutCanvasCtx.textBaseline = "top";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "10px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        for (let i = 0; i <= numSections; i++) {
            // get coords
            let xPoint = i / numSections;
            let yPoint = 0;
            // draw text
            let x = this.transfomX(xPoint);
            let y = this.transfomY(yPoint);
            // get text
            this.layoutCanvasCtx.fillText(Math.pow(10, i).toString(), x, y);
        }
    }

    // drawLinearAxisY
    private drawLinearAxisY(numSections: number): void {
        this.layoutCanvasCtx.strokeStyle = "#DDDDDD";
        for (let i = 0; i <= numSections; i++) {
            // get coord
            let yPoint = i / numSections;
            // draw line
            let x0 = this.transfomX(0.0);
            let x1 = this.transfomX(1.0);
            let y = this.transfomY(yPoint);
            this.layoutCanvasCtx.moveTo(x0, y);
            this.layoutCanvasCtx.lineTo(x1, y);
            this.layoutCanvasCtx.stroke();
        }
    }

    // drawLinearLegendY
    private drawLinearLegendY(numSections: number, min: number, max: number): void {
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "right";
        this.layoutCanvasCtx.font = "10px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        for (let i = 0; i <= numSections; i++) {
            // get coords
            let xPoint = 0;
            let yPoint = i / numSections;
            // draw text
            let x = this.transfomX(xPoint);
            let y = this.transfomY(yPoint);
            let value = lerp(min, max, i / numSections);
            this.layoutCanvasCtx.fillText(value.toFixed(2).toString(), x, y);
        }
    }

    // drawLogAxisY
    private drawLogAxisY(numSections: number): void {
        // y-axis
        this.layoutCanvasCtx.strokeStyle = "#DDDDDD";
        for (let i = 0; i < numSections; i++) {
            for (let j = 1; j <= 10; j++) {
                // get coord
                let yPoint = Math.pow(10, i) * j;
                yPoint = Math.log10(yPoint) / numSections;
                // draw line
                let x0 = this.transfomX(0.0);
                let x1 = this.transfomX(1.0);
                let y = this.transfomY(yPoint);
                this.layoutCanvasCtx.moveTo(x0, y);
                this.layoutCanvasCtx.lineTo(x1, y);
                this.layoutCanvasCtx.stroke();
            }
        }
    }

    // drawLogLegendY
    private drawLogLegendY(numSections: number): void {
        // y-axis legend
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "right";
        this.layoutCanvasCtx.font = "10px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        for (let i = 0; i <= numSections; i++) {
            // get coords
            let xPoint = 0;
            let yPoint = i / numSections;
            // draw text
            let x = this.transfomX(xPoint);
            let y = this.transfomY(yPoint);
            this.layoutCanvasCtx.fillText(Math.pow(10, i).toString(), x, y);
        }
    }

    // drawValues
    private drawValues(): void {
        if (!this.layoutInfo.scatterXAxis) return;
        if (!this.layoutInfo.scatterYAxis) return;
        if (!this.layoutInfo.scatterColor) return;
        // draw values
        for (let i = 0; i < this.layoutInfo.scatterXAxis.values.length; i++) {
            // get coords
            let xPoint = this.layoutInfo.scatterXAxis.values[i];
            let yPoint = this.layoutInfo.scatterYAxis.values[i];
            // get x point
            if (this.displayTypeX === DisplayType.LINEAR) {
                xPoint = (xPoint - this.layoutInfo.scatterXAxis.min) / (this.layoutInfo.scatterXAxis.max - this.layoutInfo.scatterXAxis.min);
            } else if (this.displayTypeX === DisplayType.LOG) {
                let numSectionsX = Math.floor(Math.log10(this.layoutInfo.scatterXAxis.max)) + 1;
                xPoint = Math.log10(xPoint) / numSectionsX;
                xPoint = Math.min(1.0, Math.max(0.0, xPoint));
            }
            // get y point
            if (this.displayTypeY === DisplayType.LINEAR) {
                yPoint = (yPoint - this.layoutInfo.scatterYAxis.min) / (this.layoutInfo.scatterYAxis.max - this.layoutInfo.scatterYAxis.min);
            } else if (this.displayTypeY === DisplayType.LOG) {
                let numSectionsY = Math.floor(Math.log10(this.layoutInfo.scatterYAxis.max)) + 1;
                yPoint = Math.log10(yPoint) / numSectionsY;
                yPoint = Math.min(1.0, Math.max(0.0, yPoint));
            }
            // draw circle
            let x = this.transfomX(xPoint);
            let y = this.transfomY(yPoint);
            this.layoutCanvasCtx.beginPath();
            this.layoutCanvasCtx.arc(x, y, 3, 0, 2 * Math.PI, false);
            this.layoutCanvasCtx.fillStyle = this.layoutInfo.scatterColor.colorTable[this.layoutInfo.scatterColor.valuesDisplay[i]];
            this.layoutCanvasCtx.fill();
            this.layoutCanvasCtx.lineWidth = 1;
            this.layoutCanvasCtx.strokeStyle = this.layoutInfo.scatterColor.colorTable[this.layoutInfo.scatterColor.valuesDisplay[i]];
            this.layoutCanvasCtx.stroke();
        }
    }

    // drawSamples
    private drawSamples(): void {
        if (!this.layoutInfo.scatterXAxis) return;
        if (!this.layoutInfo.scatterYAxis) return;
        if (!this.layoutInfo.scatterColor) return;
        if (!this.layoutInfo.scatterSamples) return;
        // draw samples
        for (let i = 0; i < this.layoutInfo.scatterSamples.values.length; i++) {
            if (this.layoutInfo.scatterSamples.values[i] > 0) {
                // get coords
                let xPoint = this.layoutInfo.scatterXAxis.values[i];
                let yPoint = this.layoutInfo.scatterYAxis.values[i];
                // get x point
                if (this.displayTypeX === DisplayType.LINEAR) {
                    xPoint = (xPoint - this.layoutInfo.scatterXAxis.min) / (this.layoutInfo.scatterXAxis.max - this.layoutInfo.scatterXAxis.min);
                } else if (this.displayTypeX === DisplayType.LOG) {
                    let numSectionsX = Math.floor(Math.log10(this.layoutInfo.scatterXAxis.max)) + 1;
                    xPoint = Math.log10(xPoint) / numSectionsX;
                    xPoint = Math.min(1.0, Math.max(0.0, xPoint));
                }
                // get y point
                if (this.displayTypeY === DisplayType.LINEAR) {
                    yPoint = (yPoint - this.layoutInfo.scatterYAxis.min) / (this.layoutInfo.scatterYAxis.max - this.layoutInfo.scatterYAxis.min);
                } else if (this.displayTypeY === DisplayType.LOG) {
                    let numSectionsY = Math.floor(Math.log10(this.layoutInfo.scatterYAxis.max)) + 1;
                    yPoint = Math.log10(yPoint) / numSectionsY;
                    yPoint = Math.min(1.0, Math.max(0.0, yPoint));
                }
                // draw circle
                let x = this.transfomX(xPoint);
                let y = this.transfomY(yPoint);
                this.layoutCanvasCtx.beginPath();
                this.layoutCanvasCtx.fillStyle = this.layoutInfo.scatterColor.colorTable[this.layoutInfo.scatterColor.valuesDisplay[i]];
                this.layoutCanvasCtx.fillRect(x, y, 4, 4);
                this.layoutCanvasCtx.strokeStyle = "black";
                this.layoutCanvasCtx.rect(x, y, 4, 4);
                this.layoutCanvasCtx.stroke();
            }
        }
    }

    // transfomX
    private transfomX(x: number): number {
        return Math.floor(x * (LAYOUT_SCATTRER_SIZE - LAYOUT_SCATTRER_PENDING * 2) + LAYOUT_SCATTRER_PENDING);
    }

    // transfomY
    private transfomY(y: number): number {
        return Math.floor((1.0 - y) * (LAYOUT_SCATTRER_SIZE - LAYOUT_SCATTRER_PENDING * 2) + LAYOUT_SCATTRER_PENDING);
    }

    // saveToImage
    saveToImage(): void {
        if (!this.layoutInfo) return;
        downloadImage(this.layoutInfo.scatterColor.name, this.layoutCanvas);
    }
}

// lerp
function lerp(a: number, b: number, t: number) {
    return a * (t - 1) + b * t;
}

// downloadImage
function downloadImage(name: string, canvas: HTMLCanvasElement) {
    var link = document.createElement('a');
    link.download = name + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

// clearChilds
function clearChilds(element: HTMLElement) {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}