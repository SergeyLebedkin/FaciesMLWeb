import { LayoutInfo } from "../Types/LayoutInfo";
import { DataValues } from "../Types/DataValues";
import { DisplayType } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { ScatterRenderer } from "./ScatterRenderer";
import { FaciesPopup } from "./FaciesPopup";

// ScatterEditor
export class ScatterEditor {
    // parents
    private parentHeadrs: HTMLDivElement;
    // axis selects
    private selectXAxis: HTMLSelectElement = null;
    private selectYAxis: HTMLSelectElement = null;
    private selectFacies: HTMLSelectElement = null;
    private selectSamples: HTMLSelectElement = null;
    // draw checkboxes
    private checkboxDrawValues: HTMLInputElement = null;
    private checkboxDrawSamples: HTMLInputElement = null;
    // merge controls
    private selectFrom: HTMLSelectElement = null;
    private selectTo: HTMLSelectElement = null;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    // scatter renderer
    private scatterRenderer: ScatterRenderer;
    // events
    public onFaciesMerged: (this: ScatterEditor, dataFacies: DataFacies) => any = null;
    // constructor
    constructor(parentHeadrs: HTMLDivElement, parentScatter: HTMLDivElement) {
        // setup parent
        this.parentHeadrs = parentHeadrs;
        // image parameters
        this.layoutInfo = null;
        // scatter renderer
        this.scatterRenderer = new ScatterRenderer(parentScatter);

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
            <div style="display: flex; flex-direction: row;">
                <input type="checkbox" id="checkboxDrawValues" checked></select>
                <label for="checkboxDrawValues">Draw values</label>
            </div>
            <div style="display: flex; flex-direction: row;">
                <input type="checkbox" id="checkboxDrawSamples" checked></select>
                <label for="checkboxDrawSamples">Draw Samples</label>
            </div>
            <div><hr></div>
            <div style="display: flex; flex-direction: row;">
                <button id="buttonUndo">Undo</button>
                <label class="select-label">From:</label>
                <select class="select-axis" id="selectFrom"></select>
                <label class="select-label">To:</label>
                <select class="select-axis" id="selectTo"></select>
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
        this.checkboxDrawValues = document.getElementById("checkboxDrawValues") as HTMLInputElement;
        this.checkboxDrawSamples = document.getElementById("checkboxDrawSamples") as HTMLInputElement;
        this.selectFrom = document.getElementById("selectFrom") as HTMLSelectElement;
        this.selectTo = document.getElementById("selectTo") as HTMLSelectElement;
        let buttonUndo: HTMLButtonElement = document.getElementById("buttonUndo") as HTMLButtonElement;
        let buttonApply: HTMLButtonElement = document.getElementById("buttonApply") as HTMLButtonElement;

        // get elements events
        buttonSaveImage.onclick = this.onButtonSaveImageClick.bind(this);
        buttonDisplayTypeX.onclick = this.onButtonDisplayTypeXClick.bind(this);
        buttonDisplayTypeY.onclick = this.onButtonDisplayTypeYClick.bind(this);
        this.selectXAxis.onchange = this.onSelectXAxisChange.bind(this);
        this.selectYAxis.onchange = this.onSelectYAxisChange.bind(this);
        this.selectFacies.onchange = this.onSelectFaciesChange.bind(this);
        this.selectSamples.onchange = this.onSelectSamplesChange.bind(this);
        this.checkboxDrawValues.onchange = this.onCheckboxDrawValuesChange.bind(this);
        this.checkboxDrawSamples.onchange = this.onCheckboxDrawSamplesChange.bind(this);
        buttonUndo.onclick = this.onButtonMergeUndoClick.bind(this);
        buttonApply.onclick = this.onButtonMergeApplyClick.bind(this);

        // setup renderer
        this.scatterRenderer.setDataValuesVisible(this.checkboxDrawValues.checked);
        this.scatterRenderer.setDataSamplesVisible(this.checkboxDrawSamples.checked);
    }

    // onButtonSaveImageClick
    private onButtonSaveImageClick() {
        this.scatterRenderer.saveToImageFile(this.layoutInfo.scatterFacies.name);
    }

    // onButtonDisplayTypeXClick
    private onButtonDisplayTypeXClick() {
        if (this.scatterRenderer.displayTypeX === DisplayType.LINEAR)
            this.scatterRenderer.setDisplayTypeX(DisplayType.LOG);
        else if (this.scatterRenderer.displayTypeX === DisplayType.LOG)
            this.scatterRenderer.setDisplayTypeX(DisplayType.LINEAR);
        this.scatterRenderer.drawScatter();
    }

    // onButtonDisplayTypeYClick
    private onButtonDisplayTypeYClick() {
        if (this.scatterRenderer.displayTypeY === DisplayType.LINEAR)
            this.scatterRenderer.setDisplayTypeY(DisplayType.LOG);
        else if (this.scatterRenderer.displayTypeY === DisplayType.LOG)
            this.scatterRenderer.setDisplayTypeY(DisplayType.LINEAR);
        this.scatterRenderer.drawScatter();
    }

    // onSelectXAxisChange
    private onSelectXAxisChange() {
        let dataValues: DataValues = this.selectXAxis.children[this.selectXAxis.selectedIndex]["dataValue"];
        this.layoutInfo.scatterXAxis = dataValues;
        this.scatterRenderer.setDataValuesAxisX(dataValues);
        this.scatterRenderer.drawScatter();
    }

