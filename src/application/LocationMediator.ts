import {Issue, Observable, Observer} from '../types';
import {LocationRequest} from '../infrastructure/http/LocationRequest';

export class LocationMediator implements Observer, Observable {
	_observers: Observer[] = [];

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

	public async generateLocation({ip, clientId, timestamp}: Issue): Promise<void> {
		// @TODO: check for cached response before fetching location

		const location = await LocationRequest.fetch(ip).catch(() => null);

		if (location !== null) {
			const outputMessage = {...location, clientId, timestamp, ip};

			this.notifyObservers(outputMessage);
		}
	}

	get observers() {
		return this._observers;
	}

	private set observers(observers) {
		this._observers = observers;
	}
}
