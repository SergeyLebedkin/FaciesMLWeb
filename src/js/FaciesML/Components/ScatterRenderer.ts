import { DisplayType } from "../Types/DataValues";
import { DataValues } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";
import { FaciesPopup } from "../Components/FaciesPopup";


const LAYOUT_CANVAS_HEIGHT: number = 600;
const LAYOUT_CANVAS_WIDTH: number = 600;
const LAYOUT_SCATTRER_X: number = 40;
const LAYOUT_SCATTRER_Y: number = 40;
const LAYOUT_SCATTRER_WIDTH: number = 520;
const LAYOUT_SCATTRER_HEIGHT: number = 520;
const LAYOUT_SCATTRER_NUM_GRID_SECTIONS_X: number = 5;
const LAYOUT_SCATTRER_NUM_GRID_SECTIONS_Y: number = 7;

// ScatterRenderer
export class ScatterRenderer {
    // parent
    private parent: HTMLDivElement = null;
    // display type
    public displayTypeX: DisplayType = DisplayType.LINEAR;
    public displayTypeY: DisplayType = DisplayType.LINEAR;
    // axis data
    private dataValuesAxisX: DataValues;
    private dataValuesAxisY: DataValues;
    private dataFacies: DataFacies;
    private dataSamples: DataSamples;
    private selections: Array<number>;
    // render properties
    private windowScale: number = 0.0;
    private windowWidth: number = 0.0;
    private windowHeight: number = 0.0;
    private windowPositionX: number = 0.0;
    private windowPositionY: number = 0.0;
    // draggind
    private mousePrevDragX: number = 0.0;
    private mousePrevDragY: number = 0.0;
    private draggingStarted: boolean = false;
    // visibility
    private dataValuesVisible: boolean = false;
    private dataSamplesVisible: boolean = false;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    private layoutMaskCanvas: HTMLCanvasElement = null;
    private layoutMaskCanvasCtx: CanvasRenderingContext2D = null;
    // menus
    private faciesPopup: FaciesPopup = null;
    // constructor
    constructor(parent: HTMLDivElement, faciesPopup: FaciesPopup) {
        this.parent = parent;
        // display type
        this.displayTypeX = DisplayType.LINEAR;
        this.displayTypeY = DisplayType.LINEAR;
        // axis data
        this.dataValuesAxisX = null;
        this.dataValuesAxisY = null;
        this.dataFacies = null;
        this.dataSamples = null;
        this.selections = null;
        // render properties
        this.windowScale = 1.0;
        this.windowWidth = 0.0;
        this.windowHeight = 0.0;
        this.windowPositionX = 0.0;
        this.windowPositionY = 0.0;
        // draggind
        this.draggingStarted = false;
        this.mousePrevDragX = 0.0;
        this.mousePrevDragY = 0.0;
        // visibility
        this.dataValuesVisible = true;
        this.dataSamplesVisible = true;
        // get menus
        this.faciesPopup = faciesPopup;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.onmouseup = this.onMouseUp.bind(this);
        this.layoutCanvas.onmousemove = this.onMouseMove.bind(this);
        this.layoutCanvas.onmousedown = this.onMouseDown.bind(this);
        this.layoutCanvas.onwheel = this.onMouseWheel.bind(this);
        this.layoutCanvas.ondblclick = this.onMouseDoubleClick.bind(this);
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parent.appendChild(this.layoutCanvas);
        this.layoutMaskCanvas = document.createElement("canvas");
        //this.layoutMaskCanvas.onmousemove = this.onMouseMove.bind(this);
        this.layoutMaskCanvasCtx = this.layoutMaskCanvas.getContext('2d');
        //this.parent.appendChild(this.layoutMaskCanvas);
    }

    // onMouseUp
    public onMouseUp(event: MouseEvent): void {
        this.draggingStarted = false;
    }

