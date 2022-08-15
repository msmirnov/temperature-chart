// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObserverCallback = (payload: any) => void;
type ObserverListeners = {
    [EventType in string]?: ObserverCallback[]
};

/*
This class creates a mixin for components.
It helps to subscribe on particular events and to run callbacks.
*/
export class Observer {
    private listeners: ObserverListeners = {};

    public on(eventType: string, callback: ObserverCallback) {
        if (this.listeners[eventType]) {
            (this.listeners[eventType] as ObserverCallback[]).push(callback);
        } else {
            this.listeners[eventType] = [callback];
        }
    }

    public trigger(eventType: string, payload: object) {
        const listeners = this.listeners[eventType];

        if (!listeners) {
            return;
        }

        for (const listener of listeners) {
            listener(payload);
        }
    }
}
