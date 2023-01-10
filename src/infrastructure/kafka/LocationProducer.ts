import {Kafka, Partitioners, Producer} from 'kafkajs';
import {Observer, OutputMessage} from '../../types';

export class LocationProducer implements Observer {
	private readonly _client?: Kafka;

	private readonly _producer?: Producer;

	private _isConnected = false;

	private _topics: string[] = [];

	constructor(client: Kafka) {
		this._client = client;

		this._producer = this._client.producer({
			createPartitioner: Partitioners.LegacyPartitioner,
		});
	}

	async connect(topic?: string) {
		if (topic !== undefined) {
			this.topics = [...this.topics, topic];
		}

		if (this.client === undefined || this.producer === undefined) {
			throw new Error('A Kafka client must be supplied through connection.');
		}

		try {
			await this.producer.connect();

			this.isConnected = true;

			return this;
		} catch (e) {
			throw new Error(e as string);
		}
	}

	async update(issue: OutputMessage) {
		if (!this.isConnected || this.producer === undefined) {
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
		return this._producer;
	}

	private get client() {
		return this._client;
	}
}
