import { DataTable } from "../Types/DataTable";
import { LayoutInfo } from "../Types/LayoutInfo";
import { DataArray } from "../Types/DataArray";

// DataTableSelector
export class DataTableSelector {
    // parent
    private parent: HTMLDivElement = null;
    private enabled = true;
    // data tables
    private dataTableList: Array<DataTable> = null;
    private dataArrayCheckBoxes: Array<HTMLInputElement> = null;
    // constructor
    constructor(parent: HTMLDivElement, dataTableList: Array<DataTable>) {
        // parent
        this.parent = parent;
        this.enabled = true;
        // base lists
        this.dataTableList = dataTableList;
        // dataArrayCheckBoxes
        this.dataArrayCheckBoxes = new Array<HTMLInputElement>();
    }

    // setEnabled
    public setEnabled(enable: boolean) {
        if (this.enabled !== enable) {
            this.enabled = enable;
            this.dataArrayCheckBoxes.forEach(checkBox => checkBox.disabled = !this.enabled);
        }
    }

    // update
    public update(): void {
        // just clear
        while (this.parent.firstChild) this.parent.removeChild(this.parent.firstChild);
        this.dataArrayCheckBoxes = [];
        for (let dataTable of this.dataTableList)
            this.addDataTable(dataTable);
    }

    // addDataTable
    private addDataTable(dataTable: DataTable): void {
        let divDataTable = document.createElement("div");

        // add data table name
        let divDataTableName = document.createElement("div");
        divDataTableName.style.display = "flex";
        divDataTableName.style.flexDirection = "row";
        let checkBoxTableName = document.createElement("input");
        checkBoxTableName.type = "checkbox";
        checkBoxTableName.name = "checkbox_" + dataTable.fileRef.name;
        checkBoxTableName["dataTable"] = dataTable;
        checkBoxTableName.checked = true;
        let labelTableName = document.createElement("label");
        labelTableName.htmlFor = checkBoxTableName.name;
        labelTableName.innerText = dataTable.fileRef.name;
        labelTableName.style.whiteSpace = "nowrap";
        divDataTableName.appendChild(checkBoxTableName);
        divDataTableName.appendChild(labelTableName);
        divDataTable.appendChild(divDataTableName);

        // add data table values
        let divDataTableValues = document.createElement("div");
        dataTable.data.forEach((dataArray, dataArrayIndex) => {
            let divDataTableValue = document.createElement("div");
            divDataTableValue.style.display = "flex";
            divDataTableValue.style.flexDirection = "row";
            let checkBoxDataTableValue = document.createElement("input");
            checkBoxDataTableValue.type = "checkbox";
            checkBoxDataTableValue.name = "checkbox_" + dataTable.fileRef.name + "_" + dataArrayIndex;
            checkBoxDataTableValue.style.marginLeft = "20px";
            checkBoxDataTableValue["dataArray"] = dataArray;
            checkBoxDataTableValue["dataTable"] = dataTable;
            checkBoxDataTableValue["dataArrayIndex"] = dataArrayIndex;
            divDataTableValue.appendChild(checkBoxDataTableValue);
            let labelDataTableValue = document.createElement("label");
            labelDataTableValue.htmlFor = checkBoxDataTableValue.name;
            labelDataTableValue.innerText = dataArray.getCaption();
            labelDataTableValue.style.whiteSpace = "nowrap";
            labelDataTableValue["dataArray"] = dataArray;
            labelDataTableValue["dataTable"] = dataTable;
            // global add
            divDataTableValue.appendChild(labelDataTableValue);
            divDataTableValues.appendChild(divDataTableValue);
            this.dataArrayCheckBoxes.push(checkBoxDataTableValue);

            // add samples values
            dataArray.sampleMasks.forEach((dataArray, dataArrayIndex) => {
                let divDataSample = document.createElement("div");
                divDataSample.style.display = "flex";
                divDataSample.style.flexDirection = "row";
                let checkBoxDataSample = document.createElement("input");
                checkBoxDataSample.type = "checkbox";
                checkBoxDataSample.name = "checkbox_" + dataTable.fileRef.name + "_" + dataArrayIndex;
                checkBoxDataSample.style.marginLeft = "40px";
                checkBoxDataSample["dataArray"] = dataArray;
                checkBoxDataSample["dataTable"] = dataTable;
                checkBoxDataSample["dataArrayIndex"] = dataArrayIndex;
                divDataSample.appendChild(checkBoxDataSample);
                let labelDataSample = document.createElement("label");
                labelDataSample.htmlFor = checkBoxDataTableValue.name;
                labelDataSample.innerText = dataArray.getCaption();
                labelDataSample.style.whiteSpace = "nowrap";
                labelDataSample["dataArray"] = dataArray;
                labelDataSample["dataTable"] = dataTable;
                // global add
                divDataSample.appendChild(labelDataSample);
                divDataTableValues.appendChild(divDataSample);
                this.dataArrayCheckBoxes.push(checkBoxDataSample);
            });
        });
        checkBoxTableName["divDataTableValues"] = divDataTableValues;
        checkBoxTableName.onchange = event => {
            if (event.currentTarget["checked"] === true)
                event.currentTarget["divDataTableValues"].style.display = "block"
            else
                event.currentTarget["divDataTableValues"].style.display = "none";
        }
        divDataTable.appendChild(divDataTableValues);
        this.parent.appendChild(divDataTable);
    }

    // clearSelections
    public clearSelections(): void {
        for (let checkbox of this.dataArrayCheckBoxes)
            checkbox.checked = false;
    }

    public getCheckedDataArrays(dataTable: DataTable): Array<DataArray> {
        return this.dataArrayCheckBoxes
            .filter(checkBox => (checkBox["dataTable"] === dataTable) && (checkBox.checked))
            .map(checkBox => checkBox["dataArray"]);
    }

    // createLayoutInfos
    public createLayoutInfos(): Array<LayoutInfo> {
        let layoutInfos = new Array<LayoutInfo>();
        for (let dataTable of this.dataTableList) {
            // get selected data arrays for current data atable
            let dataArrays = this.getCheckedDataArrays(dataTable);
            // create data array
            if (dataArrays.length > 0)
                layoutInfos.push(new LayoutInfo(dataTable, dataArrays));
        }
        return layoutInfos;
    }

    // appendToLayoutInfos
    public appendToLayoutInfos(layoutInfo: LayoutInfo): void {
        let dataTable = this.dataTableList.find(dataTable => dataTable === layoutInfo.dataTable);
        if (dataTable) {
            // get selected data arrays for current data atable
            let dataArrays = this.getCheckedDataArrays(dataTable);
            for (let dataArray of dataArrays) {
                if (!layoutInfo.isDataArrayExists(dataArray))
                    layoutInfo.dataArrays.push(dataArray);
            }
        }
    }
}