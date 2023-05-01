import {eventHandler, getEnvironmentVariable, getNumEnvironmentVariable, isValidJson} from '../src/utils';
import {EachMessagePayload} from 'kafkajs';
import {Issue, Observable} from '../src/types';

describe('getEnvironmentVariable', () => {
	it('Should return environments variable if defined.', () => {
		process.env.foo = 'bar';

		const actual = getEnvironmentVariable('foo');
		const expected = 'bar';

		expect(actual).toEqual(expected);
	});

	it('Should return an error if environment variable doesn\'t exist.', () => {
		const actual = getEnvironmentVariable('bar');

		expect(actual).toBeUndefined();
	});
});

describe('getNumEnvironmentVariable', () => {
	it('Should return environments variable if defined.', () => {
		process.env.foo = '100';

		const actual = getNumEnvironmentVariable('foo');
		const expected = 100;

		expect(actual).toEqual(expected);
	});

	it('Should return NaN if environment an invalid number is set', () => {
		process.env.foo = 'invalid';

		const actual = getNumEnvironmentVariable('foo');

		expect(actual).toBeNaN();
	})

	it('Should return NaN if environment variable doesn\'t exist.', () => {
		const actual = getNumEnvironmentVariable('bar');

		expect(actual).toBeNaN();
	});
});

describe('isValidJson', () => {
	it('Should return object if JSON is valid', () => {
		const expected = {foo: 'bar'};
		const json = JSON.stringify(expected);
		const actual = isValidJson(json);

		expect(actual).toStrictEqual(expected);
	});

	it('Should return false if JSON is invalid', () => {
		const actual = isValidJson('invalid json');
		expect(actual).toBeFalsy();
	});
});

describe('eventHandler', () => {
	it('Should notify observers if message is valid.', () => {
		const issue: Issue = {
			ip: '1.1.1.1',
			clientId: 'foo',
			timestamp: 0,
		};

		const mockObservable = {
			notifyObservers: jest.fn(),
		} as unknown as Observable;

		const validEvent = {
			message: {value: Buffer.from(JSON.stringify(issue))},
		} as unknown as EachMessagePayload;

		eventHandler(mockObservable)(validEvent);

		expect(mockObservable.notifyObservers).toBeCalledTimes(1);
		expect(mockObservable.notifyObservers).toBeCalledWith(issue);
	});

	it('Should ignore message if message is null.', () => {
		const invalidEvent = {
			message: {value: null},
		} as unknown as EachMessagePayload;

		const mockObservable = {
			notifyObservers: jest.fn(),
		} as unknown as Observable;

		eventHandler(mockObservable)(invalidEvent);

		expect(mockObservable.notifyObservers).not.toBeCalled();
	});

	it('Should ignore message if message is not a valid JSON.', () => {
		const invalidEvent = {
			message: {value: 'not a valid json'},
		} as unknown as EachMessagePayload;

		const mockObservable = {
			notifyObservers: jest.fn(),
		} as unknown as Observable;

		eventHandler(mockObservable)(invalidEvent);

		expect(mockObservable.notifyObservers).not.toBeCalled();
	});

	it('Should ignore message if IP is undefined', () => {
		const invalidEvent = {
			message: {value: {clientId: 'foo', timestamp: 0}},
		} as unknown as EachMessagePayload;

		const mockObservable = {
			notifyObservers: jest.fn(),
		} as unknown as Observable;

		eventHandler(mockObservable)(invalidEvent);

		expect(mockObservable.notifyObservers).not.toBeCalled();
	});

	it('Should ignore message if timestamp is not a number', () => {
		const invalidEvent = {
			message: {value: {clientId: 'foo', ip: 'foo', timestamp: 'foo'}},
		} as unknown as EachMessagePayload;

		const mockObservable = {
			notifyObservers: jest.fn(),
		} as unknown as Observable;

		eventHandler(mockObservable)(invalidEvent);

		expect(mockObservable.notifyObservers).not.toBeCalled();
	});

	it('Should ignore message if client id is undefined', () => {
		const invalidEvent = {
			message: {value: {timestamp: 0, ip: 'foo'}},
		} as unknown as EachMessagePayload;

		const mockObservable = {
			notifyObservers: jest.fn(),
		} as unknown as Observable;

		eventHandler(mockObservable)(invalidEvent);

		expect(mockObservable.notifyObservers).not.toBeCalled();
	});
});
