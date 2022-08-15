import { createElement } from '../../core/dom';
import { Observer } from '../../core/observer';

import './styles.css';

export interface IFilterChangeEvent {
    range: {
        begin: string;
        end: string;
    }
}

/*
This component renders two select controls and manage them.
*/
class Filter extends Observer {
    readonly element: HTMLDivElement;
    private selectControls;
    private form;

    constructor() {
        super();

        this.selectControls = {
            begin: createElement('select', { class: 'filter__select', name: 'begin' }, [
                createElement('option', {}, '—')
            ]),
            end: createElement('select', { class: 'filter__select', name: 'end' }, [
                createElement('option', {}, '—')
            ])
        };
        this.form = createElement('form', { class: 'filter__form' }, [
            createElement('label', { class: 'filter__label' }, this.selectControls.begin),
            createElement('label', { class: 'filter__label' }, this.selectControls.end)
        ]);
        this.element = createElement('div', { class: 'filter' }, this.form);

        this.disableSelects();

        this.form.addEventListener('change', this.selectChangeHandler);
    }

    private selectChangeHandler = (event: Event) => {
        const select = event.target as HTMLSelectElement;
        const currentRange = this.range;

        /*
        Processing the case of the intersection of intervals.
        If begin > end, just set the appropriate parameter to the default value.
        */
        if (currentRange.begin > currentRange.end) {
            if (select.name === 'begin') {
                this.selectControls.begin.selectedIndex = 0;
            } else if (select.name === 'end') {
                this.selectControls.end.selectedIndex = this.selectControls.end.length - 1;
            }
        }

        this.trigger('change', { range: this.range } as IFilterChangeEvent);
    }

    public get range() {
        return {
            begin: this.selectControls.begin.value,
            end: this.selectControls.end.value
        }
    }

    public disableSelects() {
        Object.values(this.selectControls).forEach(selectControl => {
            selectControl.setAttribute('disabled', 'disabled');
        });
    }

    public enableSelects() {
        Object.values(this.selectControls).forEach(selectControl => {
            selectControl.removeAttribute('disabled');
        });
    }

    public updateSelects(optionsList: string[]) {
        const rangeBeginOuterHTML = optionsList.map((year, index) => {
            return createElement('option', {
                value: year,
                selected: index === 0 ? 'selected' : ''
            }, year).outerHTML;
        });
        const rangeEndOuterHTML = optionsList.map((year, index) => {
            return createElement('option', {
                value: year,
                selected: index === optionsList.length - 1 ? 'selected' : ''
            }, year).outerHTML;
        });

        this.selectControls.begin.innerHTML = rangeBeginOuterHTML.join('');
        this.selectControls.end.innerHTML = rangeEndOuterHTML.join('');

        this.enableSelects();
    }

    public render() {
        return this.element;
    }
}

export default Filter;
