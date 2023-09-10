import {CacheClient, Configuration, ObserverStartPoint} from './types';
import {Admin, Kafka} from 'kafkajs';
import Redis from 'ioredis';
import {CacheAdapter} from './infrastructure/cache';
import {LocationMediator} from './application';
import {LocationConsumer, LocationProducer} from './infrastructure/observer';
import {eventHandler} from './utils';
import {IpStackAbstraction} from './infrastructure/ipstack';

export class DependencyContainer {
	private readonly _dependencies: Configuration;

	private kafkaAdmin?: Admin;

	private kafkaClient?: Kafka;

	private cacheClient?: CacheClient;

	constructor(dependencies: Configuration) {
		this._dependencies = dependencies;
	}

	async run(): Promise<void> {
		await this.createTopics();

		const startPoint: ObserverStartPoint = await this.setupLocationObserver();

		await startPoint.run({eachMessage: eventHandler(startPoint)});
	}

	async setupLocationObserver(): Promise<ObserverStartPoint> {
		const locationResolver = new IpStackAbstraction(
			this.dependencies.locationApiKey,
			this.dependencies.locationApiEndpoint,
			{
				latitude: 'number',
				longitude: 'number',
				country_name: 'string',
				region_name: 'string',
				city: 'string',
			}
		);

		const locationMediator = new LocationMediator(
			locationResolver,
			this.getCacheClient(),
		);

		const locationConsumer = new LocationConsumer(this.getKafkaClient());
		const locationProducer = new LocationProducer(this.getKafkaClient());

		locationConsumer.addObserver(locationMediator);
		locationMediator.addObserver(locationProducer);

		await locationConsumer.connect(this.dependencies.locationInputTopicName);
		await locationProducer.connect(this.dependencies.locationOutputTopicName);

		return locationConsumer;
	}

	private getCacheClient() {
		if (this.cacheClient === undefined) {
			const redis = new Redis(`${this.dependencies.redisHost}:${this.dependencies.redisPort}`);
			this.cacheClient = new CacheAdapter(redis);
		}

		return this.cacheClient;
	}

	private async getKafkaAdmin(): Promise<Admin> {
		if (this.kafkaAdmin === undefined) {
			const admin = this.getKafkaClient().admin();
			await admin.connect();

			this.kafkaAdmin = admin;
		}

		return this.kafkaAdmin;
	}

	private async createTopics(): Promise<void> {
		const topicList = [
			this.dependencies.locationInputTopicName,
			this.dependencies.locationOutputTopicName,
		].map((topic) => ({topic}));

		const kafkaAdmin = await this.getKafkaAdmin();

		await kafkaAdmin.createTopics({topics: topicList});
	}

	private getKafkaClient(): Kafka {
		if (this.kafkaClient === undefined) {
			this.kafkaClient = new Kafka({
				clientId: this.dependencies.clientId,
				brokers: [`${this.dependencies.kafkaBrokerHost}:${this.dependencies.kafkaBrokerPort}`],
			});
		}

		return this.kafkaClient;
	}

	private get dependencies() {
		return this._dependencies;
	}
}
