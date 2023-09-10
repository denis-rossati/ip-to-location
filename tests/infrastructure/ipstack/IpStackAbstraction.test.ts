import {IpStackAbstraction} from '../../../src/infrastructure/ipstack';


describe('The IpStackAbstraction class', () => {
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
		it('Should include requested fields', () => {
			const locationResolver = new IpStackAbstraction(
				'my_key',
				'https://dummy.com',
				{
					field_one: 'number',
					field_two: 'string',
				},
			);

			locationResolver.resolve('1.1.1.1');

			const expected = 'https://dummy.com/1.1.1.1?access_key=my_key&fields=field_one%2Cfield_two';

			expect(fetch).toBeCalledWith(expected);
		});

		it('Should not include fields that weren\'t requested', () => {
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

			const locationResolver = new IpStackAbstraction(
				'my_key',
				'https://endpoint.com',
				{},
			);

			locationResolver.resolve('1.1.1.1');

			const expected = 'https://endpoint.com/1.1.1.1?access_key=my_key';

			expect(fetch).toBeCalledWith(expected);
		});
	});

	describe('isValidResponse method.', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Should check if every key in payload was included and expected types are matching.', async () => {
			const fetchStub = {
				json: jest.fn().mockImplementation(async () => ({
					latitude: null,
					longitude: 123,
					country_name: 'foo',
					region_name: 'bar',
					city: null,
				})),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const locationResolver = new IpStackAbstraction(
				'123',
				'https://dummy.com',
				{
					latitude: 'number',
					longitude: 'number',
					country_name: 'string',
					region_name: 'string',
					city: 'string',
				},
			);

			const actual = await locationResolver.resolve('1.1.1.1');
			const expected = {
				latitude: null,
				longitude: 123,
				country: 'foo',
				region: 'bar',
				city: null,
			};

			expect(actual).toStrictEqual(expected);
		});

		it('Should return null if some requested field is missing.', async () => {
			const locationResolver = new IpStackAbstraction(
				'123',
				'https://dummy.com',
				{
					missing: 'number',
					field: 'string'
				},
			);

			const actual = await locationResolver.resolve('1.1.1.1');
			expect(actual).toBeNull();
		});
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

			const locationResolver = new IpStackAbstraction(
				'123',
				'https:dummy.com',
				{
					latitude: 'number',
					longitude: 'number',
					country_name: 'string',
					region_name: 'string',
					city: 'string',
				}
			);

			const actual = await locationResolver.resolve('1.1.1.1');
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

			const locationResolver = new IpStackAbstraction(
				'123',
				'https:dummy.com',
				{
					latitude: 'number',
					longitude: 'number',
					country_name: 'string',
					region_name: 'string',
					city: 'string',
				}
			);

			const actual = await locationResolver.resolve('1.1.1.1');
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
			const locationResolver = new IpStackAbstraction(
				'123',
				'https:dummy.com',
				{
					latitude: 'number',
					longitude: 'number',
					country_name: 'string',
					region_name: 'string',
					city: 'string',
				}
			);

			const invalidIp = await locationResolver.resolve('foo');
			expect(invalidIp).toBeNull();

			const invalidIPv4 = await locationResolver.resolve('256.256.256.256');
			expect(invalidIPv4).toBeNull();

			const invalidIPv6 = await locationResolver.resolve('g:g:g:g:g:g:g:g');
			expect(invalidIPv6).toBeNull();
		});

		it('Should return null if API response is not valid.', async () => {
			const fetchStub = {
				json: jest.fn().mockImplementation(async () => ({
					invalid: 'response',
				})),
			} as unknown as Response;

			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const locationResolver = new IpStackAbstraction(
				'123',
				'https:dummy.com',
				{
					latitude: 'number',
					longitude: 'number',
					country_name: 'string',
					region_name: 'string',
					city: 'string',
				}
			);

			const actual = await locationResolver.resolve('1.1.1.1');
			expect(actual).toBeNull();
		});

		it('Should catch error if json operation fails.', (done) => {
			const fetchStub = {
				json: jest.fn().mockRejectedValue('foo'),
			} as unknown as Response;
			jest.spyOn(global, 'fetch').mockResolvedValue(fetchStub);

			const locationResolver = new IpStackAbstraction(
				'123',
				'https:dummy.com',
				{}
			);

			const actual = async () => await locationResolver.resolve('1.1.1.1');
			expect(actual).rejects.toThrowError('foo').then(done);
		});

		it('Should catch error if API throws an error.', (done) => {
			jest.spyOn(global, 'fetch').mockRejectedValue('foo');

			const locationResolver = new IpStackAbstraction(
				'123',
				'https:dummy.com',
				{}
			);

			const actual = async () => await locationResolver.resolve('1.1.1.1');
			expect(actual).rejects.toThrowError('foo').then(done);
		});
	});
});
