import {Kafka, Partitioners, Producer} from 'kafkajs';
import {Observer, OutputMessage} from '../../types';

export class LocationProducer implements Observer {
	private readonly _client?: Kafka;

	private _isConnected = false;

	private _topics: string[] = [];

	private _producer?: Producer;

	constructor(client: Kafka) {
		this._client = client;
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

	async update(issue: OutputMessage) {
		if (!this.isConnected) {
			throw new Error('The producer must be connected before writing to a topic.');
		}

		this.topics.forEach((topic) => {
			this.producer.send({
				topic: topic,
				messages: [{value: Buffer.from(JSON.stringify(issue))}],
			});
		});
	}

	get isConnected(): boolean {
		return this._isConnected;
	}

	set isConnected(value: boolean) {
		this._isConnected = value;
	}

	get topics() {
		return this._topics;
	}

	set topics(topics: string[]) {
		this._topics = topics;
	}

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
}
