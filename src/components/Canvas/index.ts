import { IDataRow } from '../../../@types/global';
import { createElement } from '../../core/dom';

import './styles.css';

interface CanvasOptions {
    width: number;
    height: number;
    padding: number;
    gridStep: number;
    yLabelOffset: number;
    xLabelOffset: number;
    colors: {
        [ColorAlias in string]: string;
    }
}

const defaultOptions: CanvasOptions = {
    width: 0,
    height: 0,
    padding: 30,
    gridStep: 5,
    yLabelOffset: -5,
    xLabelOffset: 20,
    colors: {}
};

class Canvas {
    readonly element: HTMLCanvasElement;
    private dpi = globalThis.devicePixelRatio;
    private ctx: CanvasRenderingContext2D;
    private options: CanvasOptions;
    private viewport;
    private borders;

    constructor(private data: IDataRow[], options: Partial<CanvasOptions>) {
        this.element = createElement('canvas', { class: 'canvas' });
        this.ctx = this.element.getContext('2d') as CanvasRenderingContext2D;
        this.options = {
            ...defaultOptions,
            ...options
        };
        this.element.width = this.width;
        this.element.height = this.height;

        this.viewport = {
            height: this.element.height - 2 * this.padding,
            width: this.element.width - 2 * this.padding
        };

        this.borders = { max: 0, min: 0 };
        this.data.forEach(item => {
            if (item.v > this.borders.max) {
                this.borders.max = item.v;
            } else if (item.v < this.borders.min) {
                this.borders.min = item.v;
            }
        });
    }

    private get height() {
        return this.options.height * this.dpi;
    }

    private get width() {
        return this.options.width * this.dpi;
    }

    private get padding() {
        return this.options.padding * this.dpi;
    }

    private get yLabelOffset() {
        return this.options.yLabelOffset * this.dpi;
    }

    private get xLabelOffset() {
        return this.options.xLabelOffset * this.dpi;
    }

    private getCoordinateY(value: number) {
        const ratio = (value - this.borders.min) / (this.borders.max - this.borders.min);
        const coordinate = this.padding + this.viewport.height * (1 - ratio);

        return coordinate;
    }

    private getCoordinateX(value: number) {
        const ratio = value / this.data.length;
        const coordinate = this.padding + this.viewport.width * ratio;

        return coordinate;
    }

    private formatYear(date: string) {
        return date.split('-')[0];
    }

    private static drawLine(
        ctx: CanvasRenderingContext2D,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        color: string
    ) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
    }

    private drawAxisLabel(text: string, align: CanvasTextAlign, x: number, y: number) {
        this.ctx.save();
        this.ctx.fillStyle = this.options.colors.text;
        this.ctx.textBaseline = 'bottom';
        this.ctx.font = `${10 * this.dpi}px Arial`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    private drawGrid() {
        let currentValue = Math.round(this.borders.min);        

        while (currentValue <= this.borders.max) {
            const y = this.getCoordinateY(currentValue);
        
            Canvas.drawLine(
                this.ctx,
                this.padding,
                y,
                this.element.width - this.padding,
                y,
                this.options.colors.grid
            );
            Canvas.drawLine(
                this.ctx,
                this.padding,
                this.padding,
                this.padding,
                y,
                this.options.colors.grid
            );

            this.drawAxisLabel(currentValue.toString(), 'right', this.padding + this.yLabelOffset, y);

            currentValue += this.options.gridStep;
        }
    }

    private drawChart() {
        const startY = this.getCoordinateY(this.data[0].v);

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, startY);

        this.drawAxisLabel(
            this.formatYear(this.data[0].t),
            'center',
            this.padding,
            this.viewport.height + this.padding + this.xLabelOffset
        );
        this.drawAxisLabel(
            this.formatYear(this.data[this.data.length - 1].t),
            'center',
            this.padding + this.viewport.width,
            this.viewport.height + this.padding + this.xLabelOffset
        );

        for (let i = 1; i < this.data.length; i++) {
            const y = this.getCoordinateY(this.data[i].v);
            const x = this.getCoordinateX(i);

            this.ctx.lineTo(x, y);
        }

        this.ctx.strokeStyle = this.options.colors.line;
        this.ctx.stroke();
    }

    public render() {
        this.drawGrid();
        this.drawChart();

        return this.element;
    }
}

export default Canvas;
