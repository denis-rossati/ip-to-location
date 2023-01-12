import {Observable, Observer} from '../src/types';

export class InMemoryConsumer implements Observable {
	_observers: Observer[] = [];

	notifyObservers(issue: Issue) {
		this.observers.forEach((observer) => observer.update(issue));
	}

	addObserver(...subjects: Observer[]) {
		this.observers = [...this.observers, ...subjects];
	}

	get observers() {
		return this._observers;
	}

	private set observers(observers) {
		this._observers = observers;
	}

}
