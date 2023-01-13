import {EachMessagePayload} from 'kafkajs';
import {Issue, Observable} from './types';

export function getEnvironmentVariable(key: string) {
	if (process.env[key] !== undefined) {
		return process.env[key];
	}

	throw new Error(`Undefined environment variable: ${key}`);
}

export function isValidJson(json: string) {
	try {
		return JSON.parse(json)
	} catch {
		return false;
	}
}

export function eventHandler(manager: Observable) {
	return async (event: EachMessagePayload) => {
		const bufferMessage = event.message.value;

		if (bufferMessage !== null && isValidJson(bufferMessage.toString())) {
			const {
				timestamp,
				clientId,
				ip,
			} = JSON.parse(bufferMessage.toString());

			// the validation fails if timestamp is 0
			if (typeof timestamp === 'number' && ip && clientId) {
				const issue: Issue = {ip, timestamp, clientId};
				manager.notifyObservers(issue);
			}
		}
	}
}
