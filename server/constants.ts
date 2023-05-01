import dotenv from 'dotenv';
import path from 'path';
import {getEnvironmentVariable, getNumEnvironmentVariable} from '../src/utils';
import {Configuration} from '../src/types';

dotenv.config({path: path.join(process.cwd(), '.env')});

export const configuration: Configuration = {
	locationInputTopicName: getEnvironmentVariable('LOCATION_INPUT_TOPIC_NAME') ?? 'location_input',
	locationOutputTopicName: getEnvironmentVariable('LOCATION_OUTPUT_TOPIC_NAME') ?? 'location_output',
	// Go easy on my 50 monthly requests, please
	locationApiKey: getEnvironmentVariable('LOCATION_API_KEY') ?? 'f850fab28738fd82133ce51aec8e8ea7',
	locationApiEndpoint: getEnvironmentVariable('LOCATION_API_ENDPOINT') ?? 'http://api.ipstack.com',
	kafkaBrokerHost: getEnvironmentVariable('KAFKA_BROKER_HOST') ?? 'host.docker.internal',
	kafkaBrokerPort: getNumEnvironmentVariable('KAFKA_BROKER_PORT') ?? 9093,
	redisHost: getEnvironmentVariable('REDIS_HOST') ?? 'host.docker.internal',
	redisPort: getNumEnvironmentVariable('REDIS_PORT') ?? 6379,
	clientId: getEnvironmentVariable('KAFKA_CLIENT_ID') ?? 'location_evaluation',
};
