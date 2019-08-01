import { DataTable } from "../Types/DataTable";
import { DataArray } from "../Types/DataArray";
import { LayoutInfo } from "../Types/LayoutInfo";

// LayoutInfoEditor
export class LayoutInfoEditor {
    // parent
    private parent: HTMLDivElement = null;
    // layoutInfo parameters
    public layoutInfo: LayoutInfo = null;
    public layoutScale: number = 1.0;
    // main canvas
    private layoutCanvas: HTMLCanvasElement = null;
    private layoutCanvasCtx: CanvasRenderingContext2D = null;
    // constructor
    constructor(parent: HTMLDivElement) {
        // setup parent
        this.parent = parent;
        // image parameters
        this.layoutInfo = null;
        this.layoutScale = 1.0;
        // create image canvas
        this.layoutCanvas = document.createElement("canvas");
        this.layoutCanvas.style.border = "1px solid orange";
        this.layoutCanvasCtx = this.layoutCanvas.getContext('2d');
        this.parent.appendChild(this.layoutCanvas);
    }

    // setLayoutInfo
    public setLayoutInfo(layoutInfo: LayoutInfo): void {
        // setup new image info
        if (this.layoutInfo != layoutInfo) {
            this.layoutInfo = layoutInfo;
            this.drawLayoutInfo();
        }
    }

    // drawLayoutInfo
    public drawLayoutInfo(): void {
        console.log(this.layoutInfo.name + " DRAW!!!!");
    }
}
