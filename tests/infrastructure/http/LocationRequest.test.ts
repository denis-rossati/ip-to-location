import {LocationRequest} from '../../../src/infrastructure/http/LocationRequest';


describe('The LocationRequest class', () => {
	beforeEach(() => {
		const fetchStub = {
			json: jest.fn().mockImplementation(async () => ({
				latitude: null,
				longitude: null,
				country_name: null,
				region_name: null,
				city: null,
			})),
		} as unknown as Response;
		jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('mountLocationUrl method', () => {
		it('Should use environment variables if defined', async () => {
			await LocationRequest.fetch('1.1.1.1');

			const expected = 'http://api.ipstack.com/1.1.1.1?access_key=f850fab28738fd82133ce51aec8e8ea7&fields=latitude%2Clongitude%2Ccountry_name%2Cregion_name%2Ccity';

			expect(fetch).toBeCalledWith(expected);
		});

		it('Should include "fields" if requested', async () => {
			await LocationRequest.fetch('1.1.1.1', ['foo', 'bar']);

			const expected = 'http://api.ipstack.com/1.1.1.1?access_key=f850fab28738fd82133ce51aec8e8ea7&fields=latitude%2Clongitude%2Ccountry_name%2Cregion_name%2Ccity%2Cfoo%2Cbar';

			expect(fetch).toBeCalledWith(expected);
		});
	});

	describe('isValidResponse method.', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should return output if every key in payload was included and every requested field is in the payload.', async () => {
			const actual = await LocationRequest.fetch('1.1.1.1');
			const expected = {
				latitude: null,
				longitude: null,
				country: null,
				region: null,
				city: null,
			};

			expect(actual).toStrictEqual(expected);
		});

		it('Should return null if some requested field is missing.', async () => {
			const actual = await LocationRequest.fetch('1.1.1.1', ['missing', 'field']);
			expect(actual).toBeNull();
		});

		it('Should return null if some key in payload is not included.', async () => {
			const fetchStub = {
				json: jest.fn().mockImplementation(async () => ({
					latitude: null,
					longitude: null,
					country_name: null,
					region_name: null,
					city: null,
					foo: null,
					bar: null,
				})),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);
			const actual = await LocationRequest.fetch('1.1.1.1');

			expect(actual).toBeNull();
		})
	});

	describe('fetch method.', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should return the full location.', async () => {
			const fetchStub = {
				json: jest.fn().mockImplementation(async () => ({
					latitude: 0,
					longitude: 0,
					country_name: 'foo',
					region_name: 'bar',
					city: 'baz',
				})),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const actual = await LocationRequest.fetch('1.1.1.1');
			const expected = {
				latitude: 0,
				longitude: 0,
				country: 'foo',
				region: 'bar',
				city: 'baz',
			};

			expect(actual).toStrictEqual(expected);
		});

		it('Should return partial location.', async () => {
			const fetchStub = {
				json: jest.fn().mockImplementation(async () => ({
					latitude: null,
					longitude: null,
					country_name: null,
					region_name: null,
					city: null,
				})),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const actual = await LocationRequest.fetch('1.1.1.1');
			const expected = {
				latitude: null,
				longitude: null,
				country: null,
				region: null,
				city: null,
			};

			expect(actual).toStrictEqual(expected);
		});

		it('Should return null if IP is invalid', async () => {
			const invalidIPv4 = await LocationRequest.fetch('256.256.256.256');
			expect(invalidIPv4).toBeNull();

			const invalidIPv6 = await LocationRequest.fetch('g:g:g:g:g:g:g:g');
			expect(invalidIPv6).toBeNull();

			const foobar = await LocationRequest.fetch('fucked up beyond all recongnition');
			expect(foobar).toBeNull();
		});

		it('Should return null if API response is not valid.', async () => {
			const fetchStub = {
				json: jest.fn().mockImplementation(async () => ({
					invalid: 'response',
				})),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const actual = await LocationRequest.fetch('1.1.1.1');
			expect(actual).toBeNull();
		});

		it('Should catch error if json operation fails.', (done) => {
			const fetchStub = {
				json: jest.fn().mockRejectedValue('foo'),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const actual = async () => await LocationRequest.fetch('1.1.1.1');
			expect(actual).rejects.toThrowError('foo').then(done);
		});

		it('Should catch error if API throws an error.', (done) => {
			jest.spyOn(global, 'fetch').mockRejectedValue('foo');

			const actual = async () => await LocationRequest.fetch('1.1.1.1');
			expect(actual).rejects.toThrowError('foo').then(done);
		});
	});
});
