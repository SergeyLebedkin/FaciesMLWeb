import { DataArray, DataArrayType, DATA_MINIMAL_VALUE } from "../Types/DataArray";
import { LayoutInfo } from "../Types/LayoutInfo";
import { SelectionMode } from "../Types/SelectionMode";

const LAYOUT_HEADER_HEIGHT: number = 30;
const LAYOUT_LEGENT_HEIGHT: number = 60;
const LAYOUT_COLUMN_WIDTH: number = 150;
const LAYOUT_AXES_HINT_STEP: number = 100;
const LAYOUT_AXES_HINT_LENGTH: number = 30;

// LayoutInfoEditor
export class LayoutInfoEditor {
    // parent
    private parent: HTMLDivElement = null;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    public scale: number = 1.0;
    // selection
    private selectionOffset = 0;
    private selectionStarted: boolean = false;
    private selectionMode: SelectionMode = SelectionMode.ADD;
    private selectionStart: number = null;
    private selectionEnd: number = null;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // constructor
    constructor(parent: HTMLDivElement) {
        // setup parent
        this.parent = parent;
        // image parameters
        this.layoutInfo = null;
        this.scale = 1.0;
        // selection
        this.selectionStarted = false;
        this.selectionMode = SelectionMode.ADD;
        this.selectionOffset = LAYOUT_HEADER_HEIGHT + LAYOUT_LEGENT_HEIGHT;
        this.selectionStart = 0;
        this.selectionEnd = 0;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.onmouseup = this.onMouseUp.bind(this);
        this.layoutCanvas.onmousemove = this.onMouseMove.bind(this);
        this.layoutCanvas.onmousedown = this.onMouseDown.bind(this);
        this.layoutCanvas.style.border = "1px solid orange";
        this.layoutCanvas.style.cursor = "row-resize";
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parent.appendChild(this.layoutCanvas);
    }

    // onMouseUp
    public onMouseUp(event: MouseEvent): void {
        // proceed selection
        if (this.selectionStarted) {
            // normalize
            this.selectionStart = Math.max(this.selectionStart, 0);
            this.selectionStart = Math.min(this.selectionStart, this.layoutInfo.dataTable.data[0].values.length - 1);
            this.selectionEnd = Math.max(this.selectionEnd, 0);
            this.selectionEnd = Math.min(this.selectionEnd, this.layoutInfo.dataTable.data[0].values.length - 1);
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
            this.selectionEnd = mouseCoords.y / this.scale - this.selectionOffset;
            // redraw stuff
            this.drawLayoutInfo();
            this.drawSelectionRange();
        }
    }

    // onMouseDown
    public onMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return;
        if (this.layoutInfo !== null) {
            // get mouse coords
            let mouseCoords = getMousePosByElement(this.layoutCanvas, event);
            // start selection
            this.selectionStarted = true;
            // check selection mode and set color
            this.selectionStart = mouseCoords.y / this.scale - this.selectionOffset;
            this.selectionEnd = mouseCoords.y / this.scale - this.selectionOffset;
        };
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

