import {ConsumerRunConfig} from 'kafkajs';

export type UnknownProperties = { [key: string | symbol]: unknown };

export type Issue = { timestamp: number, clientId: string, ip: string };

export type Location = {
	latitude: number | null,
	longitude: number | null,
	country: string | null,
	region: string | null,
	city: string | null,
}

export type OutputMessage = Issue & Location & UnknownProperties;

export interface Observer {
	update(issue: Issue | OutputMessage): void
}

export interface Observable {
	addObserver(...subjects: Observer[]): void;

	notifyObservers(issue: Issue): void;
}

/**
 * An Observable that is an entrypoint for its observers.
 */
export interface ObserverStartPoint extends Observable {
	run(options: ConsumerRunConfig): void;
}

export interface CacheClient {
	set(key: string, value: string, ttl?: number): void;

	get(key: string): Promise<OutputMessage | null>;
}

export type Configuration = {
	locationInputTopicName: string,
	locationOutputTopicName: string,
	locationApiKey: string,
	locationApiEndpoint: string,
	kafkaBrokerHost: string,
	kafkaBrokerPort: number,
	redisHost: string,
	redisPort: number,
	clientId: string,
}