    // onMouseMove
    public onMouseMove(event: MouseEvent): void {
        if (this.draggingStarted) {
            // get mouse delta move
            let mouseDeltaX = this.mousePrevDragX - event.screenX;
            let mouseDeltaY = this.mousePrevDragY - event.screenY;
            // scroll parent
            let scaleCoefX = this.windowWidth / this.layoutCanvas.width / this.windowScale;
            let scaleCoefY = this.windowHeight / this.layoutCanvas.height / this.windowScale;
            this.windowPositionX += mouseDeltaX * scaleCoefX;
            this.windowPositionY -= mouseDeltaY * scaleCoefY;
            // store new mouse coords
            this.mousePrevDragX = event.screenX;
            this.mousePrevDragY = event.screenY;
            this.drawScatter();
        }

        // get bounding client rect
        let rect = this.layoutCanvas.getBoundingClientRect();
        let mousePosX = event.clientX - rect.left;
        let mousePosY = event.clientY - rect.top;
        // check for high resolution region
        let index = this.getMaskValueByCoord(mousePosX, mousePosY);
        if (index >= 0)
            this.layoutCanvas.style.cursor = "pointer";
        else
            this.layoutCanvas.style.cursor = "auto";
    }

    // onMouseDown
    public onMouseDown(event: MouseEvent): void {
        // get bounding client rect
        let rect = this.layoutCanvas.getBoundingClientRect();
        let mousePosX = event.clientX - rect.left;
        let mousePosY = event.clientY - rect.top;
        // check for high resolution region
        let index = this.getMaskValueByCoord(mousePosX, mousePosY);
        if (index >= 0) {
            if (this.faciesPopup) {
                this.faciesPopup.setDataSamples(this.dataSamples);
                this.faciesPopup.setDataSamplesIndex(index);
                this.faciesPopup.show(event.pageX, event.pageY);
            }
        }
        else {
            this.draggingStarted = true;
            this.mousePrevDragX = event.screenX;
            this.mousePrevDragY = event.screenY;
        }
    }

    // onMouseWheel
    public onMouseWheel(event: WheelEvent): void {
        this.windowScale = Math.max(1.0, this.windowScale * Math.pow(1.1, -event.deltaY / 100));
        this.drawScatter();
    }

    // onMouseDoubleClick
    public onMouseDoubleClick(event: MouseEvent): void {
        this.resetWindow();
        this.drawScatter();
        event.stopPropagation();
    }

    // setDisplayTypeX
    public setDisplayTypeX(displayType: DisplayType): void {
        if (this.displayTypeX !== displayType) {
            this.displayTypeX = displayType;
            this.resetWindow();
        }
    }

    // setDisplayTypeY
    public setDisplayTypeY(displayType: DisplayType): void {
        if (this.displayTypeY !== displayType) {
            this.displayTypeY = displayType;
            this.resetWindow();
        }
    }

    // setDisplayTypeX
    public setDataValuesAxisX(dataValues: DataValues): void {
        if (this.dataValuesAxisX !== dataValues) {
            this.dataValuesAxisX = dataValues;
            this.resetWindow();
        }
    }

    // setDisplayTypeY
    public setDataValuesAxisY(dataValues: DataValues): void {
        if (this.dataValuesAxisY !== dataValues) {
            this.dataValuesAxisY = dataValues;
            this.resetWindow();
        }
    }

    // setDataFacies
    public setDataFacies(dataFacies: DataFacies): void {
        if (this.dataFacies !== dataFacies) {
            this.dataFacies = dataFacies;
            this.drawScatter();
        }
    }

    // setDataSamples
    public setDataSamples(dataSamples: DataSamples): void {
        if (this.dataSamples !== dataSamples) {
            this.dataSamples = dataSamples;
            this.drawScatter();
        }
    }

    // setSelections
    public setSelections(selections: Array<number>): void {
        if (this.selections !== selections) {
            this.selections = selections;
            this.drawScatter();
        }
    }

    // setDataValuesVisible
    public setDataValuesVisible(visible: boolean) {
        this.dataValuesVisible = visible;
        this.drawScatter();
    }

    // setDataSamplesVisible
    public setDataSamplesVisible(visible: boolean) {
        this.dataSamplesVisible = visible;
        this.drawScatter();
    }

    // drawScatter
    public drawScatter(): void {
        // set canvas size
        this.layoutCanvas.height = LAYOUT_CANVAS_HEIGHT;
        this.layoutCanvas.width = LAYOUT_CANVAS_WIDTH;
        this.layoutMaskCanvas.height = LAYOUT_CANVAS_HEIGHT;
        this.layoutMaskCanvas.width = LAYOUT_CANVAS_WIDTH;
        // clear scatter
        this.clearScatter();
        this.drawAxisNameX();
        this.drawAxisNameY();
        this.drawFaciesName();
        this.drawGrid();
        this.drawScatterBorders();
        if (this.dataValuesVisible)
            this.drawValues();
        if (this.dataSamplesVisible)
            this.drawSamples();
    }