    // drawLayoutInfo
    public drawLayoutInfo(): void {
        this.layoutCanvas.width = (this.layoutInfo.dataArrays.length + 1) * LAYOUT_COLUMN_WIDTH * this.scale;
        this.layoutCanvas.height = (this.layoutInfo.dataTable.data[0].values.length + LAYOUT_HEADER_HEIGHT + LAYOUT_LEGENT_HEIGHT) * this.scale;
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.clearCanvas();
        // draw data ranges
        this.drawLayoutInfoSelections(this.selectionOffset);
        // draw header
        this.drawHeader(0, 0);
        // draw base axes
        this.drawLegend(0, LAYOUT_HEADER_HEIGHT,
            this.layoutInfo.dataTable.data[0].name + " (" + this.layoutInfo.dataTable.data[0].unit + ")",
            this.layoutInfo.dataTable.data[0].min,
            this.layoutInfo.dataTable.data[0].max);
        this.drawYAxis(this.layoutInfo.dataTable.data[0], 0, this.selectionOffset);
        // draw selected data arrays
        this.layoutInfo.dataArrays.forEach((dataArray, index) => {
            if (dataArray.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_VALUE) {
                this.drawLegend((index + 1) * LAYOUT_COLUMN_WIDTH, LAYOUT_HEADER_HEIGHT, dataArray.name + " (" + dataArray.unit + ")", dataArray.min, dataArray.max);
                this.drawGrid(dataArray, (index + 1) * LAYOUT_COLUMN_WIDTH, this.selectionOffset);
                this.drawPlot(dataArray, (index + 1) * LAYOUT_COLUMN_WIDTH, this.selectionOffset, gColorTable[index]);
            }
            if (dataArray.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_FACIE) {
                this.drawLegendFacie((index + 1) * LAYOUT_COLUMN_WIDTH, LAYOUT_HEADER_HEIGHT, dataArray.name);
                this.drawFacies(dataArray, (index + 1) * LAYOUT_COLUMN_WIDTH, this.selectionOffset);
            }
        });
    }

    // drawSelectionRange
    private drawSelectionRange() {
        if (this.selectionStarted) {
            this.layoutCanvasCtx.scale(this.scale, this.scale);
            if (this.selectionMode === SelectionMode.ADD) {
                this.layoutCanvasCtx.globalAlpha = 0.85;
                this.layoutCanvasCtx.fillStyle = "#DDDDDD";
            } else if (this.selectionMode === SelectionMode.REMOVE) {
                this.layoutCanvasCtx.globalAlpha = 0.60;
                this.layoutCanvasCtx.fillStyle = "#DD0000";
            }
            this.layoutCanvasCtx.fillRect(0, this.selectionStart + this.selectionOffset, this.layoutCanvas.width / this.scale, this.selectionEnd - this.selectionStart);
            this.layoutCanvasCtx.globalAlpha = 1.0;
            this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
        }
    }

