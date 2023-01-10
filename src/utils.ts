export function getEnvironmentVariable(key: string) {
    if (process.env[key] !== undefined) {
        return process.env[key];
    }

    throw new Error(`Undefined environment variable: ${key}`);
}
