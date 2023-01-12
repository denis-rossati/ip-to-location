import {isValidJson} from '../../utils';
import Redis from 'ioredis';
import {CacheClient, OutputMessage} from '../../types';

export class CacheAdapter implements CacheClient {
	private readonly _redis: Redis;

	constructor(redisClient: Redis) {
		this._redis = redisClient;
	}

	async set(key: string, value: string, ttl = 1800) {
		if (!isValidJson(value)) {
			throw new Error('Value must be a valid JSON.');
		}

		try {
			await this.redis.set(key, value, 'EX', ttl);
		} catch (e) {
			throw new Error(e as string);
		}
	}

	async get(key: string): Promise<OutputMessage | null> {
		const value = await this.redis.get(key);

		if (value === null) {
			return null;
		}

		return JSON.parse(value);
	}

	private get redis() {
		return this._redis;
	}
}
