interface IWorkerWrapperPayload {
    dbName: string;
    method: string;
    objectStorageName: string;
    json?: object[];
}

/*
This class allows to work with the IndexedDb by performing heavy queries in the worker.
*/
class IndexedDb {
    private dbName: string;
    private request: IDBOpenDBRequest;
    private db?: IDBDatabase;

    constructor(dbName: string, objectStoragesNames: string[]) {
        this.dbName = dbName;
        this.request = globalThis.indexedDB.open(this.dbName);

        this.request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            for (const objectStorageName of objectStoragesNames) {
                db.createObjectStore(objectStorageName, { keyPath: 't' });
            }
        }

        this.request.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
        }

        this.request.onerror = (event) => {
            console.error(event);
        }

        this.request.onblocked = (event) => {
            console.error(event);
        }
    }

    /*
    Method that create a worker and terminate it after receiving a response.
    */
    private async runWorker(payload: IWorkerWrapperPayload): Promise<object[]> {
        const worker = new Worker(new URL('./worker.ts', import.meta.url));

        worker.postMessage(payload);

        return new Promise((resolve) => {
            worker.onmessage = (event) => {
                worker.terminate();
                resolve(event.data);
            }
        });
    }

    public async get(objectStorageName: string): Promise<object[]> {
        return await this.runWorker({
            dbName: this.dbName,
            method: 'get',
            objectStorageName
        });
    }

    public async fill(objectStorageName: string, json: object[]): Promise<object[]> {
        return await this.runWorker({
            dbName: this.dbName,
            method: 'fill',
            objectStorageName,
            json
        });
    }
}

export default IndexedDb;
