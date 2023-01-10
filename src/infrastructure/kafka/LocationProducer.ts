import {Kafka, Partitioners, Producer} from "kafkajs";
import {Observer} from "../../types";

export class LocationProducer implements Observer {
    private readonly _client?: Kafka;

    constructor(client: Kafka) {
        this._client = client;
    }

    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    set isConnected(value: boolean) {
        this._isConnected = value;
    }

    private _topics: string[] = [];

    get topics() {
        return this._topics;
    }

    set topics(topics: string[]) {
        this._topics = topics;
    }

    private _producer?: Producer;

    private get producer() {
        if (this._producer === undefined) {
            throw new Error('A Kafka producer must be supplied through connection.');
        }

        return this._producer;
    }

    private set producer(producer: Producer) {
        this._producer = producer;
    }

    private get client() {
        if (this._client === undefined) {
            throw new Error('A Kafka client must be supplied through connection.');
        }

        return this._client;
    }

    async connect(topic?: string) {
        try {
            if (topic !== undefined) {
                this.topics = [...this.topics, topic];
            }

            this.producer = this.client.producer({
                createPartitioner: Partitioners.LegacyPartitioner,
            });

            await this.producer.connect();

            this.isConnected = true;

            return this;
        } catch (e) {
            throw new Error(e as string);
        }
    }
}
