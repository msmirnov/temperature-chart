type IWorkerHandler = {
    [method in string]: (
        transaction: IDBTransaction,
        objectStore: IDBObjectStore,
        json?: object[]
    ) => Promise<object[]>;
}

const handlers: IWorkerHandler = {
    get: (_, objectStore) => {
        return new Promise((resolve) => {
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                resolve((event.target as IDBRequest).result);
            }
        });
    },
    fill: (transaction, objectStore, json) => {
        return new Promise((resolve, reject) => {
            if (!json) {
                return reject(new Error('Data is empty'));
            }

            json.forEach((row: object) => {
                objectStore.add(row);
            });

            const allData = handlers.get(transaction, objectStore);

            transaction.oncomplete = () => {
                resolve(allData);
            }
        });
    }
};

/*
This worker helps to interact with the IndexedDB API by performing operations in a separate thread.
*/
self.onmessage = ({ data }) => {
    const { dbName, method, objectStorageName, json } = data;

    globalThis.indexedDB.open(dbName).onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(objectStorageName, 'readwrite');
        const objectStore = transaction.objectStore(objectStorageName);

        const result = await handlers[method](transaction, objectStore, json);

        self.postMessage(result);
    }
}