    // drawScatterBorder
    private clearScatter(): void {
        // get scatter metrics
        let canvasWidth = this.layoutCanvas.width;
        let canvasHeight = this.layoutCanvas.height;
        // fill scatter
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.layoutMaskCanvasCtx.globalAlpha = 0.0;
        this.layoutMaskCanvasCtx.fillStyle = "blue";
        this.layoutMaskCanvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // drawScatterBorders
    private drawScatterBorders(): void {
        // get scatter metrics
        let scatterX = LAYOUT_SCATTRER_X;
        let scatterY = LAYOUT_SCATTRER_Y;
        let scatterWidth = LAYOUT_SCATTRER_WIDTH;
        let scatterHeight = LAYOUT_SCATTRER_HEIGHT;
        // draw borders
        this.layoutCanvasCtx.lineWidth = 2;
        this.layoutCanvasCtx.strokeStyle = "black";
        this.layoutCanvasCtx.strokeRect(scatterX, scatterY, scatterWidth, scatterHeight);
    }

    // drawAxisNameX
    private drawAxisNameX(): void {
        // get scatter metrics
        let scatterX = LAYOUT_SCATTRER_X;
        let scatterY = LAYOUT_SCATTRER_Y;
        let scatterWidth = LAYOUT_SCATTRER_WIDTH;
        let scatterHeight = LAYOUT_SCATTRER_HEIGHT;
        // draw X-axis name
        if (this.dataValuesAxisX) {
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "14px Arial";
            this.layoutCanvasCtx.strokeStyle = "black";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.fillText(this.dataValuesAxisX.name, scatterX + scatterWidth / 2, scatterY + scatterHeight + 10);
        }
    }

    // drawAxisNameX
    private drawAxisNameY(): void {
        // get scatter metrics
        let scatterY = LAYOUT_SCATTRER_Y;
        let scatterHeight = LAYOUT_SCATTRER_HEIGHT;
        // draw X-axis name
        if (this.dataValuesAxisY) {
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "14px Arial";
            this.layoutCanvasCtx.strokeStyle = "black";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.translate(10, scatterY + scatterHeight / 2);
            this.layoutCanvasCtx.rotate(-Math.PI / 2);
            this.layoutCanvasCtx.fillText(this.dataValuesAxisY.name, 0, 0);
            this.layoutCanvasCtx.resetTransform();
        }
    }

    // drawFaciesName
    private drawFaciesName(): void {
        // get scatter metrics
        let scatterX = LAYOUT_SCATTRER_X;
        let scatterWidth = LAYOUT_SCATTRER_WIDTH;
        // draw X-axis name
        if (this.dataFacies) {
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "14px Arial";
            this.layoutCanvasCtx.strokeStyle = "black";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.fillText(this.dataFacies.name, scatterX + scatterWidth / 2, 10);
        }
    }

    // drawValues
    private drawValues(): void {
        // draw values
        if (this.dataValuesAxisX && this.dataValuesAxisY && this.dataFacies) {
            // find if any selected
            let anySelected: boolean = this.selections && this.selections.findIndex(val => val !== 0) >= 0;
            // draw values ony by one
            for (let i = 0; i < this.dataValuesAxisX.values.length; i++) {
                if ((!anySelected) || (!this.selections) || (anySelected && this.selections[i] > 0)) {
                    let pointX = this.coordToWindowX(this.dataValuesAxisX.values[i]);
                    let pointY = this.coordToWindowY(this.dataValuesAxisY.values[i]);
                    if (isInRange(pointX, -1, 1) && isInRange(pointY, -1, 1)) {
                        let x = this.windowToCanvasX(pointX);
                        let y = this.windowToCanvasY(pointY);
                        this.layoutCanvasCtx.beginPath();
                        this.layoutCanvasCtx.arc(x, y, 3, 0, 2 * Math.PI, false);
                        this.layoutCanvasCtx.fillStyle = this.dataFacies.colorTable[this.dataFacies.valuesDisplay[i]];
                        this.layoutCanvasCtx.fill();
                        this.layoutCanvasCtx.lineWidth = 1;
                        this.layoutCanvasCtx.strokeStyle = this.dataFacies.colorTable[this.dataFacies.valuesDisplay[i]];
                        this.layoutCanvasCtx.stroke();
                    }
                }
            }
        }
    }

    // drawSamples
    private drawSamples(): void {
        // draw values
        if (this.dataValuesAxisX && this.dataValuesAxisY && this.dataFacies && this.dataSamples) {
            // draw values ony by one
            for (let i = 0; i < this.dataSamples.values.length; i++) {
                if (this.dataSamples.values[i] > 0) {
                    let pointX = this.coordToWindowX(this.dataValuesAxisX.values[i]);
                    let pointY = this.coordToWindowY(this.dataValuesAxisY.values[i]);
                    if (isInRange(pointX, -1, 1) && isInRange(pointY, -1, 1)) {
                        let x = this.windowToCanvasX(pointX);
                        let y = this.windowToCanvasY(pointY);
                        // draw samples
                        this.layoutCanvasCtx.beginPath();
                        this.layoutCanvasCtx.arc(x, y, 3, 0, 2 * Math.PI, false);
                        this.layoutCanvasCtx.fillStyle = this.dataFacies.colorTable[this.dataFacies.valuesDisplay[i]];
                        this.layoutCanvasCtx.fill();
                        this.layoutCanvasCtx.lineWidth = 1;
                        this.layoutCanvasCtx.strokeStyle = "black";
                        this.layoutCanvasCtx.stroke();
                        // draw samples mask
                        this.layoutMaskCanvasCtx.beginPath();
                        this.layoutMaskCanvasCtx.arc(x, y, 4, 0, 2 * Math.PI, false);
                        this.layoutMaskCanvasCtx.strokeStyle = decimalColorToHTMLcolor(i);
                        this.layoutMaskCanvasCtx.fillStyle = decimalColorToHTMLcolor(i);
                        this.layoutMaskCanvasCtx.globalAlpha = 1;
                        this.layoutMaskCanvasCtx.fill();
                    }
                }
            }
        }
        // warning message
        if (!this.dataFacies) {
            let x = this.windowToCanvasX(0.0);
            let y = this.windowToCanvasX(0.0);
            this.layoutCanvasCtx.textBaseline = "middle";
            this.layoutCanvasCtx.textAlign = "center";
            this.layoutCanvasCtx.font = "24px Arial";
            this.layoutCanvasCtx.strokeStyle = "black";
            this.layoutCanvasCtx.fillStyle = "black";
            this.layoutCanvasCtx.fillText("Please, select Facies", x, y);
        }
    }

    // drawGrid
    private drawGrid(): void {
        // draw borders
        if (this.dataValuesAxisX && this.dataValuesAxisY) {
            // draw vertical lines
            for (let i = 0; i <= LAYOUT_SCATTRER_NUM_GRID_SECTIONS_X; i++) {
                let xVal = lerp(
                    this.windowPositionX - (this.windowWidth / this.windowScale * 0.5),
                    this.windowPositionX + (this.windowWidth / this.windowScale * 0.5),
                    i / LAYOUT_SCATTRER_NUM_GRID_SECTIONS_X);
                let x = this.windowToCanvasX(this.coordToWindowX(xVal));
                let y1 = this.windowToCanvasY(+1);
                let y2 = this.windowToCanvasY(-1);
                // draw line
                this.layoutCanvasCtx.lineWidth = 1;
                this.layoutCanvasCtx.strokeStyle = "#CCCCCC";
                this.layoutCanvasCtx.beginPath();
                this.layoutCanvasCtx.moveTo(x, y1);
                this.layoutCanvasCtx.lineTo(x, y2);
                this.layoutCanvasCtx.stroke();
                // draw label
                this.layoutCanvasCtx.textBaseline = "top";
                this.layoutCanvasCtx.textAlign = "center";
                this.layoutCanvasCtx.font = "10px Arial";
                this.layoutCanvasCtx.strokeStyle = "black";
                this.layoutCanvasCtx.fillStyle = "black";
                this.layoutCanvasCtx.fillText(xVal.toFixed(2), x, y1);
            }
            // draw horizontal lines
            for (let i = 0; i <= LAYOUT_SCATTRER_NUM_GRID_SECTIONS_Y; i++) {
                let yVal = lerp(
                    this.windowPositionY - (this.windowHeight / this.windowScale * 0.5),
                    this.windowPositionY + (this.windowHeight / this.windowScale * 0.5),
                    i / LAYOUT_SCATTRER_NUM_GRID_SECTIONS_Y);
                let y = this.windowToCanvasY(this.coordToWindowY(yVal));
                let x1 = this.windowToCanvasX(-1);
                let x2 = this.windowToCanvasX(+1);
                // draw line
                this.layoutCanvasCtx.lineWidth = 1;
                this.layoutCanvasCtx.strokeStyle = "#CCCCCC";
                this.layoutCanvasCtx.beginPath();
                this.layoutCanvasCtx.moveTo(x1, y);
                this.layoutCanvasCtx.lineTo(x2, y);
                this.layoutCanvasCtx.stroke();
                // draw label
                this.layoutCanvasCtx.textBaseline = "middle";
                this.layoutCanvasCtx.textAlign = "right";
                this.layoutCanvasCtx.font = "10px Arial";
                this.layoutCanvasCtx.strokeStyle = "black";
                this.layoutCanvasCtx.fillStyle = "black";
                this.layoutCanvasCtx.fillText(yVal.toFixed(2), x1, y);
            }
        }
    }

    // resetWindow
    private resetWindow(): void {
        if (this.dataValuesAxisX && this.dataValuesAxisY) {
            this.windowScale = 1.0;
            this.windowWidth = this.dataValuesAxisX.max - this.dataValuesAxisX.min;
            this.windowHeight = this.dataValuesAxisY.max - this.dataValuesAxisY.min;
            this.windowPositionX = (this.dataValuesAxisX.max + this.dataValuesAxisX.min) * 0.5
            this.windowPositionY = (this.dataValuesAxisY.max + this.dataValuesAxisY.min) * 0.5
        }
    }

    // coordToWindowX (x -> -1..1)
    private coordToWindowX(x: number): number {
        return 2 * (x - this.windowPositionX) / this.windowWidth * this.windowScale;
    }

    // windowToCanvasX (x -> -1..1)
    private windowToCanvasX(x: number): number {
        if (this.displayTypeX === DisplayType.LINEAR)
            return (x + 1) * 0.5 * LAYOUT_SCATTRER_WIDTH + LAYOUT_SCATTRER_X;
        else if (this.displayTypeX === DisplayType.LOG)
            return Math.log10((x + 1) * 0.5 * 999 + 1) / 3 * LAYOUT_SCATTRER_WIDTH + LAYOUT_SCATTRER_X;
    }

    // coordToWindowY
    private coordToWindowY(y: number): number {
        return 2 * (this.windowPositionY - y) / this.windowHeight * this.windowScale;
    }

    // windowToCanvasY
    private windowToCanvasY(y: number): number {
        if (this.displayTypeY === DisplayType.LINEAR)
            return (y + 1) * 0.5 * LAYOUT_SCATTRER_HEIGHT + LAYOUT_SCATTRER_Y;
        else if (this.displayTypeY === DisplayType.LOG)
            return (1 - (Math.log10((-y + 1) * 0.5 * 999 + 1) / 3)) * LAYOUT_SCATTRER_HEIGHT + LAYOUT_SCATTRER_Y;

    }

    // getMaskValueByCoord
    public getMaskValueByCoord(x: number, y: number): number {
        let layoutMaskCanvasData = this.layoutMaskCanvasCtx.getImageData(0, 0, this.layoutMaskCanvas.width, this.layoutMaskCanvas.height);
        let r = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 0];
        let g = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 1];
        let b = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 2];
        let a = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 3];
        if (a === 255)
            return g << 8 | r;
        else
            return -1;
    }

    // saveToImageFile
    public saveToImageFile(fileName: string): void {
        let link = document.createElement('a');
        link.download = fileName;
        link.href = this.layoutCanvas.toDataURL("image/png");
        link.click();
    }
}

// lerp
function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
}

// isInRange
function isInRange(value: number, min: number, max: number): boolean {
    return (value >= min) && (value <= max);
}

// decimalColorToHTMLcolor
function decimalColorToHTMLcolor(val: number): string {
    //converts to a integer
    var intnumber = val - 0;
    // needed since toString does not zero fill on left
    var template = "#000000";
    // in the MS Windows world RGB colors
    // are 0xBBGGRR because of the way Intel chips store bytes
    let red = (intnumber & 0x0000ff) << 16;
    let green = intnumber & 0x00ff00;
    let blue = (intnumber & 0xff0000) >>> 16;
    // mask out each color and reverse the order
    intnumber = red | green | blue;
    // toString converts a number to a hexstring
    let HTMLcolor: string = intnumber.toString(16);
    //template adds # for standard HTML #RRGGBB
    HTMLcolor = template.substring(0, 7 - HTMLcolor.length) + HTMLcolor;
    return HTMLcolor;
}