import {Consumer, ConsumerRunConfig, Kafka} from "kafkajs";
import {Issue, Observable, Observer} from "../../types";

export class LocationConsumer implements Observable {
    private readonly _client?: Kafka;
    private readonly _consumer: Consumer;

    constructor(client: Kafka, groupId?: string) {
        this._client = client;

        this._consumer = this.client.consumer({groupId: groupId || 'webserver'});
    }

    _observers: Observer[] = [];

    get observers() {
        return this._observers;
    }

    private set observers(observers) {
        this._observers = observers;
    }

    private _isConnected = false;

    get isConnected() {
        return this._isConnected;
    }

    private set isConnected(isConnected: boolean) {
        this._isConnected = isConnected;
    }

    get client() {
        if (this._client === undefined) {
            throw new Error('A Kafka client must be supplied through class construction.');
        }

        return this._client;
    }

    private get consumer() {
        if (this._consumer === undefined) {
            throw new Error('A Kafka consumer must be supplied through class construction.');
        }

        return this._consumer;
    }

    async connect(topic?: string) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({topic: topic || 'location_input'});

            this.isConnected = true;
            return this;
        } catch (e) {
            throw new Error(e as string);
        }
    }

    async run(options: ConsumerRunConfig = {}) {
        if (!this.isConnected) {
            throw new Error('The consumer must be connected before reading a topic.');
        }

        try {
            await this.consumer.run(options);
        } catch (e) {
            throw new Error(e as string);
        }
    }

    notifyObserver(issue: Issue) {
        this.observers.forEach((observer) => observer.update(issue));
    }

    addObserver(...subjects: Observer[]) {
        this.observers = [...this.observers, ...subjects];
    }
}
