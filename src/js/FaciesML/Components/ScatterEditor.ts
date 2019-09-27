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
    private buttonUndo: HTMLButtonElement = null;
    private buttonApply: HTMLButtonElement = null;
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

        // create header elements
        // legend sizes
        let legendWidth = LAYOUT_SCATTRER_SIZE - 2;
        // create header
        let divHeader = document.createElement("div");
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.display = "flex";
        divHeader.style.flexDirection = "column";
        this.parentHeadrs.appendChild(divHeader);
        // create axis div
        let divControls = document.createElement("div");
        divControls.style.display = "flex";
        divControls.style.flexDirection = "row-reverse";
        divHeader.appendChild(divControls);
        // button save type
        let buttonSaveImage = document.createElement("button");
        buttonSaveImage.innerText = "S";
        buttonSaveImage.onclick = (() => {
            this.saveToImage();
            this.drawLayoutInfo();
        }).bind(this);
        divControls.appendChild(buttonSaveImage);
        // button display type
        let buttonDisplayTypeX = document.createElement("button");
        buttonDisplayTypeX.innerText = "LX";
        buttonDisplayTypeX.onclick = (() => {
            if (this.displayTypeX === DisplayType.LINEAR)
                this.displayTypeX = DisplayType.LOG;
            else if (this.displayTypeX === DisplayType.LOG)
                this.displayTypeX = DisplayType.LINEAR;
            this.drawLayoutInfo();
        }).bind(this);
        divControls.appendChild(buttonDisplayTypeX);
        // button display type
        let buttonDisplayTypeY = document.createElement("button");
        buttonDisplayTypeY.innerText = "LY";
        buttonDisplayTypeY.onclick = (() => {
            if (this.displayTypeY === DisplayType.LINEAR)
                this.displayTypeY = DisplayType.LOG;
            else if (this.displayTypeY === DisplayType.LOG)
                this.displayTypeY = DisplayType.LINEAR;
            this.drawLayoutInfo();
        }).bind(this);
        divControls.appendChild(buttonDisplayTypeY);

        // create axis div
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

        // create axis div
        let divSamples = document.createElement("div");
        divSamples.style.display = "flex";
        divSamples.style.flexDirection = "row";
        divHeader.appendChild(divSamples);
        // create x-axis select
        let labelSamples = document.createElement("div");
        labelSamples.textContent = "Samples:";
        this.selectSamples = document.createElement("select");
        this.selectSamples.className = "select-axis";
        this.selectSamples.onchange = this.onSelectSamplesChange.bind(this);
        divSamples.appendChild(labelSamples);
        divSamples.appendChild(this.selectSamples);

        // create merge div
        let divMerge = document.createElement("div");
        divMerge.style.display = "flex";
        divMerge.style.flexDirection = "row";
        divHeader.appendChild(divMerge);
        // create undo button
        this.buttonUndo = document.createElement("button");
        this.buttonUndo.innerText = "Undo";
        this.buttonUndo.onclick = this.onButtonMergeUndoClick.bind(this);
        // create select from
        let labelFrom = document.createElement("div");
        labelFrom.textContent = "From:";
        this.selectFrom = document.createElement("select");
        this.selectFrom.className = "select-axis";
        // create select to
        let labelTo = document.createElement("div");
        labelTo.textContent = "To:";
        this.selectTo = document.createElement("select");
        this.selectTo.className = "select-axis";
        // create undo button
        this.buttonApply = document.createElement("button");
        this.buttonApply.innerText = "Apply";
        this.buttonApply.onclick = this.onButtonMergeApplyClick.bind(this);
        divMerge.appendChild(this.buttonUndo);
        divMerge.appendChild(labelFrom);
        divMerge.appendChild(this.selectFrom);
        divMerge.appendChild(labelTo);
        divMerge.appendChild(this.selectTo);
        divMerge.appendChild(this.buttonApply);
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
        while (this.selectXAxis.firstChild) this.selectXAxis.removeChild(this.selectXAxis.firstChild);
        while (this.selectYAxis.firstChild) this.selectYAxis.removeChild(this.selectYAxis.firstChild);
        while (this.selectFacies.firstChild) this.selectFacies.removeChild(this.selectFacies.firstChild);
        while (this.selectSamples.firstChild) this.selectSamples.removeChild(this.selectSamples.firstChild);
        while (this.selectFrom.firstChild) this.selectFrom.removeChild(this.selectFrom.firstChild);
        while (this.selectTo.firstChild) this.selectTo.removeChild(this.selectTo.firstChild);
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

        if (!this.layoutInfo.scatterColor) return;
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