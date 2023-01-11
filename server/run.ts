import {Kafka} from 'kafkajs';
import {LOCATION_INPUT_TOPIC_NAME, LOCATION_OUTPUT_TOPIC_NAME} from './constants';
import {LocationMediator} from '../src/application/LocationMediator';
import {LocationConsumer} from '../src/infrastructure/kafka';
import {LocationProducer} from '../src/infrastructure/kafka/LocationProducer';

async function main(kafkaClient: Kafka) {
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

	await admin.createTopics({
		topics: uncreatedTopics.map((topic) => ({topic})),
	});

	admin.disconnect();

	const locationMediator = new LocationMediator();
	const locationConsumer = new LocationConsumer(kafkaClient);
	const locationProducer = new LocationProducer(kafkaClient);

	locationConsumer.addObserver(locationMediator);
	locationMediator.addObserver(locationProducer);

	await locationConsumer.connect(LOCATION_INPUT_TOPIC_NAME);
	await locationProducer.connect(LOCATION_OUTPUT_TOPIC_NAME);

	await locationConsumer.run({
		eachMessage: messageHandler(locationConsumer),
	})
}
