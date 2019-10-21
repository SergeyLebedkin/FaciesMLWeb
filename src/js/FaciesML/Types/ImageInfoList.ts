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

    // getMinPixelValue
    public getMinPixelValue(): number {
        let minValue: number = Infinity;
        for (let imageInfo of this.imageInfos)
            minValue = Math.min(minValue, imageInfo.dpf);
        return minValue;
    }

    // grabSubImage
    // depth and height - fits
    public grabSubImage(targetCanvas: HTMLCanvasElement, depth: number, height: number): void {
        if (targetCanvas) {
            // get actual image infos
            let minDepth = depth - height / 2;
            let maxDepth = depth + height / 2;
            // get actual image infos
            let actualImageInfos: ImageInfo[] = [];
            for (let imageInfo of this.imageInfos) 
                if ((imageInfo.minDepth < maxDepth) && (imageInfo.maxDepth > minDepth))
                    actualImageInfos.push(imageInfo);
            // get target dpf
            let targetDpf = 0.0;
            for (let imageInfo of actualImageInfos) 
                targetDpf =+ imageInfo.dpf / actualImageInfos.length;
            // het target height
            let targetHeight = Math.floor(targetDpf * height);
            // reseze canvas
            targetCanvas.height = targetHeight*2;
            targetCanvas.width = this.canvasPreview.width*2;
            // clear canvas
            let targetCanvasCtx = targetCanvas.getContext("2d");
            targetCanvasCtx.fillStyle = "black";
            targetCanvasCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
            // draw target canvas
            for (let imageInfo of actualImageInfos) {
                // constants
                let sx = 0.0;
                let dx = 0.0;
                let sw = imageInfo.canvasImage.width;
                let dw = this.canvasPreview.width;
                // calculations
                let sy = (Math.max(minDepth, imageInfo.minDepth) - imageInfo.minDepth) * imageInfo.dpf;
                let dy = (Math.max(minDepth, imageInfo.minDepth) - minDepth) * targetDpf;
                let sh = (Math.min(maxDepth, imageInfo.maxDepth) - imageInfo.minDepth) * imageInfo.dpf - sy;
                let dh = (Math.min(maxDepth, imageInfo.maxDepth) - minDepth) * targetDpf - dy;
                sy = Math.floor(sy);
                dy = Math.floor(dy);
                sh = Math.floor(sh);
                dh = Math.floor(dh);
                // draw
                targetCanvasCtx.drawImage(imageInfo.canvasImage,
                    sx, sy, sw, sh,
                    dx*2, dy*2, dw*2, dh*2);
            }
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