import {EachMessagePayload} from 'kafkajs';
import {Issue, Observable} from './types';

export function getEnvironmentVariable(key: string) {
	if (process.env[key] !== undefined) {
		return process.env[key];
	}
}

export function getNumEnvironmentVariable(key: string): number | undefined {
	return Number(getEnvironmentVariable(key));
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

			// Instead of dry validation with "timestamp" field, we need
			// to prevent timestamp evaluate to false when the value is 0.
			if (typeof timestamp === 'number' && ip && clientId) {
				const issue: Issue = {ip, timestamp, clientId};
				manager.notifyObservers(issue);
			}
		}
	}
}
