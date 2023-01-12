import Redis from 'ioredis';
import {CacheAdapter} from '../../../src/infrastructure/cache';
import clearAllMocks = jest.clearAllMocks;

describe('The CacheAdapter class', () => {
	describe('The CacheClient methods.', () => {
		describe('set', function () {
			let cacheMock: Redis;

			beforeEach(() => {
				cacheMock = {
					set: jest.fn(),
					get: jest.fn(),
				} as unknown as Redis;
			})

			afterEach(() => {
				jest.clearAllMocks();
			});

			it('Should cache an value quietly.', () => {
				const cacheAdapter = new CacheAdapter(cacheMock);

				const json = JSON.stringify({bar: 'bar'});

				cacheAdapter.set('foo', json);

				expect(cacheMock.set).toBeCalledTimes(1);
				expect(cacheMock.set).toBeCalledWith('foo', json, 'EX', 1800);
			});

			it('Should allow define client to choose a time-to-live value.', () => {
				const cacheAdapter = new CacheAdapter(cacheMock);

				const json = JSON.stringify({bar: 'bar'});

				cacheAdapter.set('foo', json, 0);

				expect(cacheMock.set).toBeCalledTimes(1);
				expect(cacheMock.set).toBeCalledWith('foo', json, 'EX', 0);
			});

			it('Should throw an error if setting cache value fails.', (done) => {
				cacheMock = {
					set: jest.fn().mockRejectedValue('foo'),
				} as unknown as Redis;

				const cacheAdapter = new CacheAdapter(cacheMock);

				expect(cacheAdapter.set('foo', '{}')).rejects.toThrowError('foo').then(done);
			});

			it('Should throw an error cached value is not a valid JSON.', (done) => {
				const cacheAdapter = new CacheAdapter(cacheMock);

				expect(cacheAdapter.set('foo', 'invalid-json')).rejects.toThrowError('Value must be a valid JSON.').then(done);
			})
		});

		describe('get', function () {
			afterEach(() => {
				clearAllMocks();
			});

			it('Should return a parsed JSON..', (done) => {
				const expected = {foo: 'foo'};

				const cacheMock = {
					get: jest.fn().mockResolvedValue(JSON.stringify(expected)),
				} as unknown as Redis;

				const cacheAdapter = new CacheAdapter(cacheMock);
				const actual = cacheAdapter.get('foo');

				expect(actual).resolves.toStrictEqual(expected).then(done);
				expect(cacheMock.get).toBeCalledWith('foo');
			});

			it('Should return null if method return null.', (done) => {
				const cacheMock = {
					get: jest.fn().mockResolvedValue(null),
				} as unknown as Redis;

				const cacheAdapter = new CacheAdapter(cacheMock);

				expect(cacheAdapter.get('foo')).resolves.toBeNull().then(done);
				expect(cacheMock.get).toBeCalledWith('foo');
			});
		});
	});
});
