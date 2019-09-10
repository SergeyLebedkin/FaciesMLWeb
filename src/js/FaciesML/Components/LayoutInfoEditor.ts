import { LayoutInfo } from "../Types/LayoutInfo";
import { SelectionMode } from "../Types/SelectionMode";
import { DataValues, DATA_MINIMAL_VALUE, DisplayType } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";

const LAYOUT_HEADER_HEIGHT: number = 30;
const LAYOUT_LEGENT_HEIGHT: number = 0;
const LAYOUT_COLUMN_WIDTH: number = 150;
const LAYOUT_AXES_HINT_STEP: number = 100;
const LAYOUT_AXES_HINT_LENGTH: number = 30;

// LayoutInfoEditor
export class LayoutInfoEditor {
    // parents
    private parentTitle: HTMLDivElement;
    private parentHeadrs: HTMLDivElement;
    private parentPlots: HTMLDivElement;
    private enabled: boolean = true;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    public scale: number = 1.0;
    // selection
    private selectionStarted: boolean = false;
    private selectionMode: SelectionMode = SelectionMode.ADD;
    private selectionStart: number = null;
    private selectionEnd: number = null;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // constructor
    constructor(parentTitle: HTMLDivElement, parentHeadrs: HTMLDivElement, parentPlots: HTMLDivElement) {
        // setup parent
        this.parentTitle = parentTitle;
        this.parentHeadrs = parentHeadrs;
        this.parentPlots = parentPlots;
        this.enabled = true;
        // image parameters
        this.layoutInfo = null;
        this.scale = 1.0;
        // selection
        this.selectionStarted = false;
        this.selectionMode = SelectionMode.ADD;
        this.selectionStart = 0;
        this.selectionEnd = 0;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.onmouseup = this.onMouseUp.bind(this);
        this.layoutCanvas.onmousemove = this.onMouseMove.bind(this);
        this.layoutCanvas.onmousedown = this.onMouseDown.bind(this);
        this.layoutCanvas.style.cursor = "row-resize";
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parentPlots.appendChild(this.layoutCanvas);
    }

    // onMouseUp
    public onMouseUp(event: MouseEvent): void {
        // proceed selection
        if (this.selectionStarted) {
            // normalize
            this.selectionStart = Math.max(this.selectionStart, 0);
            this.selectionStart = Math.min(this.selectionStart, this.layoutInfo.dataTable.dataValues[0].values.length - 1);
            this.selectionEnd = Math.max(this.selectionEnd, 0);
            this.selectionEnd = Math.min(this.selectionEnd, this.layoutInfo.dataTable.dataValues[0].values.length - 1);
            if (this.selectionStart > this.selectionEnd)
                [this.selectionStart, this.selectionEnd] = [this.selectionEnd, this.selectionStart];
            // fill selections array
            if (this.selectionMode === SelectionMode.ADD) {
                this.layoutInfo.dataTable.selections.fill(1, this.selectionStart, this.selectionEnd);
            } else if (this.selectionMode === SelectionMode.REMOVE) {
                this.layoutInfo.dataTable.selections.fill(0, this.selectionStart, this.selectionEnd);
            }
            this.selectionStarted = false;
            // redraw stuff
            this.drawLayoutInfo();
        }
    }

    // onMouseMove
    public onMouseMove(event: MouseEvent): void {
        // update selection region info
        if (this.selectionStarted) {
            // get mouse coords
            let mouseCoords = getMousePosByElement(this.layoutCanvas, event);
            // update selection region width and height
            this.selectionEnd = mouseCoords.y / this.scale;
            // redraw stuff
            this.drawLayoutInfo();
            this.drawSelectionRange();
        }
    }

