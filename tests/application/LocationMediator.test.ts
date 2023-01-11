import {Issue, Observer} from '../../src/types';
import {LocationMediator} from '../../src/application/LocationMediator';
import {LocationRequest} from '../../src/infrastructure/http/LocationRequest';

describe('The LocationMediator class', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('generateLocation methods.', () => {
		beforeEach(() => {
			jest.spyOn(LocationRequest, 'fetch').mockResolvedValue({
				city: 'foo',
				region: 'bar',
				country: 'baz',
				latitude: 0,
				longitude: 0,
			});
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should output full location.', async () => {
			jest.spyOn(LocationMediator.prototype, 'notifyObservers');

			const locationMediator = new LocationMediator();

			const dummy = {ip: '1.1.1.1', clientId: 'qux', timestamp: 0};
			await locationMediator.generateLocation(dummy);

			const expected = {
				ip: '1.1.1.1',
				city: 'foo',
				region: 'bar',
				country: 'baz',
				latitude: 0,
				longitude: 0,
				timestamp: 0,
				clientId: 'qux',
			};

			expect(LocationMediator.prototype.notifyObservers).toBeCalledWith(expected);
		});

		it('Should not update observers if external response is null.', async () => {
			jest.spyOn(LocationRequest, 'fetch').mockResolvedValue(null);
			jest.spyOn(LocationMediator.prototype, 'notifyObservers');

			const locationMediator = new LocationMediator();

			const dummy = {ip: '1.1.1.1', clientId: 'qux', timestamp: 0};
			await locationMediator.generateLocation(dummy);

			expect(LocationMediator.prototype.notifyObservers).not.toBeCalled();
		});

		it('Should not update observers if external response fails.', async () => {
			jest.spyOn(LocationRequest, 'fetch').mockRejectedValue('foo');
			jest.spyOn(LocationMediator.prototype, 'notifyObservers');

			const locationMediator = new LocationMediator();

			const dummy = {ip: '1.1.1.1', clientId: 'qux', timestamp: 0};
			await locationMediator.generateLocation(dummy);

			expect(LocationMediator.prototype.notifyObservers).not.toBeCalled();
		});
	});

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
				const locationMediator = new LocationMediator();
				locationMediator.addObserver(observerSpy1, observerSpy2);

				const actual = locationMediator.observers;
				const expected = [observerSpy1, observerSpy2];

				expect(actual).toEqual(expected);
			});
		});

		describe('notifyObservers method.', () => {
			it('Should notify the observers.', () => {
				const issue: Issue = {ip: '1.1.1.1', clientId: 'bar', timestamp: 0};

				const locationMediator = new LocationMediator();
				locationMediator.addObserver(observerSpy1, observerSpy2);
				locationMediator.notifyObservers(issue);

				expect(observerSpy1.update).toBeCalledWith(issue);
				expect(observerSpy1.update).toBeCalledTimes(1);

				expect(observerSpy2.update).toBeCalledWith(issue);
				expect(observerSpy2.update).toBeCalledTimes(1);
			});
		});
	});

	describe('observer interface methods.', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('update method.', () => {
			afterEach(() => {
				jest.clearAllMocks();
			});

			it('Should redirect call to generateLocation method.', async () => {
				jest.spyOn(LocationMediator.prototype, 'generateLocation').mockImplementation(jest.fn());

				const dummy = {} as unknown as Issue;
				const locationMediator = new LocationMediator();

				await locationMediator.update(dummy);

				expect(LocationMediator.prototype.generateLocation).toBeCalledTimes(1);
				expect(LocationMediator.prototype.generateLocation).toBeCalledWith(dummy);
			});

			it('Should catch any generic errors.', (done) => {
				jest.spyOn(LocationMediator.prototype, 'generateLocation').mockRejectedValue('foo');

				const dummy = {} as unknown as Issue;
				const locationMediator = new LocationMediator();

				const actual = async () => await locationMediator.update(dummy);
				expect(actual).rejects.toThrowError('foo').then(done);
			});
		});
	});
});
