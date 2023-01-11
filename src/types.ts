export type UnknownProperties = { [key: string | symbol]: unknown };

export type Issue = { timestamp: number, clientId: string, ip: string };

export type ExternalResponse = {
	latitude: number | null,
	longitude: number | null,
	country: string | null,
	region: string | null,
	city: string | null,
}

export type OutputMessage = Issue & ExternalResponse & UnknownProperties;

export interface Observer {
	update(issue: Issue | OutputMessage): void
}

export interface Observable {
	_observers: Observer[];

	addObserver(...subjects: Observer[]): void;

	notifyObservers(issue: Issue): void;
}

export interface CacheClient {
	set(key: string, value: string, ttl?: number): void;

	get(key: string): Promise<OutputMessage | null>;
}
