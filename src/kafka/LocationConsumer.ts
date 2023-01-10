import {Observable, Observer} from "../types";

class Kafka {
}

class Consumer {
}

export class LocationConsumer implements Observable {
    _observers: Observer[] = [];

    private readonly _client?: Kafka;

    private readonly _consumer: Consumer;

    private _isConnected = false;

    constructor(client: Kafka, groupId?: string) {
        this._client = client;

        this._consumer = this.client.consumer({groupId: groupId || 'webserver'});
    }
}