    // onMouseDown
    public onMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return;
        if (!this.enabled) return;
        if (this.layoutInfo !== null) {
            // get mouse coords
            let mouseCoords = getMousePosByElement(this.layoutCanvas, event);
            // start selection
            this.selectionStarted = true;
            // check selection mode and set color
            this.selectionStart = mouseCoords.y / this.scale;
            this.selectionEnd = mouseCoords.y / this.scale;
            event.preventDefault();
        };
    }

    // setEnabled
    public setEnabled(enable: boolean) {
        if (this.enabled !== enable)
            this.enabled = enable;
        if (this.enabled)
            this.layoutCanvas.style.cursor = "row-resize";
        else
            this.layoutCanvas.style.cursor = "auto";
    }

    // setLayoutInfo
    public setLayoutInfo(layoutInfo: LayoutInfo): void {
        // setup new image info
        if (this.layoutInfo != layoutInfo) {
            this.layoutInfo = layoutInfo;
            this.drawLayoutInfo();
        }
    }

    // setSelectionMode
    public setSelectionMode(selectionMode: SelectionMode): void {
        this.selectionMode = selectionMode;
        this.drawLayoutInfo();
    }

    // setScale
    public setScale(scale: number): void {
        if (this.scale !== scale) {
            this.scale = scale;
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
        this.parentTitle.innerText = this.layoutInfo.dataTable.name;
        let columsCount = this.layoutInfo.dataTable.getSelectedCount();
        this.layoutCanvas.width = (columsCount + 1) * LAYOUT_COLUMN_WIDTH;
        this.layoutCanvas.height = (this.layoutInfo.dataTable.dataValues[0].values.length) * this.scale;
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.clearHeaders();
        this.clearCanvas();
        // draw data ranges
        this.drawLayoutInfoSelections(0);
        // draw depth
        this.addHeaderBase(this.layoutInfo.dataTable.dataValues[0]);
        this.drawYAxis(this.layoutInfo.dataTable.dataValues[0], 0, 0);
        // draw selected data values
        let columnIndex = 1;
        for (let dataValues of this.layoutInfo.dataTable.dataValues) {
            if (dataValues.selected) {
                this.addHeader(dataValues);
                this.drawGrid(dataValues, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                this.drawPlot(dataValues, columnIndex * LAYOUT_COLUMN_WIDTH, 0, gColorTable[columnIndex]);
                columnIndex++;
            }
        }
        // draw selected datafacies
        for (let dataFacies of this.layoutInfo.dataTable.dataFacies) {
            if (dataFacies.selected) {
                this.addHeaderFacie(dataFacies.name);
                this.drawFacies(dataFacies, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                columnIndex++;
            }
            // add samples
            for (let dataSamples of dataFacies.dataSamples) {
                if (dataSamples.selected) {
                    this.addHeaderFacie(dataSamples.name);
                    this.drawGridFacies(dataSamples.values, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                    this.drawSamples(dataSamples, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                    columnIndex++;
                }
            }
        }
    }

    // drawSelectionRange
    private drawSelectionRange() {
        if (this.selectionStarted) {
            if (this.selectionMode === SelectionMode.ADD) {
                this.layoutCanvasCtx.globalAlpha = 0.85;
                this.layoutCanvasCtx.fillStyle = "#DDDDDD";
            } else if (this.selectionMode === SelectionMode.REMOVE) {
                this.layoutCanvasCtx.globalAlpha = 0.60;
                this.layoutCanvasCtx.fillStyle = "#DD0000";
            }
            this.layoutCanvasCtx.fillRect(0, this.selectionStart * this.scale, this.layoutCanvas.width, (this.selectionEnd - this.selectionStart) * this.scale);
            this.layoutCanvasCtx.globalAlpha = 1.0;
        }
    }

    // drawLayoutInfoSelections
    private drawLayoutInfoSelections(offsetY: number) {
        this.layoutCanvasCtx.globalAlpha = 0.8;
        this.layoutCanvasCtx.beginPath();
        for (let i = 0; i < this.layoutInfo.dataTable.selections.length; i++) {
            if (this.layoutInfo.dataTable.selections[i] > 0) {
                this.layoutCanvasCtx.globalAlpha = 1.0;
                this.layoutCanvasCtx.fillStyle = "#DDDDDD";
                this.layoutCanvasCtx.fillRect(0, i * this.scale, this.layoutCanvas.width, Math.max(1, this.scale));
                this.layoutCanvasCtx.stroke();
            }
        }
        this.layoutCanvasCtx.stroke();
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.globalAlpha = 1.0;
    }

    // clearCanvas
    private clearCanvas() {
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.globalAlpha = 1.0;
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, this.layoutCanvas.width, this.layoutCanvas.height);
        this.layoutCanvasCtx.stroke();
        // this.layoutCanvasCtx.closePath();
    }

    // addHeader
    private addHeader(dataValues: DataValues): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;
        // create header
        let divHeader = document.createElement("div");
        //divHeader.style.height = legendHeight.toString() + "px";
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.border = "1px solid black";
        divHeader.style.display = "flex";
        divHeader.style.flexDirection = "column";
        this.parentHeadrs.appendChild(divHeader);

        // create div controls
        let divControls = document.createElement("div");
        divControls.style.display = "flex";
        divControls.style.flexDirection = "row-reverse";
        divHeader.appendChild(divControls);

        // button display type
        let buttonDisplayType = document.createElement("button");
        buttonDisplayType.innerText = "L";
        buttonDisplayType.disabled = dataValues.min <= 0;
        buttonDisplayType["dataValues"] = dataValues;
        buttonDisplayType.onclick = (event => {
            let dataValues: DataValues = event.target["dataValues"] as DataValues;
            if (dataValues.displayType === DisplayType.LINEAR)
                dataValues.displayType = DisplayType.LOG;
            else if (dataValues.displayType === DisplayType.LOG)
                dataValues.displayType = DisplayType.LINEAR;
            this.drawLayoutInfo();
        }).bind(this);
        divControls.appendChild(buttonDisplayType);

        // create div header name
        let divHeaderName = document.createElement("div");
        divHeaderName.innerText = dataValues.name;
        divHeaderName.style.textAlign = "center";
        divHeaderName.style.borderBottom = "1px solid black";
        divHeader.appendChild(divHeaderName);

        // create div header minmax
        let divHeaderDisplayMinMax = document.createElement("div");
        divHeaderDisplayMinMax.style.display = "flex";
        divHeaderDisplayMinMax.style.flexDirection = "row";
        divHeader.appendChild(divHeaderDisplayMinMax);

        // create input header min
        let inputHeaderDisplayMin = document.createElement("input");
        inputHeaderDisplayMin.type = "text";
        inputHeaderDisplayMin.style.display = "block";
        inputHeaderDisplayMin.style.width = "100%";
        inputHeaderDisplayMin.style.textAlign = "center";
        inputHeaderDisplayMin.value = dataValues.displayMin.toFixed(2);
        inputHeaderDisplayMin["dataValues"] = dataValues;
        inputHeaderDisplayMin.onchange = ((event) => {
            let dataValues: DataValues = event.target["dataValues"] as DataValues;
            let newValue: number = event.target.value;
            dataValues.displayMin = Math.min(Math.max(newValue, dataValues.min), dataValues.displayMax);
            this.drawLayoutInfo();
        }).bind(this);
        divHeaderDisplayMinMax.appendChild(inputHeaderDisplayMin);

        // create value label
        // create div header name
        let divUnitName = document.createElement("div");
        divUnitName.innerText = dataValues.unit;
        divUnitName.style.textAlign = "center";
        divHeaderDisplayMinMax.appendChild(divUnitName);

        // create input header max
        let inputHeaderDisplayMax = document.createElement("input");
        inputHeaderDisplayMax.type = "text";
        inputHeaderDisplayMax.style.display = "block";
        inputHeaderDisplayMax.style.width = "100%";
        inputHeaderDisplayMax.style.textAlign = "center";
        inputHeaderDisplayMax.value = dataValues.displayMax.toFixed(2);
        inputHeaderDisplayMax["dataValues"] = dataValues;
        inputHeaderDisplayMax.onchange = ((event) => {
            let dataValues: DataValues = event.target["dataValues"] as DataValues;
            let newValue: number = event.target.value;
            //dataValues.displayMax = Math.min(dataValues.max, Math.max(dataValues.min, newValue));
            dataValues.displayMax = Math.min(Math.max(newValue, dataValues.displayMin), dataValues.max);
            this.drawLayoutInfo();
        }).bind(this);
        divHeaderDisplayMinMax.appendChild(inputHeaderDisplayMax);
    }

    // addHeaderBase
    private addHeaderBase(dataValues: DataValues): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;
        // create header
        let divHeader = document.createElement("div");
        //divHeader.style.height = legendHeight.toString() + "px";
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.border = "1px solid black";
        divHeader.style.display = "flex";
        divHeader.style.flexDirection = "column";
        this.parentHeadrs.appendChild(divHeader);

        // create div header name
        let divHeaderName = document.createElement("div");
        divHeaderName.innerText = dataValues.name + " (" + dataValues.unit + ")";
        divHeaderName.style.textAlign = "center";
        divHeaderName.style.borderBottom = "1px solid black";
        divHeader.appendChild(divHeaderName);

        // create div header minmax
        let divHeaderMinMax = document.createElement("div");
        divHeaderMinMax.style.display = "flex";
        divHeaderMinMax.style.flexDirection = "row";
        divHeader.appendChild(divHeaderMinMax);

        // create div header min
        let divHeaderMin = document.createElement("div");
        divHeaderMin.style.display = "block";
        divHeaderMin.style.width = "100%";
        divHeaderMin.style.textAlign = "center";
        divHeaderMin.style.borderRight = "1px solid black";
        divHeaderMin.innerText = dataValues.min.toString();
        divHeaderMinMax.appendChild(divHeaderMin);

        // create div header max
        let divHeaderMax = document.createElement("div");
        divHeaderMax.style.display = "block";
        divHeaderMax.style.width = "100%";
        divHeaderMax.style.textAlign = "center";
        divHeaderMax.style.borderLeft = "1px solid black";
        divHeaderMax.innerText = dataValues.max.toString();
        divHeaderMinMax.appendChild(divHeaderMax);
    }

    // addHeaderFacie
    private addHeaderFacie(name: string): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;
        let divHeader = document.createElement("div");
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.border = "1px solid black";
        divHeader.style.textAlign = "center";
        divHeader.innerText = name;
        this.parentHeadrs.appendChild(divHeader);
    }

    // drawPlot
    private drawPlot(dataValues: DataValues, x: number, y: number, color: string): void {
        // start drawing
        this.layoutCanvasCtx.translate(x, y);
        let numSections = Math.floor(Math.log10(dataValues.max)) + 1;
        // draw predict
        if (dataValues.isPredict()) {
            this.layoutCanvasCtx.beginPath();
            this.layoutCanvasCtx.lineWidth = 2;
            this.layoutCanvasCtx.strokeStyle = "lightblue";
            this.layoutCanvasCtx.setLineDash([10, 3]);
            for (let i = 0; i < dataValues.values.length - 1; i++) {
                let value0 = dataValues.predicts[i];
                let value1 = dataValues.predicts[i + 1];
                if (value0 > DATA_MINIMAL_VALUE) {
                    let xPoint0 = value0;
                    let xPoint1 = value1;
                    if (dataValues.displayType === DisplayType.LINEAR) {
                        xPoint0 = (value0 - dataValues.displayMin) / (dataValues.displayMax - dataValues.displayMin);
                        xPoint1 = (value1 - dataValues.displayMin) / (dataValues.displayMax - dataValues.displayMin);
                        xPoint0 = Math.min(1.0, Math.max(0.0, xPoint0)) * LAYOUT_COLUMN_WIDTH;
                        xPoint1 = Math.min(1.0, Math.max(0.0, xPoint1)) * LAYOUT_COLUMN_WIDTH;
                    }
                    else if (dataValues.displayType === DisplayType.LOG) {
                        xPoint0 = Math.log10(value0) / numSections;
                        xPoint1 = Math.log10(value1) / numSections;
                        xPoint0 = Math.min(1.0, Math.max(0.0, xPoint0)) * LAYOUT_COLUMN_WIDTH;
                        xPoint1 = Math.min(1.0, Math.max(0.0, xPoint1)) * LAYOUT_COLUMN_WIDTH;
                    }
                    let yPoint0 = i;
                    let yPoint1 = i + 1;
                    this.layoutCanvasCtx.moveTo(xPoint0, yPoint0 * this.scale)
                    this.layoutCanvasCtx.lineTo(xPoint1, yPoint1 * this.scale)
                }
            }
            this.layoutCanvasCtx.stroke();
            this.layoutCanvasCtx.setLineDash([]);
        }

        // draw values
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = color;
        for (let i = 0; i < dataValues.values.length - 1; i++) {
            let value0 = dataValues.values[i];
            let value1 = dataValues.values[i + 1];
            if (value0 > DATA_MINIMAL_VALUE) {
                let xPoint0 = value0;
                let xPoint1 = value1;
                if (dataValues.displayType === DisplayType.LINEAR) {
                    xPoint0 = (value0 - dataValues.displayMin) / (dataValues.displayMax - dataValues.displayMin);
                    xPoint1 = (value1 - dataValues.displayMin) / (dataValues.displayMax - dataValues.displayMin);
                    xPoint0 = Math.min(1.0, Math.max(0.0, xPoint0)) * LAYOUT_COLUMN_WIDTH;
                    xPoint1 = Math.min(1.0, Math.max(0.0, xPoint1)) * LAYOUT_COLUMN_WIDTH;
                }
                else if (dataValues.displayType === DisplayType.LOG) {
                    xPoint0 = Math.log10(value0) / numSections;
                    xPoint1 = Math.log10(value1) / numSections;
                    xPoint0 = Math.min(1.0, Math.max(0.0, xPoint0)) * LAYOUT_COLUMN_WIDTH;
                    xPoint1 = Math.min(1.0, Math.max(0.0, xPoint1)) * LAYOUT_COLUMN_WIDTH;
                }
                let yPoint0 = i;
                let yPoint1 = i + 1;
                this.layoutCanvasCtx.moveTo(xPoint0, yPoint0 * this.scale)
                this.layoutCanvasCtx.lineTo(xPoint1, yPoint1 * this.scale)
            }
        }
        this.layoutCanvasCtx.stroke();

        // finish drawing
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawFacies
    private drawFacies(dataFacies: DataFacies, x: number, y: number): void {
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.lineWidth = 2;
        for (let i = 0; i < dataFacies.values.length; i++) {
            this.layoutCanvasCtx.strokeStyle = "white";
            if (dataFacies.values[i] >= 0)
                this.layoutCanvasCtx.strokeStyle = gColorTable[dataFacies.values[i]];
            let yBeg = i * this.scale;
            let yEnd = Math.max(yBeg, (i + 1) * this.scale);
            for (let y = yBeg; y <= yEnd; y++) {
                this.layoutCanvasCtx.beginPath();
                this.layoutCanvasCtx.moveTo(0, y)
                this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, y)
                this.layoutCanvasCtx.stroke();
            }
        }
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawSamples
    private drawSamples(dataSamples: DataSamples, x: number, y: number): void {
        this.layoutCanvasCtx.translate(x, y);
        for (let i = 0; i < dataSamples.values.length; i++) {
            if (dataSamples.values[i] > 0) {
                this.layoutCanvasCtx.textBaseline = "middle";
                this.layoutCanvasCtx.textAlign = "left";
                this.layoutCanvasCtx.font = "14px Arial";
                this.layoutCanvasCtx.strokeStyle = "black";
                this.layoutCanvasCtx.fillStyle = "black";
                this.layoutCanvasCtx.fillText(this.layoutInfo.dataTable.dataValues[0].values[i].toString(), 15, i * this.scale)
                this.layoutCanvasCtx.strokeStyle = "red";
                this.layoutCanvasCtx.fillStyle = "red";
                this.layoutCanvasCtx.beginPath();
                this.layoutCanvasCtx.arc(10, i * this.scale, 5, 0, 2 * Math.PI);
                this.layoutCanvasCtx.fill();
            }
        }
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawYAxis
    private drawYAxis(dataValues: DataValues, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 2;
        this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
        for (let i = LAYOUT_AXES_HINT_STEP; i < dataValues.values.length; i += (LAYOUT_AXES_HINT_STEP)) {
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "24px Arial";
            this.layoutCanvasCtx.strokeStyle = "BBBBBB";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.fillText(dataValues.values[i].toString(), LAYOUT_COLUMN_WIDTH * 0.5, i * this.scale);
            this.layoutCanvasCtx.moveTo(0, i * this.scale);
            this.layoutCanvasCtx.lineTo(0 + LAYOUT_AXES_HINT_LENGTH, i * this.scale);
            this.layoutCanvasCtx.moveTo(LAYOUT_COLUMN_WIDTH - LAYOUT_AXES_HINT_LENGTH, i * this.scale);
            this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, i * this.scale);
        }
        this.layoutCanvasCtx.stroke();
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawGrid
    private drawGrid(dataValues: DataValues, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
        this.layoutCanvasCtx.moveTo(0, 0);
        this.layoutCanvasCtx.lineTo(0, dataValues.values.length * this.scale);
        if (dataValues.displayType === DisplayType.LINEAR) {
            // empty
        }
        else if (dataValues.displayType === DisplayType.LOG) {
            let numSections = Math.floor(Math.log10(dataValues.max)) + 1;
            for (let i = 0; i < numSections; i++) {
                for (let j = 1; j < 10; j++) {
                    let value0 = Math.pow(10, i)*j;
                    let xPoint0 = Math.log10(value0) / numSections;
                    this.layoutCanvasCtx.moveTo(xPoint0*LAYOUT_COLUMN_WIDTH, 0);
                    this.layoutCanvasCtx.lineTo(xPoint0*LAYOUT_COLUMN_WIDTH, dataValues.values.length * this.scale);
                    this.layoutCanvasCtx.stroke();
                }
            }
        }
        for (let i = LAYOUT_AXES_HINT_STEP; i < dataValues.values.length; i += LAYOUT_AXES_HINT_STEP) {
            this.layoutCanvasCtx.moveTo(0, i * this.scale);
            this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, i * this.scale);
        }
        this.layoutCanvasCtx.stroke();
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }

    // drawGridFacies
    private drawGridFacies(dataValues: number[], x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 2;
        this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
        this.layoutCanvasCtx.moveTo(0, 0);
        this.layoutCanvasCtx.lineTo(0, dataValues.length * this.scale);
        this.layoutCanvasCtx.moveTo(LAYOUT_COLUMN_WIDTH, 0);
        this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, dataValues.values.length * this.scale);
        for (let i = LAYOUT_AXES_HINT_STEP; i < dataValues.length; i += LAYOUT_AXES_HINT_STEP) {
            this.layoutCanvasCtx.moveTo(0, i * this.scale);
            this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, i * this.scale);
        }
        this.layoutCanvasCtx.stroke();
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
    }
}

let gColorTable: string[] = [
    "blue", "red", "green", "orange",
    "#B0187B", "#8B7DA3", "#A545BB", "#C7A248",
    "#39F992", "#324CF7", "#D04D5E", "#1E88E6",
    "#92BFB3", "#858D1A", "#92E877", "#1FDFD9",
    "#DD7488", "#9DACBB", "#934591", "#FC9AA4",
];

// get mause position for element
function getMousePosByElement(node: HTMLElement, event: MouseEvent) {
    let rect = node.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}