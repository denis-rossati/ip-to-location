import {Kafka} from 'kafkajs';
import {KAFKA_BROKER_HOST, KAFKA_BROKER_PORT, LOCATION_INPUT_TOPIC_NAME, LOCATION_OUTPUT_TOPIC_NAME} from './constants';
import {LocationMediator} from '../src/application/LocationMediator';
import {LocationConsumer} from '../src/infrastructure/kafka';
import {LocationProducer} from '../src/infrastructure/kafka/LocationProducer';
import {eventHandler} from '../src/utils';
import {CacheAdapter} from '../src/infrastructure/cache';
import Redis from 'ioredis';

async function main() {
	const kafkaClient = new Kafka({
		clientId: 'location_evaluation',
		brokers: [`${KAFKA_BROKER_HOST}:${KAFKA_BROKER_PORT}`],
	});

	const admin = kafkaClient.admin();
	await admin.connect();
	const topics = await admin.listTopics();

	const uncreatedTopics = [];

	// Create topics if they don't exist
	if (LOCATION_INPUT_TOPIC_NAME && !topics.includes(LOCATION_INPUT_TOPIC_NAME)) {
		uncreatedTopics.push(LOCATION_INPUT_TOPIC_NAME);
	}

	if (LOCATION_OUTPUT_TOPIC_NAME && !topics.includes(LOCATION_OUTPUT_TOPIC_NAME)) {
		uncreatedTopics.push(LOCATION_OUTPUT_TOPIC_NAME);
	}

	const topicList = uncreatedTopics.map((topic) => ({topic}));
	await admin.createTopics({topics: topicList});
	await admin.disconnect();

	const redis = new Redis('host.docker.internal:6379');
	const cacheClient = new CacheAdapter(redis);

	const locationMediator = new LocationMediator(cacheClient);
	const locationConsumer = new LocationConsumer(kafkaClient);
	const locationProducer = new LocationProducer(kafkaClient);

	locationConsumer.addObserver(locationMediator);
	locationMediator.addObserver(locationProducer);

	await locationConsumer.connect(LOCATION_INPUT_TOPIC_NAME);
	await locationProducer.connect(LOCATION_OUTPUT_TOPIC_NAME);

	await locationConsumer.run({
		eachMessage: eventHandler(locationConsumer),
	});
}

main().catch(console.error);
