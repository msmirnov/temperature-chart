import { IDataRow, DataType } from '../../../@types/global';
import { createElement } from '../../core/dom';
import Canvas from '../Canvas';

import './styles.css';

const options = {
    precipitation: {
        gridStep: 10,
        colors: {
            text: '#000',
            grid: '#CCC',
            line: '#00F'
        }
    },
    temperature: {
        gridStep: 5,
        colors: {
            text: '#000',
            grid: '#CCC',
            line: '#F00'
        }
    }
};

/*
This class is just a wrapper over the canvas. It helps to build a DOM and to manage loader visibility.
*/
class Chart {
    readonly element: HTMLDivElement;
    private wrapper;
    private loader;
    private canvas?: Canvas;
    private loaderCounter = 0;

    constructor() {
        this.wrapper = createElement('div', { class: 'chart__wrapper' });
        this.loader = createElement('div', { class: 'chart__loader' }, [
            createElement('div', { class: 'chart__fade' }),
            createElement('div', { class: 'chart__spinner' })
        ]);
        this.element = createElement('div', { class: 'chart' }, [
            this.wrapper,
            this.loader
        ]);
    }

    public showLoader() {
        this.loaderCounter += 1;
        this.loader.classList.add('chart__loader_visible');
    }

    public hideLoader() {
        this.loaderCounter -= 1;

        if (this.loaderCounter > 0) {
            return;
        }

        this.loader.classList.remove('chart__loader_visible');
    }

    public draw(dataType: DataType, data: IDataRow[]) {
        this.canvas = new Canvas(data, {
            ...options[dataType],
            width: this.wrapper.clientWidth,
            height: this.wrapper.clientHeight
        });

        this.wrapper.innerHTML = '';
        this.wrapper.append(this.canvas.render());
    }

    public render() {
        return this.element;
    }
}

export default Chart;
