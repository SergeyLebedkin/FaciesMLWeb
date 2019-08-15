import { DataTable } from "../Types/DataTable";
import { LayoutInfo } from "../Types/LayoutInfo";
import { DataValues } from "../Types/DataValues";
import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";

// DataTableSelector
export class DataTableSelector {
    // parent
    private parent: HTMLDivElement = null;
    private enabled = true;    
    // data tables
    private dataTableList: Array<DataTable> = null;
    private checkBoxes: Array<HTMLInputElement> = [];
    private labels: Array<HTMLLabelElement> = [];
    // events
    public onSelectionChanged: (this: DataTableSelector, dataTable: DataTable) => any = null;
    // constructor
    constructor(parent: HTMLDivElement, dataTableList: Array<DataTable>) {
        // parent
        this.parent = parent;
        this.enabled = true;
        // base lists
        this.dataTableList = dataTableList;
        // controls
        this.checkBoxes = [];
        this.labels = [];
        // bind events
        this.onChangeChackBoxDataValues.bind(this);
        this.onChangeChackBoxDataFacies.bind(this);
        this.onChangeChackBoxDataSamples.bind(this);
    }

    // onChangeChackBoxDataValues
    private onChangeChackBoxDataValues(event){
        let dataTable: DataTable = event.currentTarget["dataTable"];
        let dataValues: DataValues = event.currentTarget["dataValues"];
        let dataFacies: DataFacies = event.currentTarget["dataFacies"];
        let dataSamples: DataSamples = event.currentTarget["dataSamples"];
        if (dataValues) dataValues.selected = event.currentTarget["checked"];
        this.onSelectionChanged && this.onSelectionChanged(dataTable);
    }

    // onChangeChackBoxDataFacies
    private onChangeChackBoxDataFacies(event){
        let dataTable: DataTable = event.currentTarget["dataTable"];
        let dataValues: DataValues = event.currentTarget["dataValues"];
        let dataFacies: DataFacies = event.currentTarget["dataFacies"];
        let dataSamples: DataSamples = event.currentTarget["dataSamples"];
        if (dataFacies) dataFacies.selected = event.currentTarget["checked"];
        this.onSelectionChanged && this.onSelectionChanged(dataTable);
    }

    // onChangeChackBoxDataSamples
    private onChangeChackBoxDataSamples(event){
        let dataTable: DataTable = event.currentTarget["dataTable"];
        let dataValues: DataValues = event.currentTarget["dataValues"];
        let dataFacies: DataFacies = event.currentTarget["dataFacies"];
        let dataSamples: DataSamples = event.currentTarget["dataSamples"];
        if (dataSamples) dataSamples.selected = event.currentTarget["checked"];
        this.onSelectionChanged && this.onSelectionChanged(dataTable);
    }

    // setEnabled
    public setEnabled(enable: boolean) {
        if (this.enabled !== enable) {
            this.enabled = enable;
            this.checkBoxes.forEach(checkBox => checkBox.disabled = !this.enabled);
        }
    }

    // update
    public update(): void {
        // just clear
        while (this.parent.firstChild) this.parent.removeChild(this.parent.firstChild);
        this.checkBoxes = [];
        this.labels = [];
        // add data tables
        for (let dataTable of this.dataTableList)
            this.addDataTable(dataTable);
    }

    // addDataTable
    private addDataTable(dataTable: DataTable): void {
        // add data table checkBox
        let checkBoxDataTable = this.addCheckBox(this.parent, 0, dataTable.name, true, dataTable, null, null, null);
        // add data table div
        let divDataTable = document.createElement("div");
        this.parent.appendChild(divDataTable);
        // setup data table checkBox
        checkBoxDataTable.checked = true;
        checkBoxDataTable["divDataTable"] = divDataTable;
        checkBoxDataTable.onchange = event => event.currentTarget["divDataTable"].style.display = event.currentTarget["checked"] ? "block" : "none";
        // add values
        for (let dataValues of dataTable.dataValues) {
            let checkBoxValues = this.addCheckBox(divDataTable, 20, dataValues.name, dataValues.selected, dataTable, dataValues, null, null);
            checkBoxValues.onchange = this.onChangeChackBoxDataValues.bind(this);
        }
        // add facies
        for (let dataFacies of dataTable.dataFacies) {
            let dataFaciesName = dataFacies.name;
            if (dataFacies.recommended) dataFaciesName += " (recommended)"
            let checkBoxFacies = this.addCheckBox(divDataTable, 20, dataFaciesName, dataFacies.selected, dataTable, null, dataFacies, null);
            checkBoxFacies.onchange = this.onChangeChackBoxDataFacies.bind(this);
            // add samples
            for (let dataSamples of dataFacies.dataSamples) {
                let dataSamplesName = dataSamples.name;
                if (dataSamples.recommended) dataSamplesName += " (recommended)"
                let checkBoxSamples = this.addCheckBox(divDataTable, 40, dataSamplesName, dataSamples.selected, dataTable, null, dataFacies, dataSamples);
                checkBoxSamples.onchange = this.onChangeChackBoxDataSamples.bind(this);
            }
        }
    }

    // addCheckBox
    private addCheckBox(
        parent: HTMLDivElement,
        offset: number,
        text: string,
        checked: boolean,
        dataTable: DataTable,
        dataValues: DataValues,
        dataFacies: DataFacies,
        dataSamples: DataSamples): HTMLInputElement {
        // create main div
        let divValue = document.createElement("div");
        divValue.style.display = "flex";
        divValue.style.flexDirection = "row";
        // create check box
        let checkBoxValue = document.createElement("input");
        checkBoxValue.type = "checkbox";
        checkBoxValue.name = "checkbox_" + dataTable.fileRef.name;
        checkBoxValue.style.marginLeft = offset.toFixed(0) + "px";
        checkBoxValue.checked = checked;
        checkBoxValue["dataTable"] = dataTable;
        checkBoxValue["dataValues"] = dataValues;
        checkBoxValue["dataFacies"] = dataFacies;
        checkBoxValue["dataSamples"] = dataSamples;
        this.checkBoxes.push(checkBoxValue);
        // create label
        let labelValue = document.createElement("label");
        labelValue.htmlFor = checkBoxValue.name;
        labelValue.innerText = text;
        labelValue.style.whiteSpace = "nowrap";
        this.labels.push(labelValue);
        // append controls
        divValue.appendChild(checkBoxValue);
        divValue.appendChild(labelValue);
        parent.appendChild(divValue);
        // return created checkbox
        return checkBoxValue;
    }
}