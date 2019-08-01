import { DataTable } from "../Types/DataTable";
import { DataArray } from "../Types/DataArray";
import * as Plotly from "plotly.js"

// PlotLayout
export class PlotLayout {
    // parent
    private plots: Array<HTMLDivElement> = [];
    public name: string = "";
    // constructor
    constructor(name: string) {
        // parent
        this.plots = [];
        this.name = name;
    }

    // addPlots
    public addPlots(yValues: Array<number>, dataArrays: Array<DataArray>): void {
        // div
        let divPlot = document.createElement("div");
        // data
        let data: Partial<Plotly.PlotData>[] = dataArrays.map(dataArray => {
            return {
                x: dataArray.values,
                y: yValues,
            }
        });
        // layout
        var layout: Partial<Plotly.Layout> = {
            yaxis: {
                title: "DEPH",
                autorange: "reversed",
                showticklabels: true,
                exponentformat: "none"
            }
        };
        // config
        let config: Partial<Plotly.Config> = {
            displayModeBar: false 
        };
        Plotly.newPlot(divPlot, data, layout, config);
        this.plots.push(divPlot);
    }

    // draw
    public draw(parent: HTMLDivElement) {
        this.plots.forEach(div => { parent.appendChild(div) });
    }
}
