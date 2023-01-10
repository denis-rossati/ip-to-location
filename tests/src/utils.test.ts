import {getEnvironmentVariable} from "../../src/utils";


describe('getEnvironmentVariable', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('Should return environments variable if defined.', () => {
        process.env.foo = 'bar';

        const actual = getEnvironmentVariable('foo');
        const expected = 'bar';

        expect(actual).toEqual(expected);
    });

    it('Should return an error if environment variable doesn\'t exist.', () => {
        const actual = () => getEnvironmentVariable('bar');
        const expected = 'Undefined environment variable: bar';

        expect(actual).toThrowError(expected);
    });
});
