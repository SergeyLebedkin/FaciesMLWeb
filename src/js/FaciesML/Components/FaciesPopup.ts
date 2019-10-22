import { DataFacies } from "../Types/DataFacies";
import { DataSamples } from "../Types/DataSamples";

// FaciesPopup
export class FaciesPopup {
    // main element
    private mainDiv: HTMLDivElement = null;
    // main data
    private dataFacies: DataFacies = null;
    private dataSamples: DataSamples = null;
    private dataSamplesIndex: number = -1;
    // controls
    private divRemove: HTMLDivElement = null;
    public canvasPreview: HTMLCanvasElement = null;
    public labelValues: HTMLLabelElement = null;
    // flags
    private canHide: boolean = false;
    // events
    public onSamplesRemoved: (this: FaciesPopup, dataSamples: DataSamples, dataSamplesIndex: number) => any = null;
    constructor() {
        // create content
        this.mainDiv = document.createElement("div");
        this.mainDiv.className = "facies-menu";
        this.mainDiv.innerHTML = `
            <div class="facies-menu-option" id="itemFaciesRemove">Remove</div>
            <canvas id="itemFacieCanvasPreview">Remove</canvas><br>
            <a id="labelValues">label</a>
        `;
        document.body.appendChild(this.mainDiv);
        // get elements IDs
        this.divRemove = document.getElementById("itemFaciesRemove") as HTMLDivElement;
        this.canvasPreview = document.getElementById("itemFacieCanvasPreview") as HTMLCanvasElement;
        this.labelValues = document.getElementById("labelValues") as HTMLLabelElement;
        // add events
        this.divRemove.addEventListener("click", this.onRemoveClick.bind(this));
        // set global event
        document.addEventListener("click", this.onDocumentClick.bind(this));
        this.canHide = false;
    }

    // onRemoveClick
    public onRemoveClick(): void {
        if (this.dataSamples && (this.dataSamplesIndex >= 0)) {
            // remove sample
            this.dataSamples.values[this.dataSamplesIndex] = 0;
            // call event
            if (this.onSamplesRemoved)
                this.onSamplesRemoved(this.dataSamples, this.dataSamplesIndex);
        }
    }

    // onDocumentMouseDown
    private onDocumentClick(event: MouseEvent) {
        if (this.canHide)
            this.hide();
        this.canHide = true;
    }

    // setDataFacies
    public setDataFacies(dataFacies: DataFacies) {
        this.dataFacies = dataFacies;
    }

    // setDataSamples
    public setDataSamples(dataSamples: DataSamples) {
        this.dataSamples = dataSamples;
    }

    // setDataSamplesIndex
    public setDataSamplesIndex(dataSamplesIndex: number) {
        this.dataSamplesIndex = dataSamplesIndex;
    }

    // setLabel
    public setLabel(label: string) {
        this.labelValues.innerText = label;
    }

    // show
    public show(x: number, y: number): void {
        this.mainDiv.style.left = `${x}px`;
        this.mainDiv.style.top = `${y}px`;
        this.mainDiv.style.display = "block";
        this.canHide = false;
    }

    // hide
    public hide(): void {
        this.mainDiv.style.display = "none";
    }
}