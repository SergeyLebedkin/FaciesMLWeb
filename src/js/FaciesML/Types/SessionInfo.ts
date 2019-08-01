import { DataArray } from "./DataArray"
import { DataTable } from "./DataTable";

// base URL
export const URL = "http://localhost:8084";

// SessionInfo
export class SessionInfo {
    // fields
    public username: string = "";
    public sessionID: string = "";
    public description: string = "";
    // constructor
    constructor() {
        this.username = "";
        this.sessionID = "";
        this.description = "";
    }

    // postDataArrays
    public postDataArrays(dataTableList: Array<DataTable>): Promise<string> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = URL + "/clustering";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = event => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let responseData = JSON.parse(xhr.responseText);
                    if (responseData.success)
                        resolve(xhr.responseText)
                    else
                        reject(responseData.Error);
                }
            };
            xhr.onerror = event => {
                console.log("postDataArrays onerror " + xhr.responseText);
                reject("postDataArrays onerror " + xhr.responseText);
            };
            // generate request data
            let data = {
                "session_id": this.sessionID,
                "sensitivity": 0.1,
                "logs": {
                }
            };
            // fill by checked values
            for (let dataTable of dataTableList) {
                if (dataTable.isAnyChecked()) {
                    data.logs[dataTable.name] = {};
                    for (let dataArray of dataTable.data) {
                        if (dataArray.checked) {
                            data.logs[dataTable.name][dataArray.name] = {
                                "unit": dataArray.unit,
                                "data": dataArray.values
                            };
                        }
                    }
                }
            }

            try {
                    xhr.send(JSON.stringify(data));
            } catch(error) {
                console.log("catch", error)
                reject(error)
            }
        });
    }
}