    // drawDataRanges
    private drawLayoutInfoSelections(offsetY: number) {
        this.layoutCanvasCtx.scale(this.scale, this.scale);
        this.layoutCanvasCtx.globalAlpha = 0.8;
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
        for (let i = 0; i < this.layoutInfo.dataTable.selections.length; i++) {
            if (this.layoutInfo.dataTable.selections[i] > 0) {
                this.layoutCanvasCtx.moveTo(0, i + offsetY);
                this.layoutCanvasCtx.lineTo(this.layoutCanvas.width / this.scale, i + offsetY);
            }
        }
        this.layoutCanvasCtx.stroke();
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.globalAlpha = 1.0;
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
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

    // drawLegend
    private drawLegend(x: number, y: number, name: string, min: number, max: number): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH;

        // clear legend canvas
        this.layoutCanvasCtx.scale(this.scale, this.scale);
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, legendWidth, legendHeight);
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.rect(0, 0, legendWidth, legendHeight);
        this.layoutCanvasCtx.rect(0, legendHeight * 0.5, legendWidth * 0.5, legendHeight * 0.5);
        this.layoutCanvasCtx.rect(legendWidth * 0.5, legendHeight * 0.5, legendWidth * 0.5, legendHeight * 0.5);
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(name, legendWidth * 0.5, legendHeight * 0.25);
        this.layoutCanvasCtx.fillText(min.toString(), legendWidth * 0.25, legendHeight * 0.75);
        this.layoutCanvasCtx.fillText(max.toString(), legendWidth * 0.75, legendHeight * 0.75);
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
    }

    // drawLegendFacie
    private drawLegendFacie(x: number, y: number, name: string): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH;

        // clear legend canvas
        this.layoutCanvasCtx.scale(this.scale, this.scale);
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, legendWidth, legendHeight);
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.rect(0, 0, legendWidth, legendHeight);
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(name, legendWidth * 0.5, legendHeight * 0.5);
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
    }

    // drawPlot
    private drawPlot(dataArray: DataArray, x: number, y: number, color: string): void {
        // start drawing
        this.layoutCanvasCtx.scale(this.scale, this.scale);
        this.layoutCanvasCtx.translate(x, y);

        // draw predict
        if (dataArray.isPredict()) {
            let moved = false;
            this.layoutCanvasCtx.beginPath();
            this.layoutCanvasCtx.lineWidth = 1;
            this.layoutCanvasCtx.strokeStyle = color;
            for (let i = 0; i < dataArray.valuesPredict.length; i++) {
                // if value is valid
                if (dataArray.valuesPredict[i] > DATA_MINIMAL_VALUE) {
                    let xPoint = (dataArray.valuesPredict[i] - dataArray.min) / (dataArray.max - dataArray.min) * LAYOUT_COLUMN_WIDTH;
                    let yPoint = i;
                    if (moved)
                        this.layoutCanvasCtx.lineTo(xPoint, yPoint)
                    else
                        this.layoutCanvasCtx.moveTo(xPoint, yPoint)
                    moved = true;
                } else { // if value is invalid
                    this.layoutCanvasCtx.stroke();
                    moved = false;
                }
            }
            this.layoutCanvasCtx.stroke();
        }

        // draw values
        let moved = false;
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.lineWidth = 1;
        this.layoutCanvasCtx.strokeStyle = color;
        for (let i = 0; i < dataArray.values.length; i++) {
            // if value is valid
            if (dataArray.values[i] > DATA_MINIMAL_VALUE) {
                let xPoint = (dataArray.values[i] - dataArray.min) / (dataArray.max - dataArray.min) * LAYOUT_COLUMN_WIDTH;
                let yPoint = i;
                if (moved)
                    this.layoutCanvasCtx.lineTo(xPoint, yPoint)
                else
                    this.layoutCanvasCtx.moveTo(xPoint, yPoint)
                moved = true;
            } else { // if value is invalid
                this.layoutCanvasCtx.stroke();
                moved = false;
            }
        }
        this.layoutCanvasCtx.stroke();

        // finish drawing
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
    }

    // drawFacies
    private drawFacies(dataArray: DataArray, x: number, y: number): void {
        this.layoutCanvasCtx.scale(this.scale, this.scale);
        this.layoutCanvasCtx.translate(x, y);
        for (let i = 0; i < dataArray.values.length; i++) {
            this.layoutCanvasCtx.fillStyle = gColorTable[dataArray.values[i]];
            this.layoutCanvasCtx.beginPath();
            this.layoutCanvasCtx.fillRect(0, i, LAYOUT_COLUMN_WIDTH, 16);
            this.layoutCanvasCtx.stroke();
        }
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
    }

    // drawHeader
    private drawHeader(x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.scale(this.scale, this.scale);
        this.layoutCanvasCtx.translate(x, y);
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, this.layoutCanvas.width / this.scale, LAYOUT_HEADER_HEIGHT);
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.rect(0, 0, this.layoutCanvas.width / this.scale, LAYOUT_HEADER_HEIGHT);
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.textBaseline = "middle";
        this.layoutCanvasCtx.textAlign = "center";
        this.layoutCanvasCtx.font = "14px Arial";
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.fillStyle = "black";
        this.layoutCanvasCtx.fillText(this.layoutInfo.dataTable.name, this.layoutCanvas.width / this.scale * 0.5, LAYOUT_HEADER_HEIGHT * 0.5);
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
    }

    // drawYAxis
    private drawYAxis(dataArray: DataArray, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.scale(this.scale, this.scale);
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
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
    }

    // drawGrid
    private drawGrid(dataArray: DataArray, x: number, y: number): void {
        // clear legend canvas
        this.layoutCanvasCtx.scale(this.scale, this.scale);
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
        // this.layoutCanvasCtx.closePath();
        this.layoutCanvasCtx.translate(-x, -y);
        this.layoutCanvasCtx.scale(1.0 / this.scale, 1.0 / this.scale);
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