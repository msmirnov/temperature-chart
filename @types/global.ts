export enum DataType {
    Precipitation = 'precipitation',
    Temperature = 'temperature'
}

export interface IDataRow {
    t: string;
    v: number;
}
