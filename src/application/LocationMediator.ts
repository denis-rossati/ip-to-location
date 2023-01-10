import {Issue, Observable, Observer} from '../types';

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

	private async generateLocation({ip, clientId, timestamp}: Issue) {
		// @TODO: check for cached response before fetching location

		const location = await LocationRequest.fetch(ip);
	}

	get observers() {
		return this._observers;
	}

	private set observers(observers) {
		this._observers = observers;
	}
}
