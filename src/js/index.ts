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
let divTabPanelLayots: HTMLDivElement = null;
let divPlotsPanel: HTMLDivElement = null;
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
                // update selector
                gDataTableList.push(dataTable);
                gDataTableSelector.update();
            }
            dataTable.loadFromFile(file);
        }
    }
    inputLoadData.click();
}

// buttonTabOnClick
function buttonTabOnClick(event: MouseEvent) {
    gLayoutInfoEditor.setLayoutInfo(event.target["layoutInfo"]);
}

// buttonDrawPlotsOnClick
function buttonDrawPlotsOnClick(event: MouseEvent) {
    let layoutInfos = gDataTableSelector.createLayoutInfos();
    for (let layoutInfo of layoutInfos) {
        let buttonTab = document.createElement("button");
        buttonTab.className = "tab-button";
        buttonTab.innerText = layoutInfo.name;
        buttonTab["layoutInfo"] = layoutInfo;
        buttonTab.onclick = buttonTabOnClick;
        divTabPanelLayots.appendChild(buttonTab);
        // set current layout info
        if (gLayoutInfoEditor.layoutInfo === null) {
            gLayoutInfoEditor.setLayoutInfo(layoutInfo);
            buttonSubmit.disabled = false;
        }
    }
    gDataTableSelector.clearSelections();
}

// buttonSubmitOnClick
function buttonSubmitOnClick(event: MouseEvent) {
    if (gLayoutInfoEditor.layoutInfo === null) return;
    let timeoutServerWait = setTimeout(() => {
        aStatus.style.color = "red";
        aStatus.innerText = "Server timeout...";
        buttonSubmit.disabled = false;
    }, 1000 * 5 * 60);
    aStatus.style.color = "blue";
    aStatus.innerText = "Post SessionID...";
    buttonSubmit.disabled = true;
    gSessionInfo.postDataArrays(gLayoutInfoEditor.layoutInfo)
        .then(value => {
            aStatus.style.color = "blue";
            aStatus.innerText = "Post data...";
        }, reason => {
            aStatus.style.color = "red";
            aStatus.innerText = "Server error... (" + reason + ")";
            buttonSubmit.disabled = false;
            clearTimeout(timeoutServerWait);
            return Promise.reject(reason);
        }).then(value => {
            aStatus.style.color = "green";
            aStatus.innerText = "OK"
            buttonSubmit.disabled = false;
            clearTimeout(timeoutServerWait);
        }, reason => {
            aStatus.style.color = "red";
            aStatus.innerText = "Server error... (" + reason + ")";
            buttonSubmit.disabled = false;
            clearTimeout(timeoutServerWait);
        });
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
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    aStatus = document.getElementById("aStatus") as HTMLElement;
    divTabPanelLayots = document.getElementById("divTabPanelLayots") as HTMLDivElement;
    divPlotsPanel = document.getElementById("divPlotsPanel") as HTMLDivElement;
    // create global objects
    gSessionInfo = new SessionInfo();
    gSessionInfo.sessionID = Math.random().toString(36).slice(2);
    gDataTableList = new Array<DataTable>();
    gDataTableSelector = new DataTableSelector(divDataValues, gDataTableList);
    gLayoutInfoEditor = new LayoutInfoEditor(divPlotsPanel);
    // center panel events
    // init session
    inputSessionID.value = gSessionInfo.sessionID;
    // left panel events
    buttonLoadData.onclick = event => buttonLoadDataOnClick(event);
    radioSelectionModeAdd.onchange = event => gLayoutInfoEditor.setSelectionMode(SelectionMode.ADD);
    radioSelectionModeRemove.onchange = event => gLayoutInfoEditor.setSelectionMode(SelectionMode.REMOVE);
    buttonDrawPlots.onclick = event => buttonDrawPlotsOnClick(event);
    buttonSubmit.onclick = event => buttonSubmitOnClick(event);
    buttonSubmit.disabled = true;
}