import { SessionInfo } from "./FaciesML/Types/SessionInfo"
import { DataTable } from "./FaciesML/Types/DataTable"
import { DataTableSelector } from "./FaciesML/Components/DataTableSelector"
import * as Plotly from "plotly.js"

// elements - left panel
let inputUsername: HTMLInputElement = null;
let inputSessionID: HTMLInputElement = null;
let inputDescription: HTMLInputElement = null;
let buttonLoadData: HTMLButtonElement = null;
let inputLoadData: HTMLInputElement = null;
let divDataValues: HTMLDivElement = null;
let buttonSubmit: HTMLButtonElement = null;
let aStatus: HTMLElement = null;

// globals
let gSessionInfo: SessionInfo = null;
let gDataTableList: Array<DataTable> = null;
let gDataTableSelector: DataTableSelector = null;

// buttonLoadDataOnClick
function buttonLoadDataOnClick(event: MouseEvent) {
    inputLoadData.accept = ".las";
    inputLoadData.onchange = event => {
        let files: Array<File> = event.currentTarget["files"];
        for (let file of files) {
            let dataTable = new DataTable();
            dataTable.onloadFileData = dataTable => {
                gDataTableList.push(dataTable);
                gDataTableSelector.update();
            } 
            dataTable.loadFromFile(file);
        }
    }
    inputLoadData.click();
}

// buttonSubmitOnClick
function buttonSubmitOnClick(event: MouseEvent) {
    console.log(gDataTableSelector.getSelectedArrays());
}

// window.onload
window.onload = event => {
    // get elements - left panel
    inputUsername = document.getElementById("inputUsername") as HTMLInputElement;
    inputSessionID = document.getElementById("inputSessionID") as HTMLInputElement;
    inputDescription = document.getElementById("inputDescription") as HTMLInputElement;
    buttonLoadData = document.getElementById("buttonLoadData") as HTMLButtonElement;
    inputLoadData = document.getElementById("inputLoadData") as HTMLInputElement;
    divDataValues = document.getElementById("divDataValues") as HTMLDivElement;
    buttonSubmit = document.getElementById("buttonSubmit") as HTMLButtonElement;
    aStatus = document.getElementById("aStatus") as HTMLElement;
    // create global objects
    gSessionInfo = new SessionInfo();
    gSessionInfo.sessionID = Math.random().toString(36).slice(2);
    gDataTableList = new Array<DataTable>();
    gDataTableSelector = new DataTableSelector(divDataValues, gDataTableList);
    // init session
    inputSessionID.value = gSessionInfo.sessionID;
    // left panel events
    buttonLoadData.onclick = event => buttonLoadDataOnClick(event);
    buttonSubmit.onclick = event => buttonSubmitOnClick(event);
}