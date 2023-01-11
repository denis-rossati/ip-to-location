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
		const message = event.message.value;

		if (message !== null && isValidJson(message.toString())) {
			const {
				timestamp,
				clientId,
				ip,
			} = JSON.parse(message.toString());

			const issue: Issue = {ip, timestamp, clientId};
			manager.notifyObservers(issue);
		}
	}
}
