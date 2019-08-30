import { SessionInfo } from "./FaciesML/Types/SessionInfo"
import { DataTable } from "./FaciesML/Types/DataTable"
import { DataTableSelector } from "./FaciesML/Components/DataTableSelector"
import { LayoutInfoEditor } from "./FaciesML/Components/LayoutInfoEditor";
import { LayoutInfo } from "./FaciesML/Types/LayoutInfo";
import { SelectionMode } from "./FaciesML/Types/SelectionMode";

// elements - left panel
let inputUsername: HTMLInputElement = null;
let inputSessionID: HTMLInputElement = null;
let inputDescription: HTMLInputElement = null;
let buttonLoadData: HTMLButtonElement = null;
let inputLoadData: HTMLInputElement = null;
let divDataValues: HTMLDivElement = null;
let radioSelectionModeAdd: HTMLInputElement = null;
let radioSelectionModeRemove: HTMLInputElement = null;
let buttonDrawPlots: HTMLButtonElement = null;
let buttonSubmit: HTMLButtonElement = null;
let aStatus: HTMLElement = null;
let buttonSave: HTMLButtonElement = null;
// get elements - center panel
let divTabPanelLayots: HTMLDivElement = null;
let divPlotHeaders: HTMLDivElement = null;
let divPlotsPanel: HTMLDivElement = null;
let labelScaleFactor: HTMLLabelElement = null;
let buttonScaleDown: HTMLButtonElement = null;
let buttonScaleUp: HTMLButtonElement = null;

// globals
let gSessionInfo: SessionInfo = null;
let gDataTableList: Array<DataTable> = null;
let gLayoutInfoEditor: LayoutInfoEditor = null;
let gDataTableSelector: DataTableSelector = null;

// buttonLoadDataOnClick
function buttonLoadDataOnClick(event: MouseEvent) {
    inputLoadData.accept = ".las";
    inputLoadData.onchange = event => {
        let files: Array<File> = event.currentTarget["files"];
        for (let file of files) {
            let dataTable = new DataTable();
            dataTable.onloadFileData = dataTable => {
                // create layout info
                let layoutInfo = new LayoutInfo(dataTable);
                // create tab buttor
                let buttonTab = document.createElement("button");
                buttonTab.className = "tab-button";
                buttonTab.innerText = layoutInfo.dataTable.name;
                buttonTab["layoutInfo"] = layoutInfo;
                buttonTab.onclick = buttonTabOnClick;
                divTabPanelLayots.appendChild(buttonTab);
                // update selector
                gDataTableList.push(dataTable);
                gDataTableSelector.update();
                buttonSubmit.disabled = false;
                // update editor
                if (gLayoutInfoEditor.layoutInfo === null) {
                    gLayoutInfoEditor.setLayoutInfo(layoutInfo);
                    gLayoutInfoEditor.drawLayoutInfo();
                }
            }
            dataTable.loadFromFileLAS(file);
        }
        buttonSave.disabled = false;
        buttonDrawPlots.disabled = false;
    }
    inputLoadData.click();
}

// buttonTabOnClick
function buttonTabOnClick(event: MouseEvent) {
    gLayoutInfoEditor.setLayoutInfo(event.target["layoutInfo"]);
}

// buttonDrawPlotsOnClick
function buttonDrawPlotsOnClick(event: MouseEvent) {
    gLayoutInfoEditor.drawLayoutInfo();
}

// buttonSubmitOnClick
function buttonSubmitOnClick(event: MouseEvent) {
    if (gLayoutInfoEditor.layoutInfo === null) return;
    // if (!gSessionInfo.verifyDataTables(gDataTableList)) {
    //     alert("All wells should hava the same set of selected variables");
    //     return;
    // }
    let timeoutServerWait = setTimeout(() => {
        aStatus.style.color = "red";
        aStatus.innerText = "Server timeout...";
        gDataTableSelector.setEnabled(true);
        gLayoutInfoEditor.setEnabled(true);
        buttonSubmit.disabled = false;
    }, 1000 * 5 * 60);
    aStatus.style.color = "blue";
    aStatus.innerText = "Working...";
    gDataTableSelector.setEnabled(false);
    gLayoutInfoEditor.setEnabled(false);
    buttonSubmit.disabled = true;
    gSessionInfo.postDataTables(gDataTableList)
        .then(value => {
            aStatus.style.color = "green";
            aStatus.innerText = "OK"
            buttonSubmit.disabled = false;
            gDataTableSelector.setEnabled(true);
            gLayoutInfoEditor.setEnabled(true);
            clearTimeout(timeoutServerWait);
            let json = JSON.parse(value);
            updateTablesFromJson(json);
            for (let dataTable of gDataTableList)
                dataTable.setOptimizedСlusterNum(json["optimized_cluster_num"]);
            gDataTableSelector.update();
            gLayoutInfoEditor.drawLayoutInfo();
        }, reason => {
            aStatus.style.color = "red";
            aStatus.innerText = "Server error... (" + reason + ")";
            buttonSubmit.disabled = false;
            gDataTableSelector.setEnabled(true);
            gLayoutInfoEditor.setEnabled(true);
            clearTimeout(timeoutServerWait);
            return Promise.reject(reason);
        });
}