    // onSelectYAxisChange
    private onSelectYAxisChange() {
        let dataValues: DataValues = this.selectXAxis.children[this.selectYAxis.selectedIndex]["dataValue"];
        this.layoutInfo.scatterYAxis = dataValues;
        this.scatterRenderer.setDataValuesAxisY(dataValues);
        this.scatterRenderer.drawScatter();
    }

    // onSelectFaciesChange
    private onSelectFaciesChange() {
        let dataFacies = this.selectFacies.children[this.selectFacies.selectedIndex]["dataFacies"];
        this.layoutInfo.scatterFacies = dataFacies;
        this.layoutInfo.scatterSamples = dataFacies.dataSamples[0];
        this.scatterRenderer.setDataFacies(dataFacies);
        this.scatterRenderer.setDataSamples(dataFacies.dataSamples[0]);
        this.updateHeader();
        this.scatterRenderer.drawScatter();
    }

    // onCheckboxDrawValuesChange
    private onCheckboxDrawValuesChange() {
        this.scatterRenderer.setDataValuesVisible(this.checkboxDrawValues.checked)
        this.scatterRenderer.drawScatter();
    }

    // onCheckboxDrawSamplesChange
    private onCheckboxDrawSamplesChange() {
        this.scatterRenderer.setDataSamplesVisible(this.checkboxDrawSamples.checked)
        this.scatterRenderer.drawScatter();
    }

    // onSelectSamplesChange
    private onSelectSamplesChange() {
        let dataSamples = this.selectSamples.children[this.selectSamples.selectedIndex]["dataSamples"];
        this.layoutInfo.scatterSamples = dataSamples;
        this.scatterRenderer.setDataSamples(dataSamples);
        this.scatterRenderer.drawScatter();
    }


    // onButtonMergeUndoClick
    private onButtonMergeUndoClick() {
        this.layoutInfo.scatterFacies.removeLastMergePair();
        this.updateHeader();
        this.scatterRenderer.drawScatter();
        this.onFaciesMerged && this.onFaciesMerged(this.layoutInfo.scatterFacies);
    }

    // onButtonMergeApply
    private onButtonMergeApplyClick() {
        if ((this.selectFrom.selectedIndex < 0) || (this.selectTo.selectedIndex < 0)) return;
        if (this.selectFrom.value === this.selectTo.value) return;
        this.layoutInfo.scatterFacies.addMergePair(parseInt(this.selectFrom.value), parseInt(this.selectTo.value));
        this.updateHeader();
        this.scatterRenderer.drawScatter();
        this.onFaciesMerged && this.onFaciesMerged(this.layoutInfo.scatterFacies);
    }

    // setLayoutInfo
    public setLayoutInfo(layoutInfo: LayoutInfo): void {
        // setup new image info
        if (this.layoutInfo != layoutInfo) {
            this.layoutInfo = layoutInfo;
            this.scatterRenderer.setDataValuesAxisX(layoutInfo.scatterXAxis);
            this.scatterRenderer.setDataValuesAxisY(layoutInfo.scatterYAxis);
            this.scatterRenderer.setDataFacies(layoutInfo.scatterFacies);
            this.scatterRenderer.setDataSamples(layoutInfo.scatterSamples);
            this.scatterRenderer.setSelections(layoutInfo.dataTable.selections);
            this.updateHeader();
            this.scatterRenderer.drawScatter();
        }
    }

    // setFaciesPopup
    public setFaciesPopup(faciesPopup: FaciesPopup) {
        this.scatterRenderer.setFaciesPopup(faciesPopup);
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
        this.updateHeader();
        this.scatterRenderer.drawScatter();
    }

    // updateHeader
    private updateHeader(): void {
        this.clearHeaders();
        if (this.layoutInfo) {
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
                option.selected = dataFacies === this.layoutInfo.scatterFacies;
                this.selectFacies.appendChild(option);
            }
            // update samples select
            if (this.layoutInfo.scatterFacies) {
                for (let dataSamples of this.layoutInfo.scatterFacies.dataSamples) {
                    let option = document.createElement('option') as HTMLOptionElement;
                    option.textContent = dataSamples.name;
                    option["dataSamples"] = dataSamples;
                    option.selected = dataSamples === this.layoutInfo.scatterSamples;
                    this.selectSamples.appendChild(option);
                }
            }
            // update merge selects
            if (this.layoutInfo.scatterFacies) {
                let indexArray = [];
                this.layoutInfo.scatterFacies.valuesAvailable.forEach(value => indexArray.push(value));
                indexArray.sort();
                // update from select
                for (let value of indexArray) {
                    let option = document.createElement('option') as HTMLOptionElement;
                    option.textContent = value.toString();
                    option.value = value.toString();
                    option.style.background = this.layoutInfo.scatterFacies.colorTable[value];
                    this.selectFrom.appendChild(option);
                };
                // update to select
                for (let value of indexArray) {
                    let option = document.createElement('option') as HTMLOptionElement;
                    option.textContent = value.toString();
                    option.value = value.toString();
                    option.style.background = this.layoutInfo.scatterFacies.colorTable[value];
                    this.selectTo.appendChild(option);
                };
            }
        }
    }
}

// clearChilds
function clearChilds(element: HTMLElement) {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}