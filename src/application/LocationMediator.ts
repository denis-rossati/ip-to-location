import {CacheClient, Issue, Observable, Observer} from '../types';
import {LocationRequest, Options} from '../infrastructure/http';

export class LocationMediator implements Observer, Observable {
	_observers: Observer[] = [];

	_cache: CacheClient | null = null;

	_endpointOptions: Options;

	constructor(cache: CacheClient | null = null, endpointOptions: Options) {
		this._cache = cache;
		this._endpointOptions = endpointOptions;
	}


	addObserver(...subjects: Observer[]) {
		this.observers = [...this.observers, ...subjects];
	}

	notifyObservers(issue: Issue) {
		this.observers.forEach((observer) => observer.update(issue));
	}

	async update(issue: Issue) {
		try {
			await this.generateLocation(issue);
		} catch (e) {
			throw new Error(e as string);
		}
	}

	async generateLocation({ip, clientId, timestamp}: Issue): Promise<void> {
		let outputMessage;
		const cacheKey = `${clientId}-${ip}`;

		if (this.cache !== null) {
			outputMessage = await this.cache.get(cacheKey);

			if (outputMessage !== null) {
				this.notifyObservers(outputMessage);

				return;
			}
		}

		const location = await LocationRequest.fetch(ip, this.endpointOptions).catch(() => null);

		if (location !== null) {
			outputMessage = {...location, clientId, timestamp, ip};

			this.notifyObservers(outputMessage);

			if (this.cache !== null) {
				this.cache.set(cacheKey, JSON.stringify(outputMessage));
			}
		}
	}

	get cache() {
		return this._cache;
	}

	set cache(cache: CacheClient | null) {
		this._cache = cache;
	}

	get observers() {
		return this._observers;
	}

	private set observers(observers) {
		this._observers = observers;
	}

	get endpointOptions() {
		return this._endpointOptions;
	}
}
