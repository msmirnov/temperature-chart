import { DataType, IDataRow } from '../../../@types/global';
import { createElement } from '../../core/dom';
import IndexedDb from '../../core/indexedDb';

import Chart from '../Chart';
import Toggler, { ITogglerChangeEvent } from '../Toggler';
import Filter, { IFilterChangeEvent } from '../Filter';

import './styles.css';

/*
The main component of this application.
It connects all entities and configure interaction between them.
*/
class App {
    readonly element: HTMLDivElement;
    private db = new IndexedDb('weather', Object.values(DataType));
    private ChartComponent;
    private TogglerComponent;
    private FilterComponent;
    private data?: IDataRow[];
    // Show the temperature data by default
    private dataType: DataType = DataType.Temperature;

    constructor() {
        this.ChartComponent = new Chart();
        this.TogglerComponent = new Toggler(this.dataType);
        this.FilterComponent = new Filter();

        this.element = createElement('div', { class: 'app' }, [
            createElement('div', { class: 'app__main' }, [
                createElement('div', { class: 'app__filters' }, [
                    this.TogglerComponent.render(),
                    this.FilterComponent.render()
                ]),
                createElement('div', { class: 'app__chart' }, this.ChartComponent.render()),
                createElement('div', { class: 'app__debug' })
            ])
        ]);

        this.TogglerComponent.on('change', this.togglerComponentChangeHandler);
        this.FilterComponent.on('change', this.filterComponentChangeHandler);

        // Draw the chart with default datatype
        this.getDataAndUpdateChart(this.dataType);
    }

    private static getAPIUrl(dataType: DataType) {
        return `http://localhost:9000/data/${dataType}.json`;
    }

    private async getData(dataType: DataType): Promise<IDataRow[]> {
        let data = await this.db.get(dataType) as IDataRow[];

        // If there is no data in database, we make a request to the API
        if (!data.length) {
            const fetchedData = await fetch(App.getAPIUrl(dataType));
            const fetchedDataJson = await fetchedData.json();

            // Fill the database with the received data
            data = await this.db.fill(dataType, fetchedDataJson) as IDataRow[];
        }

        return data;
    }

    /*
    When changing filters, we do not request data from the db.
    Instead, we just take a subarray.
    */
    private filterComponentChangeHandler = async (event: IFilterChangeEvent) => {
        if (!this.data) {
            return new Error('Data is not ready');
        }

        let beginIndex = 0;
        let endIndex = this.data.length - 1;

        /*
        The next two for's helps to find the indexes of elements in data.
        We need to find the first item of `begin` year and the last item of `end` year.
        Implemented in such a way as not to use methods `findIndex` and `findLastIndex`,
        because `findLastIndex` has weak browser support.
        */

        for (beginIndex; beginIndex < this.data.length; beginIndex++) {
            if (this.data[beginIndex].t.startsWith(event.range.begin.toString())) {
                break;
            }
        }

        for (endIndex; endIndex >= 0; endIndex--) {
            if (this.data[endIndex].t.startsWith(event.range.end.toString())) {
                break;
            }
        }

        this.ChartComponent.draw(this.dataType, this.data.slice(beginIndex, endIndex + 1));
    }

    /*
    When changing datatype toggler, we request data from the db and reinitialize the chart.
    */
    private togglerComponentChangeHandler = async (event: ITogglerChangeEvent) => {
        await this.getDataAndUpdateChart(event.dataType);
    }

    private async getDataAndUpdateChart(dataType: DataType) {
        this.ChartComponent.showLoader();

        this.data = await this.getData(dataType);

        /*
        Building lists of years for filter selects.
        */
        const optionsList = this.data.reduce((result, item) => {
            result.add(item.t.split('-')[0]);
            return result;
        }, new Set());

        this.FilterComponent.updateSelects(Array.from(optionsList) as string[]);

        this.ChartComponent.draw(dataType, this.data);
        this.ChartComponent.hideLoader();

        this.dataType = dataType;
    }

    public render() {
        return this.element;
    }
}

export default App;
