// DataArrayType
export enum DataArrayType {
    DATA_ARRAY_TYPE_VALUES,
    DATA_ARRAY_TYPE_FACIES,
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
    public recomended: boolean = false;
    public values: Array<number> = [];
    public valuesPredict: Array<number> = null;
    public sampleMasks: Array<DataArray> = []; // only for DATA_ARRAY_TYPE_FACIES!
    public dataArrayType: DataArrayType = DataArrayType.DATA_ARRAY_TYPE_VALUES;
    // constructor
    constructor() {
        this.name = "";
        this.unit = "";
        this.min = 0;
        this.max = 0;
        this.recomended = false;
        this.values = [];
        this.valuesPredict = null;
        this.sampleMasks = [];
        this.dataArrayType = DataArrayType.DATA_ARRAY_TYPE_VALUES;
    }

    // getCaption
    public getCaption(): string {
        // if array is predict
        if (this.isPredict())
            return this.name + " (predict)";
        // if array is samples
        if (this.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_SAMPLES) {
            if (this.recomended)
                return this.name + " (recomended)";
            else
                return this.name;
        }
        // all other
        return this.name;
    }

    // isPredict
    public isPredict(): boolean {
        return ((this.dataArrayType === DataArrayType.DATA_ARRAY_TYPE_VALUES) && this.valuesPredict &&
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

    // getOrCreateDataArray - find or create data array
    public getOrCreateSampleMask(name: string): DataArray {
        let dataArray = this.sampleMasks.find(dataArray => dataArray.name === name);
        if (!dataArray) {
            dataArray = new DataArray();
            dataArray.name = name;
            this.sampleMasks.push(dataArray);
        }
        return dataArray;
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

    // loadFromCommaString
    public loadFromCommaString(str: string): void {
        this.values = [];
        str.split(",").forEach(value => this.values.push(parseInt(value)));
    }
};
