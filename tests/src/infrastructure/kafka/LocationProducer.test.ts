import {Kafka, Partitioners} from 'kafkajs';
import {LocationProducer} from '../../../../src/infrastructure/kafka/LocationProducer';
import {OutputMessage} from '../../../../src/types';

describe('The LocationProducer class', () => {
	let kafkaClientMock: Kafka;

	beforeEach(() => {
		kafkaClientMock = {
			producer: jest.fn().mockReturnValue({
				connect: jest.fn(),
				subscribe: jest.fn(),
				run: jest.fn(),
				send: jest.fn(),
			}),
		} as unknown as Kafka;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('connect method.', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should connect to a kafka producer.', async () => {
			const locationProducer = new LocationProducer(kafkaClientMock);

			await locationProducer.connect();

			expect(kafkaClientMock.producer().connect).toBeCalledTimes(1);
			expect(async () => await locationProducer.connect()).not.toThrow();
		});

		it('Should throw an error if any operation fail.', () => {
			kafkaClientMock = {
				producer: jest.fn().mockReturnValue({
					connect: () => {
						throw new Error('foo');
					},
				}),
			} as unknown as Kafka;

			const locationProducer = new LocationProducer(kafkaClientMock);

			const expected = 'fo';

			expect(async () => await locationProducer.connect()).rejects.toThrowError(expected);
		});

		it('Should update topic list.', async () => {
			const locationProducer = new LocationProducer(kafkaClientMock);

			locationProducer.topics = ['foo'];

			await locationProducer.connect('bar');

			const actual = locationProducer.topics;
			const expected = ['foo', 'bar'];

			expect(actual).toEqual(expected);
		});

		it('Should use legacy partitioner as partitioner creator.', async () => {
			const locationProducer = new LocationProducer(kafkaClientMock);

			await locationProducer.connect();

			const expected = {
				createPartitioner: Partitioners.LegacyPartitioner,
			};
			expect(kafkaClientMock.producer).toBeCalledWith(expected);
		});
	});

	describe('observer interface methods.', () => {
		describe('update method.', () => {
			it('Should throw an error if producer is not connected.', () => {
				const locationProducer = new LocationProducer(kafkaClientMock);

				const dummy = {} as unknown as OutputMessage;
				const expected = 'The producer must be connected before writing to a topic.';

				expect(locationProducer.update(dummy)).rejects.toThrowError(expected);
			});

			it('Should send the same message to every topic.', async () => {
				const locationProducer = new LocationProducer(kafkaClientMock);

				locationProducer.topics = ['one'];
				await locationProducer.connect('two');

				const dummy = {} as unknown as OutputMessage;
				await locationProducer.update(dummy);

				expect(kafkaClientMock.producer().send).toBeCalledTimes(2);

				locationProducer.topics = ['one', 'two', 'three'];

				await locationProducer.connect();
				await locationProducer.update(dummy);

				expect(kafkaClientMock.producer().send).toBeCalledTimes(5);
			});
		});
	});
});
