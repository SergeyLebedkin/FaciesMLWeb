import { DataValues } from "../Types/DataValues";

export class RenderWindow {
    public centerX: number = 0.0;
    public centerY: number = 0.0;
    public width: number = 0.0;
    public height: number = 0.0;
    public scale: number = 1.0;

    // reset
    public reset(axisX: DataValues, axisY: DataValues): void {
        if (axisX && axisY) {
            console.log(axisX);
            console.log(axisY);
            this.centerX = (axisX.max + axisX.min) * 0.5;
            this.centerY = (axisY.max + axisY.min) * 0.5;
            this.height = (axisY.max - axisY.min);
            this.width = (axisX.max - axisX.min);
            this.scale = 1.0;
        }
    }

    // transfromX (transfrom value to -1..1 range)
    public transfromX(x: number) {
        return 2 * (x - this.centerX) / this.width * this.scale;
    }

    // transfromY (transfrom value to -aspect..aspect range)
    public transfromY(y: number) {
        return 2 * (y - this.centerY) / this.height * this.scale;
    }
}