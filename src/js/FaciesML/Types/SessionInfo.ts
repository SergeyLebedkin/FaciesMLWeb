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

    // verifyDataTables
    public verifyDataTables(dataTables: DataTable[]): boolean {
        for (let dataTable1 of dataTables) {
            let selectedDataValues1 = dataTable1.dataValues.filter(dataValues => dataValues.selected);
            if (selectedDataValues1.length > 0) {
                for (let dataTable2 of dataTables) {
                    let selectedDataValues2 = dataTable2.dataValues.filter(dataValues => dataValues.selected);
                    for (let dataValues1 of selectedDataValues1) {
                        if (selectedDataValues2.findIndex(dataValues2 => dataValues1.name === dataValues2.name) < 0)
                            return false;
                    }
                }
            }
        }
        return true;
    }

    // postDataTables
    public postDataTables(dataTables: DataTable[]): Promise<string> {
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
                reject("postDataArrays onerror " + xhr.responseText);
            };
            // generate request data
            let data = {
                "session_id": this.sessionID,
                "sensitivity": 0.1,
                "logs": {}
            };
            for (let dataTable of dataTables)
                if (dataTable.getSelectedCount() > 0)
                    data.logs[dataTable.name] = dataTable.saveSelectedToJson();
            console.log(data)
            try {
                xhr.send(JSON.stringify(data));
            } catch (error) {
                reject(error)
            }
        });
    }
}