// buttonSaveOnClick
function buttonSaveOnClick(event: MouseEvent) {
    for (let dataTable of gDataTableList){
        if (dataTable.getSelectedCount() > 0)
            downloadFile(dataTable.saveToCSV(), dataTable.getSelectedCaption() + ".csv", "text/plain");
    }
}

// buttonScaleDownOnClick
function buttonScaleDownOnClick(event: MouseEvent) {
    gLayoutInfoEditor.setScale(gLayoutInfoEditor.scale / 2);
    labelScaleFactor.innerText = Math.round(gLayoutInfoEditor.scale * 100) + "%";
}

// buttonScaleUpOnClick
function buttonScaleUpOnClick(event: MouseEvent) {
    gLayoutInfoEditor.setScale(gLayoutInfoEditor.scale * 2);
    labelScaleFactor.innerText = Math.round(gLayoutInfoEditor.scale * 100) + "%";
}

// utils

// window.onload
window.onload = event => {
    // get elements - left panel
    inputUsername = document.getElementById("inputUsername") as HTMLInputElement;
    inputSessionID = document.getElementById("inputSessionID") as HTMLInputElement;
    inputDescription = document.getElementById("inputDescription") as HTMLInputElement;
    buttonLoadData = document.getElementById("buttonLoadData") as HTMLButtonElement;
    inputLoadData = document.getElementById("inputLoadData") as HTMLInputElement;
    divDataValues = document.getElementById("divDataValues") as HTMLDivElement;
    radioSelectionModeAdd = document.getElementById("radioSelectionModeAdd") as HTMLInputElement;
    radioSelectionModeRemove = document.getElementById("radioSelectionModeRemove") as HTMLInputElement;
    buttonDrawPlots = document.getElementById("buttonDrawPlots") as HTMLButtonElement;
    buttonDrawPlots.disabled = true;
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    aStatus = document.getElementById("aStatus") as HTMLElement;
    buttonSave = document.getElementById("buttonSave") as HTMLButtonElement;
    // center panel
    labelScaleFactor = document.getElementById("labelScaleFactor") as HTMLLabelElement;
    buttonScaleDown = document.getElementById("buttonScaleDown") as HTMLButtonElement;
    buttonScaleUp = document.getElementById("buttonScaleUp") as HTMLButtonElement;
    divTabPanelLayots = document.getElementById("divTabPanelLayots") as HTMLDivElement;
    divPlotHeaders = document.getElementById("divPlotHeaders") as HTMLDivElement;
    divPlotsPanel = document.getElementById("divPlotsPanel") as HTMLDivElement;
    // create global objects
    gSessionInfo = new SessionInfo();
    gSessionInfo.sessionID = Math.random().toString(36).slice(2);
    gDataTableList = new Array<DataTable>();
    gDataTableSelector = new DataTableSelector(divDataValues, gDataTableList);
    gDataTableSelector.onSelectionChanged = () => gLayoutInfoEditor.drawLayoutInfo();
    gLayoutInfoEditor = new LayoutInfoEditor(divPlotHeaders, divPlotsPanel);
    // init session
    inputSessionID.value = gSessionInfo.sessionID;
    // left panel events
    buttonLoadData.onclick = event => buttonLoadDataOnClick(event);
    radioSelectionModeAdd.onchange = event => gLayoutInfoEditor.setSelectionMode(SelectionMode.ADD);
    radioSelectionModeRemove.onchange = event => gLayoutInfoEditor.setSelectionMode(SelectionMode.REMOVE);
    buttonDrawPlots.onclick = event => buttonDrawPlotsOnClick(event);
    buttonSubmit.onclick = event => buttonSubmitOnClick(event);
    buttonSubmit.disabled = true;
    buttonSave.onclick = event => buttonSaveOnClick(event);
    buttonSave.disabled = true;
    // center panel events
    buttonScaleDown.onclick = event => buttonScaleDownOnClick(event);
    buttonScaleUp.onclick = event => buttonScaleUpOnClick(event);
}

// updateTablesFromJson
function updateTablesFromJson(json: any) {
    console.log(json);
    for (let key in json) {
        let dataTable = gDataTableList.find(dataTable => dataTable.name === key);
        if (dataTable) {
            dataTable.updateValuesFromJson(json[key]);
            dataTable.updateSamplesFromJson(json[key + "_samples_info"]);
        }
    }
}

// downloadFile
function downloadFile(text: string, name: string, type: string) {
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
}