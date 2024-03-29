import {CacheClient, Issue, Observer, OutputMessage} from '../../src/types';
import {LocationMediator} from '../../src/application';
import {IpLocationResolver} from '../../src/infrastructure/ipstack';
import {CacheAdapter} from '../../src/infrastructure/cache';

describe('The LocationMediator class', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('generateLocation method.', () => {
		describe('Without cache', () => {
			beforeEach(() => {
				jest.spyOn(CacheAdapter.prototype, 'get').mockImplementation(async () => null);
				jest.spyOn(CacheAdapter.prototype, 'set').mockImplementation(async () => undefined);
			});

			afterEach(() => {
				jest.clearAllMocks();
			});

			it('Should notify observers with full location from fetch if cache is null.', async () => {
				jest.spyOn(LocationMediator.prototype, 'notifyObservers');

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver);

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

				// Since cache is null, we must not execute any method.
				expect(CacheAdapter.prototype.get).not.toBeCalled();
				expect(CacheAdapter.prototype.set).not.toBeCalled();
			});

			it('Should not notify observers if external response is null.', async () => {
				jest.spyOn(LocationMediator.prototype, 'notifyObservers');

				const locationResolver: IpLocationResolver = {resolve: () => Promise.resolve(null)};

				const locationMediator = new LocationMediator(locationResolver);

				const dummy = {ip: '1.1.1.1', clientId: 'qux', timestamp: 0};
				await locationMediator.generateLocation(dummy);

				expect(LocationMediator.prototype.notifyObservers).not.toBeCalled();
			});

			it('Should not notify observers if external response fails.', async () => {
				jest.spyOn(LocationMediator.prototype, 'notifyObservers');

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.reject(new Error('Something exploded'))
				};
				const locationMediator = new LocationMediator(locationResolver);

				const dummy = {ip: '1.1.1.1', clientId: 'qux', timestamp: 0};
				await locationMediator.generateLocation(dummy);

				expect(LocationMediator.prototype.notifyObservers).not.toBeCalled();
			});
		});

		describe('With cache', () => {
			let mockCacheClient: CacheClient;
			let cachedValue: OutputMessage;

			beforeEach(() => {
				cachedValue = {
					ip: '1.1.1.1',
					city: 'cached value',
					region: 'cached value',
					country: 'cached value',
					latitude: 1,
					longitude: 1,
					timestamp: 0,
					clientId: 'cached value',
				};

				mockCacheClient = {
					get: jest.fn().mockImplementation(async () => cachedValue),
					set: jest.fn().mockImplementation(async () => undefined),
				} as unknown as CacheClient;
			});

			afterEach(() => {
				jest.clearAllMocks();
			});

			it('Should notify observers with cached value if defined.', async () => {
				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver, mockCacheClient);

				jest.spyOn(locationMediator, 'notifyObservers');

				const dummy = {ip: 'foo', clientId: 'bar', timestamp: 0} as Issue;

				const expectedCacheKey = `${dummy.clientId}-${dummy.ip}`;
				await locationMediator.generateLocation(dummy);

				expect(locationMediator.notifyObservers).toBeCalledTimes(1);
				expect(locationMediator.notifyObservers).toBeCalledWith(cachedValue);

				expect(mockCacheClient.get).toBeCalledTimes(1);
				expect(mockCacheClient.get).toBeCalledWith(expectedCacheKey);
			});

			it('Should notify observers with value from fetch if location is not cached.', async () => {
				mockCacheClient = {
					get: jest.fn().mockImplementation(async () => null),
					set: jest.fn().mockImplementation(async () => undefined),
				} as unknown as CacheClient;

				const resolverResponse = {
					city: 'foo',
					region: 'bar',
					country: 'baz',
					latitude: 0,
					longitude: 0,
				};

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve(resolverResponse)
				};
				const locationMediator = new LocationMediator(locationResolver, mockCacheClient);

				jest.spyOn(locationMediator, 'notifyObservers');

				const dummy = {ip: 'foo', clientId: 'bar', timestamp: 0} as Issue;

				const expectedCacheKey = `${dummy.clientId}-${dummy.ip}`;
				await locationMediator.generateLocation(dummy);

				expect(locationMediator.notifyObservers).toBeCalledWith({...resolverResponse, ...dummy});

				expect(mockCacheClient.get).toBeCalledTimes(1);
				expect(mockCacheClient.get).toBeCalledWith(expectedCacheKey);
			});

			it('Should set notified message after getting location from fetch', async () => {
				mockCacheClient = {
					get: jest.fn().mockImplementation(async () => null),
					set: jest.fn().mockImplementation(async () => undefined),
				} as unknown as CacheClient;

				const resolverResponse = {
					city: 'foo',
					region: 'bar',
					country: 'baz',
					latitude: 0,
					longitude: 0,
				};

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve(resolverResponse)
				};
				const locationMediator = new LocationMediator(locationResolver, mockCacheClient);

				jest.spyOn(locationMediator, 'notifyObservers');

				const dummy = {clientId: 'bar', timestamp: 0, ip: 'foo'} as Issue;

				const expectedCacheKey = `${dummy.clientId}-${dummy.ip}`;
				await locationMediator.generateLocation(dummy);

				expect(locationMediator.notifyObservers).toBeCalledWith({...resolverResponse, ...dummy});

				expect(mockCacheClient.set).toBeCalledTimes(1);
				expect(mockCacheClient.set).toBeCalledWith(expectedCacheKey, JSON.stringify({...resolverResponse, ...dummy}));
			});

			it('Should not set notified message if retrieved from cache.', async () => {
				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver, mockCacheClient);

				jest.spyOn(locationMediator, 'notifyObservers');

				const dummy = {ip: 'foo', clientId: 'bar', timestamp: 0} as Issue;

				await locationMediator.generateLocation(dummy);

				expect(mockCacheClient.set).not.toBeCalled();

				expect(locationMediator.notifyObservers).toBeCalledTimes(1);
				expect(locationMediator.notifyObservers).toBeCalledWith(cachedValue);
			});
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
				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver);
				locationMediator.addObserver(observerSpy1, observerSpy2);

				const actual = locationMediator.observers;
				const expected = [observerSpy1, observerSpy2];

				expect(actual).toEqual(expected);
			});
		});

		describe('notifyObservers method.', () => {
			it('Should notify the observers.', () => {
				const issue: Issue = {ip: '1.1.1.1', clientId: 'bar', timestamp: 0};

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver);
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

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver);

				await locationMediator.update(dummy);

				expect(LocationMediator.prototype.generateLocation).toBeCalledTimes(1);
				expect(LocationMediator.prototype.generateLocation).toBeCalledWith(dummy);
			});

			it('Should catch any generic errors.', (done) => {
				jest.spyOn(LocationMediator.prototype, 'generateLocation').mockRejectedValue('foo');

				const dummy = {} as unknown as Issue;

				const locationResolver: IpLocationResolver = {
					resolve: () => Promise.resolve({
						city: 'foo',
						region: 'bar',
						country: 'baz',
						latitude: 0,
						longitude: 0,
					})
				};
				const locationMediator = new LocationMediator(locationResolver);

				const actual = async () => await locationMediator.update(dummy);
				expect(actual).rejects.toThrowError('foo').then(done);
			});
		});
	});
});
