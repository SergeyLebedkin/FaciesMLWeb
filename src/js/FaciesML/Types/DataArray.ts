// DataArrayType
export enum DataArrayType {
    DATA_ARRAY_TYPE_VALUE,
    DATA_ARRAY_TYPE_FACIE,
    DATA_ARRAY_TYPE_SAMPLES,
}

export const DATA_MINIMAL_VALUE = -999;

// DataArray
export class DataArray {
    // fields
    public name: string = "";
    public unit: string = "";
    public min: number = 0;
    public max: number = 0;
    public values: Array<number> = [];
    public valuesPredict: Array<number> = [];
    public dataArrayType: DataArrayType = DataArrayType.DATA_ARRAY_TYPE_VALUE;
    // constructor
    constructor() {
        this.name = "";
        this.unit = "";
        this.min = 0;
        this.max = 0;
        this.values = [];
        this.valuesPredict = null;
        this.dataArrayType = DataArrayType.DATA_ARRAY_TYPE_VALUE;
    }

    // getCaption
    public getCaption(): string {
        if (this.isPredict())
            return this.name + " (predict)";
        if (this.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_SAMPLES)
            return this.name + " (samples)";
        return this.name;
    }

    // isPredict
    public isPredict(): boolean {
        return ((this.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_VALUE) && this.valuesPredict && 
            (this.values.length <= this.valuesPredict.length));
    }

    // updateMinMax
    public updateMinMax() {
        // get min and max values
        let localData = this.values.filter(value => value > DATA_MINIMAL_VALUE);
        if (localData.length > 0) {
            let minValue = localData[0];
            let maxValue = localData[0];
            for (let value of localData) {
                minValue = Math.min(minValue, value);
                maxValue = Math.max(maxValue, value);
            }
            this.min = minValue;
            this.max = maxValue;
        } else {
            let minValue = this.values[0];
            let maxValue = this.values[0];
            for (let value of this.values) {
                if (value > DATA_MINIMAL_VALUE) {
                    minValue = Math.min(minValue, value);
                    maxValue = Math.max(maxValue, value);
                }
            }
            this.min = minValue;
            this.max = maxValue;
        }
    }

    // loadValuesFromJSON
    public loadValuesFromJSON(json: any) {
        this.values = [];
        this.values.length = Object.keys(json).length;
        for (let index in json)
            this.values[parseInt(index)] = json[index];
        this.updateMinMax();
    }

    // loadFromJSON
    public loadPredictFromJSON(json: any) {
        this.valuesPredict = [];
        this.valuesPredict.length = Object.keys(json).length;
        for (let index in json)
            this.valuesPredict[parseInt(index)] = json[index];
    }
};
