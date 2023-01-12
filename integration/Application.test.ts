import {InMemoryConsumer} from './helper/inMemoryConsumer';
import {InMemoryProducer} from './helper/inMemoryProducer';
import {LocationMediator} from '../src/application/LocationMediator';
import {CacheClient, Issue} from '../src/types';
import {sleep} from './helper/sleep';

describe('The application', () => {
	let inMemoryConsumer: InMemoryConsumer;
	let inMemoryProducer: InMemoryProducer;
	let locationMediator: LocationMediator;
	let cacheClient: CacheClient;

	beforeEach(() => {
		const fetchedValue = {
			city: 'fetch value',
			region_name: 'fetch value',
			country_name: 'fetch value',
			longitude: 0,
			latitude: 0,
		}

		jest.spyOn(global, 'fetch').mockResolvedValue({
			json: jest.fn().mockResolvedValue(fetchedValue),
		} as unknown as Response)

		//cachedValue = {
		//	ip: 'fetch value',
		//	city: 'fetch value',
		//	region: 'fetch value',
		//	country: 'fetch value',
		//	latitude: 0,
		//	longitude: 0,
		//	timestamp: 0,
		//	clientId: 'fetch value',
		//}

		cacheClient = {
			get: jest.fn().mockResolvedValue(null),
			set: jest.fn().mockImplementation(() => undefined),
		};

		inMemoryConsumer = new InMemoryConsumer();
		inMemoryProducer = new InMemoryProducer();
		locationMediator = new LocationMediator(cacheClient);


		inMemoryConsumer.addObserver(locationMediator);
		locationMediator.addObserver(inMemoryProducer);

		jest.spyOn(inMemoryProducer, 'update');
	});

	afterEach(() => {
		jest.clearAllMocks();
	})

	it('Should send location all fields filled.', async () => {
		const issue: Issue = {
			timestamp: 0,
			ip: '1.1.1.1',
			clientId: 'integration-test',
		};

		inMemoryConsumer.sendMessage(issue);

		// Since the observer is fire-and-forget, we do a little sleeping here
		await sleep(10);

		const expected = {
			...issue,
			city: 'fetch value',
			region: 'fetch value',
			country: 'fetch value',
			longitude: 0,
			latitude: 0,
		};

		expect(inMemoryProducer.update).toBeCalledWith(expected);
	});

	it('Should send location with null optional fields.', async () => {
		jest.spyOn(global, 'fetch').mockResolvedValue({
			json: jest.fn().mockResolvedValue({
				city: null,
				region_name: null,
				country_name: null,
				longitude: null,
				latitude: null,
			}),
		} as unknown as Response);

		const issue: Issue = {
			timestamp: 0,
			ip: '1.1.1.1',
			clientId: 'integration-test',
		};

		inMemoryConsumer.sendMessage(issue);

		await sleep(10);

		const expected = {
			...issue,
			city: null,
			region: null,
			country: null,
			longitude: null,
			latitude: null,
		};

		expect(inMemoryProducer.update).toBeCalledWith(expected);
	});

	it('Should send location retrieved from cache.', async () => {
		jest.spyOn(cacheClient, 'get').mockResolvedValue({
			city: 'cache value',
			region: 'cache value',
			country: 'cache value',
			longitude: 0,
			latitude: 0,
			timestamp: 0,
			ip: '1.1.1.1',
			clientId: 'integration-test',
		});

		const issue: Issue = {
			timestamp: 0,
			ip: '1.1.1.1',
			clientId: 'integration-test',
		};

		inMemoryConsumer.sendMessage(issue);

		await sleep(10);

		const expected = {
			...issue,
			city: 'cache value',
			region: 'cache value',
			country: 'cache value',
			longitude: 0,
			latitude: 0,
		};

		expect(cacheClient.get).toBeCalledWith('integration-test-1.1.1.1')
		expect(inMemoryProducer.update).toBeCalledWith(expected);
	});

	it('Should ignore message if IP is invalid.', async () => {
		const issue: Issue = {
			ip: 'invalid-ip',
			clientId: 'integration-test',
			timestamp: 0,
		};

		inMemoryConsumer.sendMessage(issue);

		await sleep(10);

		expect(inMemoryProducer.update).not.toBeCalled();
	});

	it('Should ignore message if external resourcers send unrecognizable data.', async () => {
		jest.spyOn(global, 'fetch').mockResolvedValue({
			json: jest.fn().mockResolvedValue({'invalid': 'data'}),
		} as unknown as Response);

		const issue: Issue = {
			ip: '1.1.1.1',
			clientId: 'integration-test',
			timestamp: 0,
		};

		inMemoryConsumer.sendMessage(issue);

		await sleep(10);

		expect(inMemoryProducer.update).not.toBeCalled();
	});
});
