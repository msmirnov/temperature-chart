import { DataType } from '../../../@types/global';

import { createElement } from '../../core/dom';
import { Observer } from '../../core/observer';

import './styles.css';

export interface ITogglerChangeEvent {
    dataType: DataType;
}

class Toggler extends Observer {
    readonly element: HTMLDivElement;

    constructor(private checkedValue: DataType) {
        super();

        this.element = createElement('div', { class: 'data-type-toggler' }, [
            createElement('input', {
                class: 'data-type-toggler__input',
                name: 'dataType',
                type: 'radio',
                id: 'data-type-toggler-temperature',
                value: DataType.Temperature,
                checked: checkedValue === DataType.Temperature ? 'checked' : ''
            }),
            createElement('label', {
                class: 'data-type-toggler__label',
                for: 'data-type-toggler-temperature',
                role: 'button',
                tabindex: '0'
            }, 'Temperature'),
            createElement('input', {
                class: 'data-type-toggler__input',
                name: 'dataType',
                type: 'radio',
                id: 'data-type-toggler-precipitation',
                value: DataType.Precipitation,
                checked: checkedValue === DataType.Precipitation ? 'checked' : ''
            }),
            createElement('label', {
                class: 'data-type-toggler__label',
                for: 'data-type-toggler-precipitation',
                role: 'button',
                tabindex: '0'
            }, 'Precipitation')
        ]);

        this.element.addEventListener('change', this.changeHandler);
        this.element.addEventListener('keypress', this.keypressHandler);
    }

    private changeHandler = (event: Event) => {
        const input = event.target as HTMLInputElement;

        if (input.name !== 'dataType') {
            return;
        }

        this.trigger('change', { dataType: input.value } as ITogglerChangeEvent);
    }

    /*
    This method add the basic a11y support and allows to interact with controls using a keyboard.
    */
    private keypressHandler = (event: KeyboardEvent) => {
        const label = event.target as HTMLLabelElement;
        const input = label.control as HTMLInputElement;

        if (['Enter', 'Space'].includes(event.code)) {
            input.click();
        }
    }

    public render() {
        return this.element;
    }
}

export default Toggler;
