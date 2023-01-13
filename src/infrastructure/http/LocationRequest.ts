import * as net from 'net';
import {API_KEY, API_URL} from '../../../server/constants';
import {ExternalResponse} from '../../types';

export class LocationRequest {
	private static mountLocationUrl(ip: string, requestedFields: string[]) {
		const url = new URL(API_URL || 'https://ipstack.com/');
		url.pathname = ip;
		url.searchParams.set('access_key', API_KEY || '1729');

		if (requestedFields.length > 0) {
			url.searchParams.set('fields', requestedFields.join(','));
		}

		return url.toString();
	}

	private static isValidResponse(payload: Map<string, unknown>, requestedFields: string[]) {
		// Every key in payload should've been requested and every requested field must be in the payload.
		return Array.from(payload.keys()).every((key: string) => requestedFields.includes(key))
			&& requestedFields.every((field) => payload.has(field));
	}

	private static mountOutput(payload: Map<string, unknown>, fields: string[]): ExternalResponse {
		const sanitizedMap = new Map();

		fields.forEach((key) => {
			const sanitizedKey = key.replace(/_name/, '');
			sanitizedMap.set(sanitizedKey, payload.get(key));
		});

		return Object.fromEntries(sanitizedMap);
	}

	static async fetch(ip: string, requestedFields: string[] = []) {
		if (!net.isIP(ip)) {
			return null;
		}

		// For faster external calls, ipstack let you choose a range of fields returned in the response.
		const responseFields = ['latitude', 'longitude', 'country_name', 'region_name', 'city', ...requestedFields];

		const requestUrl = LocationRequest.mountLocationUrl(ip, responseFields);

		const response: Response = await fetch(requestUrl).catch((reason) => {
			throw new Error(reason);
		});

		try {
			const entries = Object.entries(await response.json());

			// We cannot predict the response from the external request.
			// Therefore, the type hint must be generic and the response must be validated.
			const payload = new Map(entries);
			const isValidResponse = LocationRequest.isValidResponse(payload, responseFields);

			if (isValidResponse) {
				return LocationRequest.mountOutput(payload, responseFields);
			}

			return null;
		} catch (e) {
			throw new Error(JSON.stringify(e));
		}
	}
}
