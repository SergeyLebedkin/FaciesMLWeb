import { ImageInfo } from "./ImageInfo"

// ImageInfoList
export class ImageInfoList {
    // list
    public imageInfos: Array<ImageInfo> = null;
    // main canvas and context
    public canvasPreview: HTMLCanvasElement = null;
    public canvasPreviewCtx: CanvasRenderingContext2D = null;
    // main metrics
    private minDepth: number;
    private maxDepth: number;
    private height: number;
    // events
    public onloadImageFile: (this: ImageInfoList, imageInfo: ImageInfo) => any = null;
    // constructor
    // height - in pixels
    constructor(minDepth: number, maxDepth: number, height: number) {
        // main list
        this.imageInfos = [];
        // main metrics
        this.minDepth = minDepth;
        this.maxDepth = maxDepth;
        this.height = height;
        // create canvas
        this.canvasPreview = document.createElement("canvas");
        this.canvasPreviewCtx = this.canvasPreview.getContext("2d");
        this.updatePreview();
    }

    // updatePreview
    private updatePreview(): void {
        // get max canvas width
        let maxWidth = this.getMaxImageWidth();
        let step = (this.maxDepth - this.minDepth) / this.height;
        // update canvas
        this.canvasPreview.width = maxWidth;
        this.canvasPreview.height = this.height;
        // clear canvas
        this.canvasPreviewCtx.beginPath();
        this.canvasPreviewCtx.fillStyle = "black";
        this.canvasPreviewCtx.fillRect(0, 0, this.canvasPreview.width, this.canvasPreview.height);
        this.canvasPreviewCtx.stroke();
        // render images to canvas
        for (let imageInfo of this.imageInfos) {
            let begIndex = Math.floor((imageInfo.minDepth - this.minDepth) / step);
            let endIndex = Math.floor((imageInfo.maxDepth - this.minDepth) / step);
            this.canvasPreviewCtx.drawImage(imageInfo.canvasImage, 0, begIndex, imageInfo.canvasImage.width, endIndex - begIndex);
        }
    }

    // getMaxImageWidth
    public getMaxImageWidth(): number {
        let maxWidth: number = 0;
        for (let imageInfo of this.imageInfos)
            maxWidth = Math.max(maxWidth, imageInfo.canvasImage.width);
        return maxWidth;
    }

    // grabSubImage
    // depth and height - fits
    public grabSubImage(targetCanvas: HTMLCanvasElement, depth: number, height: number): void {
        if (targetCanvas) {
            // get canvas parameters
            let step = (this.maxDepth - this.minDepth) / this.height;
            let begIndex = Math.floor((depth - this.minDepth - height / 2) / step);
            let endIndex = Math.floor((depth - this.minDepth + height / 2) / step);
            // create canvas
            let targetCanvasCtx = targetCanvas.getContext("2d");
            targetCanvas.height = endIndex - begIndex;
            targetCanvas.width = this.canvasPreview.width + 1;
            targetCanvasCtx.drawImage(this.canvasPreview,
                0, begIndex, targetCanvas.width, targetCanvas.height,
                0, 0, targetCanvas.width, targetCanvas.height);
        }
    }

    // load images form files
    public loadImagesFromFiles(files: Array<File>): void {
        for (let file of files) {
            let imageInfo = new ImageInfo();
            imageInfo.onloadImageFile = imageInfo => {
                // add image info
                this.imageInfos.push(imageInfo);
                this.updatePreview();
                // call event
                if (this.onloadImageFile != null)
                    this.onloadImageFile(imageInfo);
            }
            imageInfo.loadImageFromFile(file);
        }
    }
}