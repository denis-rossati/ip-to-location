import {InMemoryProducer} from '../inMemoryProducer';
import {OutputMessage} from '../../../src/types';

describe('inMemoryProducer', () => {
	it('Should return the argument', () => {
		const inMemoryProducer = new InMemoryProducer();

		const expected: OutputMessage = {
			ip: 'foo',
			clientId: 'bar',
			timestamp: 1729,
			region: 'baz',
			city: 'qux',
			country: 'thud',
			longitude: 7,
			latitude: 2,
		};

		const actual = inMemoryProducer.update(expected);

		expect(actual).toStrictEqual(expected);
	});
});
