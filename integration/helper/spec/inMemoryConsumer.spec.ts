import {Issue, Observer} from '../../src/types';
import {InMemoryConsumer} from './inMemoryConsumer';

describe('inMemoryConsumer', () => {
	describe('observable interface methods.', () => {
		let observerSpy1: Observer;
		let observerSpy2: Observer;

		beforeEach(() => {
			observerSpy1 = {update: jest.fn()} as unknown as Observer;
			observerSpy2 = {update: jest.fn()} as unknown as Observer;
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('addObserver method.', () => {
			it('Should add observers.', () => {
				const inMemoryConsumer = new InMemoryConsumer();
				inMemoryConsumer.addObserver(observerSpy1, observerSpy2);

				const actual = inMemoryConsumer.observers;
				const expected = [observerSpy1, observerSpy2];

				expect(actual).toEqual(expected);
			});
		});

		describe('notifyObservers method.', () => {
			it('Should notify the observers.', () => {
				const issue: Issue = {ip: '1.1.1.1', clientId: 'bar', timestamp: 0};

				const inMemoryConsumer = new InMemoryConsumer();
				inMemoryConsumer.addObserver(observerSpy1, observerSpy2);
				inMemoryConsumer.notifyObservers(issue);

				expect(observerSpy1.update).toBeCalledWith(issue);
				expect(observerSpy1.update).toBeCalledTimes(1);


				expect(observerSpy2.update).toBeCalledWith(issue);
				expect(observerSpy2.update).toBeCalledTimes(1);
			});
		});
	});

});
