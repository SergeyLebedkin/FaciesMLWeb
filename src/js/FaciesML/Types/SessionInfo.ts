import { DataArray } from "./DataArray"

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
    public postDataArrays(dataArray: Array<DataArray>): Promise<string> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = URL + "/post_session_id";
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
            let data = JSON.stringify({
                "session_id": this.sessionID
            });
            try {
                xhr.send(data);
            } catch (error) {
                console.log("catch", error)
                reject(error)
            }
        });
    }
}