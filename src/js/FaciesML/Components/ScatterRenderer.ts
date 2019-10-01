import { DisplayType } from "../Types/DataValues";
import { DataValues } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";
import { RenderWindow } from "./RenderWindow";

const LAYOUT_CANVAS_HEIGHT: number = 600;
const LAYOUT_CANVAS_WIDTH: number = 600;
const LAYOUT_SCATTRER_X: number = 20;
const LAYOUT_SCATTRER_Y: number = 20;
const LAYOUT_SCATTRER_WIDTH: number = 560;
const LAYOUT_SCATTRER_HEIGHT: number = 560;

// RenderWindow


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
    // render properties
    private renderWindow: RenderWindow = null;
    // draggind
    private draggingStarted: boolean = false;
    private mousePrevDragX: number = 0.0;
    private mousePrevDragY: number = 0.0;
    // visibility
    private dataValuesVisible: boolean = false;
    private dataSamplesVisible: boolean = false;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // constructor
    constructor(parent: HTMLDivElement) {
        this.parent = parent;
        // display type
        this.displayTypeX = DisplayType.LINEAR;
        this.displayTypeY = DisplayType.LINEAR;
        // axis data
        this.dataValuesAxisX = null;
        this.dataValuesAxisY = null;
        this.dataFacies = null;
        this.dataSamples = null;
        // render properties
        this.renderWindow = new RenderWindow();
        // draggind
        this.draggingStarted = false;
        this.mousePrevDragX = 0.0;
        this.mousePrevDragY = 0.0;
        // visibility
        this.dataValuesVisible = true;
        this.dataSamplesVisible = true;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.onmouseup = this.onMouseUp.bind(this);
        this.layoutCanvas.onmousemove = this.onMouseMove.bind(this);
        this.layoutCanvas.onmousedown = this.onMouseDown.bind(this);
        this.layoutCanvas.onwheel = this.onMouseWheel.bind(this);
        this.layoutCanvas.ondblclick = this.onMouseDoubleClick.bind(this);
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parent.appendChild(this.layoutCanvas);
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
            let scaleCoefX = this.renderWindow.width / this.layoutCanvas.width / this.renderWindow.scale;
            let scaleCoefY = this.renderWindow.height / this.layoutCanvas.height / this.renderWindow.scale;
            this.renderWindow.centerX += mouseDeltaX * scaleCoefX;
            this.renderWindow.centerY -= mouseDeltaY * scaleCoefY;
            // store new mouse coords
            this.mousePrevDragX = event.screenX;
            this.mousePrevDragY = event.screenY;
            this.drawScatter();
        }
    }

    // onMouseDown
    public onMouseDown(event: MouseEvent): void {
        this.draggingStarted = true;
        // set mouse base coords
        this.mousePrevDragX = event.screenX;
        this.mousePrevDragY = event.screenY;
    }

    // onMouseWheel
    public onMouseWheel(event: WheelEvent): void {
        this.renderWindow.scale *= Math.pow(1.1, -event.deltaY / 100);
        this.drawScatter();
    }

    // onMouseDoubleClick
    public onMouseDoubleClick(event: MouseEvent): void {
        this.renderWindow.reset(this.dataValuesAxisX, this.dataValuesAxisY);
        this.drawScatter();
        event.stopPropagation();
    }

    // setDisplayTypeX
    public setDisplayTypeX(displayType: DisplayType): void {
        if (this.displayTypeX !== displayType) {
            this.displayTypeX = displayType;
        }
    }

    // setDisplayTypeY
    public setDisplayTypeY(displayType: DisplayType): void {
        if (this.displayTypeY !== displayType) {
            this.displayTypeY = displayType;
        }
    }

    // setDisplayTypeX
    public setDataValuesAxisX(dataValues: DataValues): void {
        if (this.dataValuesAxisX !== dataValues) {
            this.dataValuesAxisX = dataValues;
            this.renderWindow.reset(this.dataValuesAxisX, this.dataValuesAxisY);
        }
    }

    // setDisplayTypeY
    public setDataValuesAxisY(dataValues: DataValues): void {
        if (this.dataValuesAxisY !== dataValues) {
            this.dataValuesAxisY = dataValues;
            this.renderWindow.reset(this.dataValuesAxisX, this.dataValuesAxisY);
        }
    }

    // setDataFacies
    public setDataFacies(dataFacies: DataFacies): void {
        if (this.dataFacies !== dataFacies) {
            this.dataFacies = dataFacies;
        }
    }

    // setDataSamples
    public setDataSamples(dataSamples: DataSamples): void {
        if (this.dataSamples !== dataSamples) {
            this.dataSamples = dataSamples;
        }
    }

    // setDataValuesVisible
    public setDataValuesVisible(visible: boolean) {
        this.dataValuesVisible = visible;
    }

    // setDataSamplesVisible
    public setDataSamplesVisible(visible: boolean) {
        this.dataSamplesVisible = visible;
    }

    // drawScatter
    public drawScatter(): void {
        // set canvas size
        this.layoutCanvas.height = LAYOUT_CANVAS_HEIGHT;
        this.layoutCanvas.width = LAYOUT_CANVAS_WIDTH;
        // clear scatter
        this.clearScatter();
        this.drawScatterBorders();
        this.drawAxisNameX();
        this.drawAxisNameY();
        this.drawFaciesName();
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
        // get scatter metrics
        let scatterX = LAYOUT_SCATTRER_X;
        let scatterY = LAYOUT_SCATTRER_Y;
        let scatterWidth = LAYOUT_SCATTRER_WIDTH;
        let scatterHeight = LAYOUT_SCATTRER_HEIGHT;
        // draw values
        if (this.dataValuesAxisX && this.dataValuesAxisY && this.dataFacies) {
            // draw values ony by one
            for (let i = 0; i < this.dataValuesAxisX.values.length; i++) {
                let dataValueX = this.dataValuesAxisX.values[i];
                let dataValueY = this.dataValuesAxisY.values[i];
                let pointX = +this.renderWindow.transfromX(dataValueX);
                let pointY = -this.renderWindow.transfromY(dataValueY);
                if (isInRange(pointX, -1, 1) && isInRange(pointY, -1, 1)) {
                    let x = pointX * scatterWidth / 2 + scatterWidth / 2 + scatterX;
                    let y = pointY * scatterHeight / 2 + scatterHeight / 2 + scatterY;
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

    // drawSamples
    private drawSamples(): void {
        // get scatter metrics
        let scatterX = LAYOUT_SCATTRER_X;
        let scatterY = LAYOUT_SCATTRER_Y;
        let scatterWidth = LAYOUT_SCATTRER_WIDTH;
        let scatterHeight = LAYOUT_SCATTRER_HEIGHT;
        // draw values
        if (this.dataValuesAxisX && this.dataValuesAxisY && this.dataFacies && this.dataSamples) {
            // draw values ony by one
            for (let i = 0; i < this.dataSamples.values.length; i++) {
                if (this.dataSamples.values[i] > 0) {
                    let dataValueX = this.dataValuesAxisX.values[i];
                    let dataValueY = this.dataValuesAxisY.values[i];
                    let pointX = +this.renderWindow.transfromX(dataValueX);
                    let pointY = -this.renderWindow.transfromY(dataValueY);
                    if (isInRange(pointX, -1, 1) && isInRange(pointY, -1, 1)) {
                        let x = pointX * scatterWidth / 2 + scatterWidth / 2 + scatterX;
                        let y = pointY * scatterHeight / 2 + scatterHeight / 2 + scatterY;
                        this.layoutCanvasCtx.beginPath();
                        this.layoutCanvasCtx.arc(x, y, 3, 0, 2 * Math.PI, false);
                        this.layoutCanvasCtx.fillStyle = this.dataFacies.colorTable[this.dataFacies.valuesDisplay[i]];
                        this.layoutCanvasCtx.fill();
                        this.layoutCanvasCtx.lineWidth = 1;
                        this.layoutCanvasCtx.strokeStyle = "black";
                        this.layoutCanvasCtx.stroke();
                    }
                }
            }
        }
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
    return a * (t - 1) + b * t;
}

// isInRange
function isInRange(value: number, min: number, max: number): boolean {
    return (value >= min) && (value <= max);
}