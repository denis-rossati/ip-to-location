import {ConsumerConfig, ConsumerRunConfig, Kafka} from 'kafkajs';
import {LocationConsumer} from '../../../../src/infrastructure/kafka';
import {Issue, Observer} from '../../../../src/types';

describe('The LocationConsumer class', () => {
	let kafkaClientMock: Kafka;

	beforeEach(() => {
		kafkaClientMock = {
			consumer: jest.fn().mockReturnValue({
				connect: jest.fn(),
				subscribe: jest.fn(),
				run: jest.fn(),
			}),
		} as unknown as Kafka;
	});

	afterEach(() => {
		jest.clearAllMocks();
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

		it('Should accept observers.', () => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);
			locationConsumer.addObserver(observerSpy1, observerSpy2);

			const actual = locationConsumer.observers;
			const expected = [observerSpy1, observerSpy2];

			expect(actual).toEqual(expected);
		});

		it('Should update the observers', () => {
			const issue: Issue = {ip: '1.1.1.1', clientId: 'bar', timestamp: 0};

			const locationConsumer = new LocationConsumer(kafkaClientMock);
			locationConsumer.addObserver(observerSpy1, observerSpy2);
			locationConsumer.notifyObservers(issue);

			expect(observerSpy1.update).toBeCalledWith(issue);
			expect(observerSpy1.update).toBeCalledTimes(1);


			expect(observerSpy2.update).toBeCalledWith(issue);
			expect(observerSpy2.update).toBeCalledTimes(1);
		});
	});

	describe('connect method.', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should subscribe to the topic passed as argument.', async () => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);
			const dummy = {} as unknown as ConsumerConfig;

			await locationConsumer.connect('foo');

			const expectedTopic = {topic: 'foo'};

			expect(kafkaClientMock.consumer(dummy).subscribe).toBeCalledWith(expectedTopic);
			expect(kafkaClientMock.consumer(dummy).subscribe).toBeCalledTimes(1);
		});

		it('Should subscribe to default topic if no argument is provided.', async () => {
			const dummy = {} as unknown as ConsumerConfig;

			const locationConsumer = new LocationConsumer(kafkaClientMock);
			await locationConsumer.connect();

			const expectedTopic = {topic: 'location_input'};
			expect(kafkaClientMock.consumer(dummy).subscribe).toBeCalledWith(expectedTopic);
			expect(kafkaClientMock.consumer(dummy).subscribe).toBeCalledTimes(1);
		});

		it('Should update connected state.', async () => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);

			expect(locationConsumer.isConnected).toBeFalsy();

			await locationConsumer.connect();

			expect(locationConsumer.isConnected).toBeTruthy();
		});

		it('Should catch and print generic errors.', (done) => {
			kafkaClientMock = {
				consumer: jest.fn().mockReturnValue({
					connect: () => {
						throw new Error('foo');
					},
				}),
			} as unknown as Kafka;

			const locationConsumer = new LocationConsumer(kafkaClientMock);

			const expectedError = 'foo';
			expect(locationConsumer.connect()).rejects.toThrowError(expectedError).then(done);
		});
	});

	describe('run method.', () => {
		it('Should throw an error if it is not connected to any topic.', (done) => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);

			const expectedError = 'The consumer must be connected before reading a topic.';
			expect(locationConsumer.run()).rejects.toThrowError(expectedError).then(done);
		});

		it('Should execute run callback from consumer.', async () => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);
			await locationConsumer.connect();

			const expected = {foo: 'foo'} as unknown as ConsumerRunConfig;
			await locationConsumer.run(expected);

			const dummy = {} as unknown as ConsumerConfig;

			expect(kafkaClientMock.consumer(dummy).run).toBeCalledTimes(1);
			expect(kafkaClientMock.consumer(dummy).run).toBeCalledWith(expected);
		});

		it('Should use default options if not provided by args.', async () => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);
			await locationConsumer.connect();

			await locationConsumer.run();

			const expected = {} as unknown as ConsumerRunConfig;
			const dummy = {} as unknown as ConsumerConfig;

			expect(kafkaClientMock.consumer(dummy).run).toBeCalledTimes(1);
			expect(kafkaClientMock.consumer(dummy).run).toBeCalledWith(expected);
		});
	});

	describe('client method.', () => {
		it('Should throw an error if a client is not defined', () => {
			expect(() => LocationConsumer.prototype.client)
				.toThrowError('A Kafka client must be supplied through class construction.');
		});

		it('Should return the client if defined.', () => {
			const expected = {consumer: jest.fn()} as unknown as Kafka;
			const locationConsumer = new LocationConsumer(expected);

			expect(locationConsumer.client).toStrictEqual(expected);
		});
	});

	describe('consumer method.', () => {
		it('Should throw an error if a consumer is not defined', (done) => {
			const expectedError = 'A Kafka consumer must be supplied through class construction.';

			expect(async () => await LocationConsumer.prototype.connect()).rejects
				.toThrowError(expectedError).then(done);
		});

		it('Should return the consumer if defined.', () => {
			const locationConsumer = new LocationConsumer(kafkaClientMock);

			expect(async () => await locationConsumer.connect()).not.toThrow();
		});
	});
});
