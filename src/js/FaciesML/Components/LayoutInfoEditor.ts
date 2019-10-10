import { LayoutInfo } from "../Types/LayoutInfo";
import { SelectionMode } from "../Types/SelectionMode";
import { DataValues, DATA_MINIMAL_VALUE, DisplayType } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";
import { FaciesPopup } from "./FaciesPopup";

const LAYOUT_HEADER_HEIGHT: number = 50;
const LAYOUT_LEGENT_HEIGHT: number = 100;
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
    private faciesPopup: FaciesPopup;
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
    private layoutMaskCanvas: HTMLCanvasElement = null;
    private layoutMaskCanvasCtx: CanvasRenderingContext2D = null;
    // menus
    private menuFacies: HTMLDivElement = null;
    // events
    public onColorChanged: (this: LayoutInfoEditor, dataFacies: DataFacies) => any = null;
    public onSelectionChanged: (this: LayoutInfoEditor, layoutInfo: LayoutInfo) => any = null;
    // constructor
    constructor(
        parentTitle: HTMLDivElement,
        parentHeadrs: HTMLDivElement,
        parentPlots: HTMLDivElement,
        faciesPopup: FaciesPopup) {
        // setup parent
        this.parentTitle = parentTitle;
        this.parentHeadrs = parentHeadrs;
        this.parentPlots = parentPlots;
        this.faciesPopup = faciesPopup;
        this.enabled = true;
        // image parameters
        this.layoutInfo = null;
        this.scale = 1.0;
        // selection
        this.selectionStarted = false;
        this.selectionMode = SelectionMode.ADD;
        this.selectionStart = 0;
        this.selectionEnd = 0;
        // get menus
        this.menuFacies = document.getElementById("menuFacies") as HTMLDivElement;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.onmouseup = this.onMouseUp.bind(this);
        this.layoutCanvas.onmousemove = this.onMouseMove.bind(this);
        this.layoutCanvas.onmousedown = this.onMouseDown.bind(this);
        this.layoutCanvas.style.cursor = "row-resize";
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parentPlots.appendChild(this.layoutCanvas);
        this.layoutMaskCanvas = document.createElement("canvas");
        this.layoutMaskCanvasCtx = this.layoutMaskCanvas.getContext('2d');
        //this.parentPlots.appendChild(this.layoutMaskCanvas);
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
                this.onSelectionChanged && this.onSelectionChanged(this.layoutInfo);
            } else if (this.selectionMode === SelectionMode.REMOVE) {
                this.layoutInfo.dataTable.selections.fill(0, this.selectionStart, this.selectionEnd);
                this.onSelectionChanged && this.onSelectionChanged(this.layoutInfo);
            }
            this.selectionStarted = false;
            // redraw stuff
            this.drawCanvas();
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
            this.drawCanvas();
            this.drawSelectionRange();
        }

        // get bounding client rect
        let rect = this.layoutCanvas.getBoundingClientRect();
        let mousePosX = event.clientX - rect.left;
        let mousePosY = event.clientY - rect.top;
        // check for high resolution region
        let index = this.getMaskValueByCoord(mousePosX, mousePosY);
        if (index >= 0) {
            let faciesDataIndex = Math.trunc(index/1e6);
            let sampleDataIndex = Math.trunc((index%1e6)/1e4);
            let sampleIndex = Math.trunc(index%1000);
        }
    }

    // onMouseDown
    public onMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return;
        if (!this.enabled) return;
        // get bounding client rect
        let rect = this.layoutCanvas.getBoundingClientRect();
        let mousePosX = event.clientX - rect.left;
        let mousePosY = event.clientY - rect.top;
        // check for high resolution region
        let index = this.getMaskValueByCoord(mousePosX, mousePosY);
        if (index >= 0) {
            let faciesDataIndex = Math.trunc(index/1e6);
            let sampleDataIndex = Math.trunc((index%1e6)/1e4);
            let sampleIndex = Math.trunc(index%1000);
            if (this.faciesPopup) {
                this.faciesPopup.setDataFacies(this.layoutInfo.dataTable.dataFacies[faciesDataIndex]);
                this.faciesPopup.setDataSamples(this.layoutInfo.dataTable.dataFacies[faciesDataIndex].dataSamples[sampleDataIndex]);
                this.faciesPopup.setDataSamplesIndex(sampleIndex);
                this.faciesPopup.show(event.pageX, event.pageY);
            }
        }
        else {
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

    // onButtonDataValuesLogClick
    private onButtonDataValuesLogClick(event: Event) {
        let dataValues: DataValues = event.target["dataValues"] as DataValues;
        if (dataValues.displayType === DisplayType.LINEAR)
            dataValues.displayType = DisplayType.LOG;
        else if (dataValues.displayType === DisplayType.LOG)
            dataValues.displayType = DisplayType.LINEAR;
        this.drawCanvas();
    }

    // onInputDisplayValueMinChange
    private onInputDisplayValueMinChange(event: Event) {
        let dataValues: DataValues = event.target["dataValues"] as DataValues;
        let newValue: number = parseFloat((event.target as HTMLInputElement).value);
        dataValues.displayMin = Math.min(Math.max(newValue, dataValues.min), dataValues.displayMax);
        this.drawCanvas();
    }

    // onInputDisplayValueMaxChange
    private onInputDisplayValueMaxChange(event: Event) {
        let dataValues: DataValues = event.target["dataValues"] as DataValues;
        let newValue: number = parseFloat((event.target as HTMLInputElement).value);
        dataValues.displayMax = Math.min(Math.max(newValue, dataValues.displayMin), dataValues.max);
        this.drawCanvas();
    }

    // onInputSelectRangeMinChange
    private onInputSelectRangeMinChange(event: Event) {
        let dataValues: DataValues = event.target["dataValues"] as DataValues;
        let newValue: number = parseFloat((event.target as HTMLInputElement).value);
        dataValues.selectRangeMin = Math.min(Math.max(newValue, dataValues.min), dataValues.selectRangeMax);
        this.drawCanvas();
    }

    // onInputSelectRangeMaxChange
    private onInputSelectRangeMaxChange(event: Event) {
        let dataValues: DataValues = event.target["dataValues"] as DataValues;
        let newValue: number = parseFloat((event.target as HTMLInputElement).value);
        dataValues.selectRangeMax = Math.min(Math.max(newValue, dataValues.selectRangeMin), dataValues.max);
        this.drawCanvas();
    }

    // onButtonRangeSelectClick
    private onButtonRangeSelectClick(event: Event) {
        let dataValues: DataValues = event.target["dataValues"] as DataValues;
        //this.layoutInfo.dataTable.selections.fill(0);
        for (let i = 0; i < dataValues.values.length; i++) {
            if (((dataValues.values[i] > dataValues.selectRangeMax) ||
                (dataValues.values[i] < dataValues.selectRangeMin)) &&
                (this.layoutInfo.dataTable.selections[i] > 0)) {
                this.layoutInfo.dataTable.selections[i] = 0;
            }
        }
        this.drawCanvas();
        this.onSelectionChanged && this.onSelectionChanged(this.layoutInfo);
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
        if (this.layoutInfo) {
            this.updateHeaders();
            this.drawCanvas();
        }
    }

    // updateHeaders
    private updateHeaders(): void {
        if (this.layoutInfo) {
            this.clearHeaders();
            // draw depth
            this.addHeaderBase(this.layoutInfo.dataTable.dataValues[0]);
            // draw selected data values
            for (let dataValues of this.layoutInfo.dataTable.dataValues) {
                // add value header
                if (dataValues.selected)
                    this.addHeader(dataValues);
            }
            // draw selected datafacies
            for (let dataFacies of this.layoutInfo.dataTable.dataFacies) {
                // add facies header
                if (dataFacies.selected)
                    this.addHeaderFacie(dataFacies);
                // add samples header
                for (let dataSamples of dataFacies.dataSamples) {
                    if (dataSamples.selected)
                        this.addHeaderSamples(dataSamples);
                }
            }
        }
    }

    // drawCanvas
    private drawCanvas() {
        if (!this.layoutInfo) return;
        this.parentTitle.innerText = this.layoutInfo.dataTable.name;
        let columsCount = this.layoutInfo.dataTable.getSelectedCount();
        this.layoutCanvas.width = (columsCount + 1) * LAYOUT_COLUMN_WIDTH;
        this.layoutCanvas.height = (this.layoutInfo.dataTable.dataValues[0].values.length) * this.scale;
        this.layoutMaskCanvas.width = (columsCount + 1) * LAYOUT_COLUMN_WIDTH;
        this.layoutMaskCanvas.height = (this.layoutInfo.dataTable.dataValues[0].values.length) * this.scale;
        this.clearCanvas();
        // draw data ranges
        this.drawLayoutInfoSelections(0);
        // draw depth
        this.drawYAxis(this.layoutInfo.dataTable.dataValues[0], 0, 0);
        // draw selected data values
        let columnIndex = 1;
        for (let dataValues of this.layoutInfo.dataTable.dataValues) {
            if (dataValues.selected) {
                this.drawGrid(dataValues, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                this.drawSelectionRanges(dataValues, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                this.drawPlot(dataValues, columnIndex * LAYOUT_COLUMN_WIDTH, 0, gColorTable[columnIndex]);
                columnIndex++;
            }
        }
        // draw selected datafacies
        for (let dataFacies of this.layoutInfo.dataTable.dataFacies) {
            if (dataFacies.selected) {
                this.drawFacies(dataFacies, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                columnIndex++;
            }
            // add samples
            for (let dataSamples of dataFacies.dataSamples) {
                if (dataSamples.selected) {
                    this.drawGridFacies(dataSamples.values, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
                    this.drawSamples(dataFacies, dataSamples, columnIndex * LAYOUT_COLUMN_WIDTH, 0);
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
        this.layoutCanvasCtx.globalAlpha = 1.0;
    }

    // clearCanvas
    private clearCanvas() {
        this.layoutCanvasCtx.globalAlpha = 1.0;
        this.layoutCanvasCtx.fillStyle = "white";
        this.layoutCanvasCtx.fillRect(0, 0, this.layoutCanvas.width, this.layoutCanvas.height);
        this.layoutMaskCanvasCtx.globalAlpha = 0.0;
        this.layoutMaskCanvasCtx.fillStyle = "blue";
        this.layoutMaskCanvasCtx.fillRect(0, 0, this.layoutCanvas.width, this.layoutCanvas.height);
    }

    // addHeader
    private addHeader(dataValues: DataValues): void {
        // legend sizes
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;
        // create header
        let divHeader = document.createElement("div");
        divHeader.style.cssText = `display: flex; flex-direction: column; width:${legendWidth}px; border: 1px solid black`;
        this.parentHeadrs.appendChild(divHeader);

        // create headre elements
        divHeader.innerHTML = `
        <div style="display: flex; flex-direction: row-reverse">
            <button id="buttonDataValuesLog${dataValues.name}">L</button>
        </div>
        <div style="text-align: center; border-bottom: 1px solid black">${dataValues.name}</div>
        <div style="display: flex; flex-direction: row">
            <input id="inputDisplayValueMin${dataValues.name}" type="text" style="border: none; width: 100%; text-align: center;" value="${dataValues.displayMin.toFixed(2)}"></input>
            <div style="text-align: center; border-right: 1px solid black; border-left: 1px solid black;">${dataValues.unit}</div>
            <input id="inputDisplayValueMax${dataValues.name}" type="text" style="border: none; width: 100%; text-align: center;" value="${dataValues.displayMax.toFixed(2)}"></input>
        </div>
        <div style="display: flex; flex-direction: row; border-top: 1px solid black">
            <input 
                id="inputRangeValueMin${dataValues.name}" type="range"
                style="border: none; width: 100%;
                min="${dataValues.min}" max="${dataValues.max}" step="${(dataValues.max - dataValues.min) / 100}"
                value="${dataValues.selectRangeMin}">
            </input>
        </div>
        <div style="display: flex; flex-direction: row; border-top: 1px solid black">
            <input 
                id="inputRangeValueMax${dataValues.name}" type="range"
                style="border: none; width: 100%;
                min="${dataValues.min}" max="${dataValues.max}" step="${(dataValues.max - dataValues.min) / 100}"
                value="${dataValues.selectRangeMax}">
            </input>
        </div>
        <div style="display: flex; flex-direction: row; border-top: 1px solid black">
            <button style="width: 100%" id="buttonRangeSelect${dataValues.name}">Apply</button>
        </div>`;

        // get created elements
        let buttonDataValuesLog = document.getElementById(`buttonDataValuesLog${dataValues.name}`) as HTMLButtonElement;
        let inputDisplayValueMin = document.getElementById(`inputDisplayValueMin${dataValues.name}`) as HTMLInputElement;
        let inputDisplayValueMax = document.getElementById(`inputDisplayValueMax${dataValues.name}`) as HTMLInputElement;
        let inputRangeValueMin = document.getElementById(`inputRangeValueMin${dataValues.name}`) as HTMLInputElement;
        let buttonRangeSelect = document.getElementById(`buttonRangeSelect${dataValues.name}`) as HTMLButtonElement;
        let inputRangeValueMax = document.getElementById(`inputRangeValueMax${dataValues.name}`) as HTMLInputElement;
        // setup created elements
        buttonDataValuesLog["dataValues"] = dataValues;
        inputDisplayValueMin["dataValues"] = dataValues;
        inputDisplayValueMax["dataValues"] = dataValues;
        inputRangeValueMin["dataValues"] = dataValues;
        buttonRangeSelect["dataValues"] = dataValues;
        inputRangeValueMax["dataValues"] = dataValues;
        // setup events
        buttonDataValuesLog.onclick = this.onButtonDataValuesLogClick.bind(this);
        inputDisplayValueMin.onchange = this.onInputDisplayValueMinChange.bind(this);
        inputDisplayValueMax.onchange = this.onInputDisplayValueMaxChange.bind(this);
        inputRangeValueMin.oninput = this.onInputSelectRangeMinChange.bind(this);
        inputRangeValueMax.oninput = this.onInputSelectRangeMaxChange.bind(this);
        buttonRangeSelect.onclick = this.onButtonRangeSelectClick.bind(this);
    }

    // addHeaderBase
    private addHeaderBase(dataValues: DataValues): void {
        // legend sizes
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;
        // create header
        let divHeader = document.createElement("div");
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.display = "flex";
        divHeader.style.flexDirection = "column";
        divHeader.style.border = "1px solid black";
        divHeader.style.textAlign = "center";
        this.parentHeadrs.appendChild(divHeader);

        // create headre elements
        divHeader.innerHTML = `
        <div style="text-align: center; border-bottom: 1px solid black; heigth: 100%">${dataValues.name}</div>
        <div style="display: flex; flex-direction: row; height: 100%;">
            <div id="inputDisplayValueMin${dataValues.name}" style="border: none; width: 100%; text-align: center;">${dataValues.displayMin.toFixed(2)}</div>
            <div style="text-align: center; border-right: 1px solid black; border-left: 1px solid black;">${dataValues.unit}</div>
            <div id="inputDisplayValueMax${dataValues.name}" style="border: none; width: 100%; text-align: center;">${dataValues.displayMax.toFixed(2)}</div>
        </div>`;
    }

    // addHeaderFacie
    private addHeaderFacie(dataFacies: DataFacies): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;

        // create header
        let divHeader = document.createElement("div");
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
        let buttonSaveImage = document.createElement("button");
        buttonSaveImage.innerText = "S";
        buttonSaveImage["dataFacies"] = dataFacies;
        buttonSaveImage.onclick = (event => {
            let dataFacies: DataFacies = event.target["dataFacies"] as DataFacies;
            this.saveFaciesToImage(dataFacies);
            this.drawLayoutInfo();
        }).bind(this);
        divControls.appendChild(buttonSaveImage);

        // create header name
        let divHeaderName = document.createElement("div");
        divHeaderName.style.width = legendWidth.toString() + "px";
        divHeaderName.style.textAlign = "center";
        divHeaderName.innerText = dataFacies.name;
        divHeader.appendChild(divHeaderName);

        // create header color table
        let divHeaderColorTable = document.createElement("div");
        divHeaderColorTable.style.width = legendWidth.toString() + "px";
        divHeaderColorTable.style.height = "auto";
        divHeaderColorTable.style.display = "flex";
        divHeaderColorTable.style.flexDirection = "row";
        divHeaderColorTable.style.width = "100%";
        divHeaderColorTable.style.height = "100%";
        divHeaderColorTable.style.background = "red";
        divHeader.appendChild(divHeaderColorTable);
        // let samples count 
        let faciesCount = Math.max(...dataFacies.values) + 1;
        for (let i = 0; i < faciesCount; i++) {
            // create header color table
            let divHeaderColor = document.createElement("div");
            divHeaderColor.style.flexGrow = "1";
            divHeaderColor.style.width = "auto";
            divHeaderColor.style.background = dataFacies.colorTable[i];
            divHeaderColor["dataFacies"] = dataFacies;
            divHeaderColor["colorIndex"] = i;
            divHeaderColor.onclick = (event => {
                let dataFacies: DataFacies = event.target["dataFacies"];
                let colorIndex: number = event.target["colorIndex"];
                // input color
                let inputColor = document.createElement("input");
                inputColor.type = "color";
                inputColor.value = dataFacies.colorTable[colorIndex];
                inputColor["dataFacies"] = dataFacies;
                inputColor["colorIndex"] = colorIndex;
                inputColor.oninput = ((event) => {
                    let dataFacies: DataFacies = event.target["dataFacies"];
                    let colorIndex: number = event.target["colorIndex"];
                    dataFacies.colorTable[colorIndex] = event.target["value"];
                    this.onColorChanged && this.onColorChanged(dataFacies);
                    this.drawLayoutInfo();
                }).bind(this);
                inputColor.style.display = "none";
                document.body.appendChild(inputColor);
                inputColor.click();

                this.drawLayoutInfo();
            }).bind(this);
            divHeaderColorTable.appendChild(divHeaderColor);
        }
    }

    // addHeaderSamples
    private addHeaderSamples(dataSamples: DataSamples): void {
        // legend sizes
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH - 2;
        let divHeader = document.createElement("div");
        divHeader.style.width = legendWidth.toString() + "px";
        divHeader.style.border = "1px solid black";
        divHeader.style.textAlign = "center";
        divHeader.innerText = dataSamples.name;
        this.parentHeadrs.appendChild(divHeader);
    }

    // drawSelectionRanges
    private drawSelectionRanges(dataValues: DataValues, x: number, y: number): void {
        // start drawing
        let numSections = Math.floor(Math.log10(dataValues.max)) + 1;
        this.layoutCanvasCtx.translate(x, y);
        let valueMin = dataValues.selectRangeMin;
        let valueMax = dataValues.selectRangeMax;
        let xPointMin = valueMin;
        let xPointMax = valueMax;
        if (dataValues.displayType === DisplayType.LINEAR) {
            xPointMin = (valueMin - dataValues.displayMin) / (dataValues.displayMax - dataValues.displayMin);
            xPointMax = (valueMax - dataValues.displayMin) / (dataValues.displayMax - dataValues.displayMin);
            xPointMin = Math.min(1.0, Math.max(0.0, xPointMin)) * LAYOUT_COLUMN_WIDTH;
            xPointMax = Math.min(1.0, Math.max(0.0, xPointMax)) * LAYOUT_COLUMN_WIDTH;
        }
        else if (dataValues.displayType === DisplayType.LOG) {
            xPointMin = Math.log10(valueMin) / numSections;
            xPointMax = Math.log10(valueMax) / numSections;
            xPointMin = Math.min(1.0, Math.max(0.0, xPointMin)) * LAYOUT_COLUMN_WIDTH;
            xPointMax = Math.min(1.0, Math.max(0.0, xPointMax)) * LAYOUT_COLUMN_WIDTH;
        }
        this.layoutCanvasCtx.beginPath();
        this.layoutCanvasCtx.strokeStyle = "#888888";
        this.layoutCanvasCtx.lineWidth = 2;
        this.layoutCanvasCtx.moveTo(xPointMin, 0);
        this.layoutCanvasCtx.lineTo(xPointMin, this.layoutCanvas.height * this.scale);
        this.layoutCanvasCtx.moveTo(xPointMax, 0);
        this.layoutCanvasCtx.lineTo(xPointMax, this.layoutCanvas.height * this.scale);
        this.layoutCanvasCtx.stroke();
        this.layoutCanvasCtx.translate(-x, -y);
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
        for (let i = 0; i < dataFacies.valuesDisplay.length; i++) {
            this.layoutCanvasCtx.strokeStyle = "white";
            if (dataFacies.valuesDisplay[i] >= 0)
                this.layoutCanvasCtx.strokeStyle = dataFacies.colorTable[dataFacies.valuesDisplay[i]];
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
    private drawSamples(dataFacies: DataFacies, dataSamples: DataSamples, x: number, y: number): void {
        this.layoutCanvasCtx.translate(x, y);
        this.layoutMaskCanvasCtx.translate(x, y);
        let dataFaciesIndex = this.layoutInfo.dataTable.dataFacies.findIndex(value => value === dataFacies);
        let dataSamplesIndex = dataFacies.dataSamples.findIndex(value => value === dataSamples);
        for (let i = 0; i < dataSamples.values.length; i++) {
            if (dataSamples.values[i] > 0) {
                let dataSampleValue = dataFaciesIndex * 1e6 + dataSamplesIndex * 1e4 + i;
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
                this.layoutMaskCanvasCtx.beginPath();
                this.layoutMaskCanvasCtx.arc(10, i * this.scale, 5, 0, 2 * Math.PI);
                this.layoutMaskCanvasCtx.strokeStyle = decimalColorToHTMLcolor(dataSampleValue);
                this.layoutMaskCanvasCtx.fillStyle = decimalColorToHTMLcolor(dataSampleValue);
                this.layoutMaskCanvasCtx.globalAlpha = 1;
                this.layoutMaskCanvasCtx.fill();
            }
        }
        this.layoutMaskCanvasCtx.translate(-x, -y);
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
        this.layoutCanvasCtx.lineWidth = 2;
        this.layoutCanvasCtx.strokeStyle = "#DDDDDD";
        this.layoutCanvasCtx.fillStyle = "#DDDDDD";
        this.layoutCanvasCtx.beginPath();
        for (let i = LAYOUT_AXES_HINT_STEP; i < dataValues.values.length; i += LAYOUT_AXES_HINT_STEP) {
            this.layoutCanvasCtx.moveTo(0, i * this.scale);
            this.layoutCanvasCtx.lineTo(LAYOUT_COLUMN_WIDTH, i * this.scale);
        }
        this.layoutCanvasCtx.stroke();
        if (dataValues.displayType === DisplayType.LINEAR) {
            // empty
        }
        else if (dataValues.displayType === DisplayType.LOG) {
            let numSections = Math.floor(Math.log10(dataValues.max)) + 1;
            this.layoutCanvasCtx.lineWidth = 2;
            for (let i = 0; i < numSections; i++) {
                for (let j = 1; j < 10; j++) {
                    let value0 = Math.pow(10, i) * j;
                    let xPoint0 = Math.log10(value0) / numSections;
                    this.layoutCanvasCtx.strokeStyle = "#DDDDDD";
                    this.layoutCanvasCtx.fillStyle = "#DDDDDD";
                    this.layoutCanvasCtx.beginPath();
                    this.layoutCanvasCtx.moveTo(xPoint0 * LAYOUT_COLUMN_WIDTH, 0);
                    this.layoutCanvasCtx.lineTo(xPoint0 * LAYOUT_COLUMN_WIDTH, dataValues.values.length * this.scale);
                    this.layoutCanvasCtx.stroke();
                }
                for (let j = LAYOUT_AXES_HINT_STEP; j < dataValues.values.length; j += LAYOUT_AXES_HINT_STEP * 2) {
                    let value0 = Math.pow(10, i);
                    let xPoint0 = Math.log10(value0) / numSections;
                    this.layoutCanvasCtx.textBaseline = "bottom";
                    this.layoutCanvasCtx.textAlign = "center";
                    this.layoutCanvasCtx.font = "12px Arial";
                    this.layoutCanvasCtx.strokeStyle = "black";
                    this.layoutCanvasCtx.fillStyle = "black";
                    this.layoutCanvasCtx.beginPath();
                    this.layoutCanvasCtx.fillText(value0.toString(), xPoint0 * LAYOUT_COLUMN_WIDTH, j * this.scale);
                    this.layoutCanvasCtx.stroke();
                    this.layoutCanvasCtx.strokeStyle = "#BBBBBB";
                    this.layoutCanvasCtx.fillStyle = "#BBBBBB";
                    this.layoutCanvasCtx.beginPath();
                    this.layoutCanvasCtx.moveTo(xPoint0 * LAYOUT_COLUMN_WIDTH, 0);
                    this.layoutCanvasCtx.lineTo(xPoint0 * LAYOUT_COLUMN_WIDTH, dataValues.values.length * this.scale);
                    this.layoutCanvasCtx.stroke();
                }
            }
        }

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

    // getMaskValueByCoord
    public getMaskValueByCoord(x: number, y: number): number {
        let layoutMaskCanvasData = this.layoutMaskCanvasCtx.getImageData(0, 0, this.layoutMaskCanvas.width, this.layoutMaskCanvas.height);
        let r = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 0];
        let g = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 1];
        let b = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 2];
        let a = layoutMaskCanvasData.data[y * this.layoutMaskCanvas.width * 4 + x * 4 + 3];
        if (a === 255)
            return b << 16 | g << 8 | r;
        else
            return -1;
    }

    // saveFaciesToImage
    private saveFaciesToImage(dataFacies: DataFacies): void {
        if (!dataFacies) return;
        let legendHeight = LAYOUT_LEGENT_HEIGHT;
        let legendWidth = LAYOUT_COLUMN_WIDTH;

        // create canvas
        let canvasFacies: HTMLCanvasElement = document.createElement("canvas");
        canvasFacies.width = LAYOUT_COLUMN_WIDTH;
        canvasFacies.height = LAYOUT_LEGENT_HEIGHT + dataFacies.valuesDisplay.length * this.scale;
        // get context
        let canvasFaciesCtx = canvasFacies.getContext("2d");
        // draw header background
        canvasFaciesCtx.beginPath();
        canvasFaciesCtx.fillStyle = "white";
        canvasFaciesCtx.fillRect(0, 0, legendWidth, legendHeight);
        canvasFaciesCtx.stroke();
        // draw title
        canvasFaciesCtx.textBaseline = "middle";
        canvasFaciesCtx.textAlign = "center";
        canvasFaciesCtx.font = "20px Arial";
        canvasFaciesCtx.strokeStyle = "black";
        canvasFaciesCtx.fillStyle = "black";
        canvasFaciesCtx.fillText(dataFacies.name, legendWidth * 0.5, legendHeight * 0.25);
        // draw color map
        let faciesCount = Math.max(...dataFacies.values) + 1;
        for (let i = 0; i < faciesCount; i++) {
            // draw header background
            canvasFaciesCtx.beginPath();
            canvasFaciesCtx.fillStyle = dataFacies.colorTable[i];
            canvasFaciesCtx.fillRect(i * legendWidth / faciesCount, legendHeight / 2, legendWidth / faciesCount, legendHeight / 2);
            canvasFaciesCtx.stroke();
        }
        // draw facies
        for (let i = 0; i < dataFacies.valuesDisplay.length; i++) {
            this.layoutCanvasCtx.strokeStyle = "white";
            if (dataFacies.valuesDisplay[i] >= 0)
                canvasFaciesCtx.strokeStyle = dataFacies.colorTable[dataFacies.valuesDisplay[i]];
            let yBeg = i * this.scale + LAYOUT_LEGENT_HEIGHT;
            let yEnd = Math.max(yBeg, (i + 1) * this.scale + LAYOUT_LEGENT_HEIGHT);
            for (let y = yBeg; y <= yEnd; y++) {
                canvasFaciesCtx.beginPath();
                canvasFaciesCtx.moveTo(0, y)
                canvasFaciesCtx.lineTo(LAYOUT_COLUMN_WIDTH, y)
                canvasFaciesCtx.stroke();
            }
        }
        // download image
        downloadImage(dataFacies.name, canvasFacies);
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

// downloadImage
function downloadImage(name: string, canvas: HTMLCanvasElement) {
    var link = document.createElement('a');
    link.download = name + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
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