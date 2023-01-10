import {Kafka} from 'kafkajs';
import {LOCATION_INPUT_TOPIC_NAME} from './constants';

async function main(kafkaClient: Kafka) {
	const admin = kafkaClient.admin();
	await admin.connect();
	const topics = await admin.listTopics();

	const uncreatedTopics = [];

	// Create topics if they don't exist
	if (LOCATION_INPUT_TOPIC_NAME && !topics.includes(LOCATION_INPUT_TOPIC_NAME)) {
		uncreatedTopics.push(LOCATION_INPUT_TOPIC_NAME);
	}

	await admin.createTopics({
		topics: uncreatedTopics.map((topic) => ({topic})),
	});
}
