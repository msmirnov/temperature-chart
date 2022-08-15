/*
Wrapper function that helps to create DOM elements.
*/
export function createElement<T extends keyof HTMLElementTagNameMap, K extends HTMLElement | string>(
    type: T,
    props?: { [key: string]: string },
    children?: Array<K> | K
): HTMLElementTagNameMap[T] {
    const element = document.createElement(type);

    for (const prop in props) {
        if (props[prop]) {
            element.setAttribute(prop, props[prop]);
        }
    }

    if (children) {
        if (Array.isArray(children)) {
            children.forEach(item => {
                element.append(item);
            });
        } else {
            element.append(children);
        }
    }

    return element;
}
