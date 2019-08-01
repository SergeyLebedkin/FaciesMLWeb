import { SessionInfo } from "./FaciesML/Types/SessionInfo"
import { DataTable } from "./FaciesML/Types/DataTable"
import { DataTableSelector } from "./FaciesML/Components/DataTableSelector"
import { PlotLayout } from "./FaciesML/Components/PlotLayout";

// elements - left panel
let inputUsername: HTMLInputElement = null;
let inputSessionID: HTMLInputElement = null;
let inputDescription: HTMLInputElement = null;
let buttonLoadData: HTMLButtonElement = null;
let inputLoadData: HTMLInputElement = null;
let divDataValues: HTMLDivElement = null;
let button: HTMLButtonElement = null;
let buttonDrawPlots: HTMLButtonElement = null;
let buttonSubmit: HTMLButtonElement = null;
let aStatus: HTMLElement = null;
let divTabPanelLayots: HTMLDivElement = null;
let divPlotsPanel: HTMLDivElement = null;
// globals
let gSessionInfo: SessionInfo = null;
let gDataTableList: Array<DataTable> = null;
let gPlotLayoutList: Array<PlotLayout> = null;
let gDataTableSelector: DataTableSelector = null;

// buttonLoadDataOnClick
function buttonLoadDataOnClick(event: MouseEvent) {
    inputLoadData.accept = ".las";
    inputLoadData.onchange = event => {
        let files: Array<File> = event.currentTarget["files"];
        for (let file of files) {
            let dataTable = new DataTable();
            dataTable.onloadFileData = dataTable => {
                // create plot layout
                let plotLayout = new PlotLayout(dataTable.name);
                gPlotLayoutList.push(plotLayout);

                // create new tab button
                let buttonTab = document.createElement("button");
                buttonTab.innerText = dataTable.name;
                buttonTab.className = "tab-button";
                buttonTab["dataTable"] = dataTable;
                buttonTab["plotLayout"] = plotLayout;
                divTabPanelLayots.appendChild(buttonTab);
                
                // update selector
                gDataTableList.push(dataTable);
                gDataTableSelector.update();
            }
            dataTable.loadFromFile(file);
        }
    }
    inputLoadData.click();
}

// buttonDrawPlotsOnClick
function buttonDrawPlotsOnClick(event: MouseEvent) {
    for(let dataTable of gDataTableList) {
        if (dataTable.isAnyChecked()) {
            let plotLayout = gPlotLayoutList.find(pl => pl.name = dataTable.name);
            if (plotLayout) {
                plotLayout.addPlots(dataTable.data[0].values, dataTable.getCheched());
                clearChilds(divPlotsPanel);
                plotLayout.draw(divPlotsPanel);
            }
        }
    }
}

// buttonSubmitOnClick
function buttonSubmitOnClick(event: MouseEvent) {
    let timeoutServerWait = setTimeout(() => {
        aStatus.style.color = "red";
        aStatus.innerText = "Server timeout...";
        buttonSubmit.disabled = false;
    }, 1000 * 5 * 60);
    aStatus.style.color = "blue";
    aStatus.innerText = "Post SessionID...";
    buttonSubmit.disabled = true;
    gSessionInfo.postDataArrays(gDataTableList)
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

// clearChilds
function clearChilds(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
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
    gPlotLayoutList = new Array<PlotLayout>();
    // init session
    inputSessionID.value = gSessionInfo.sessionID;
    // left panel events
    buttonLoadData.onclick = event => buttonLoadDataOnClick(event);
    buttonDrawPlots.onclick = event => buttonDrawPlotsOnClick(event);
    buttonSubmit.onclick = event => buttonSubmitOnClick(event);
}