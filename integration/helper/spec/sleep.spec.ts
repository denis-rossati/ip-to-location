import {sleep} from './sleep';


describe('sleep', () => {

	jest.useFakeTimers();

	it('Should resolve promise after sleep.', async () => {
		const expected = 10000;

		const actual = sleep(expected);

		jest.advanceTimersByTime(10000);

		expect(actual).resolves.toBe(expected);
	});

	it('Should not resolve promise until time has passed.', () => {
		const actual = sleep(10000);

		jest.advanceTimersByTime(800);

		expect(actual).not.toBe(10000);
	});
});
