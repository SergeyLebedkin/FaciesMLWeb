// ImageInfo
export class ImageInfo {
    // file reference
    public fileRef: File = null;
    public baseName: String = null;
    // propertis
    public minDepth: number = null;
    public maxDepth: number = null;
    // canvases
    public canvasImage: HTMLCanvasElement = null;
    // events
    public onloadImageFile: (this: ImageInfo, imageInfo: ImageInfo) => any = null;

    // constructor
    constructor() {
        // file reference
        this.fileRef = null;
        // propertis
        this.minDepth = 0;
        this.maxDepth = 0;
        // canvases
        this.canvasImage = document.createElement("canvas");
        // events
        this.onloadImageFile = null;
    }

    // loadImageFromFile
    public loadImageFromFile(file: File): void {
        // check for null
        if (file === null) return;
        // store name
        this.fileRef = file;
        this.baseName = this.fileRef.name.split('.').slice(0, -1).join('.');
        this.minDepth = parseFloat(this.baseName.split('-')[0]);
        this.maxDepth = parseFloat(this.baseName.split('-')[1]);
        // read file
        var fileReader = new FileReader();
        fileReader.onload = event => {
            let image = new Image();
            // load image from file data
            image.onload = event => {
                // copy image to canvas
                this.canvasImage.width = image.width;
                this.canvasImage.height = image.height;
                let canvasImageCtx = this.canvasImage.getContext("2d") as CanvasRenderingContext2D;
                canvasImageCtx.drawImage(image, 0, 0);
                // call event
                if (this.onloadImageFile != null)
                    this.onloadImageFile(this);
            }
            image.src = event.currentTarget["result"];
        }
        fileReader.readAsDataURL(this.fileRef);
    }
}