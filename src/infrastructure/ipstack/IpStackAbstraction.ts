import * as net from 'net';
import {Location} from '../../types';

export interface IpLocationResolver {
	resolve(ip: string): Promise<Location | null>
}

export class IpStackAbstraction implements IpLocationResolver {
	private readonly _locationApiKey: string;

	private readonly _locationApiEndpoint: string;

	/**
	 * A key-value map corresponding the requested field and expected type from external request
	 * For faster external calls, ipstack let you choose a range of fields returned in the response.
	 * @see https://ipstack.com/documentation
	 */
	private readonly _requestedFields: { [key: string]: 'string' | 'number' };

	constructor(
		locationApiKey: string,
		locationApiEndpoint: string,
		requestedFields: { [key: string]: 'string' | 'number' },
	) {
		this._locationApiKey = locationApiKey;
		this._locationApiEndpoint = locationApiEndpoint;
		this._requestedFields = requestedFields;
	}

	private get locationApiKey() {
		return this._locationApiKey;
	}

	private get locationApiEndpoint() {
		return this._locationApiEndpoint;
	}

	private get requestedFields() {
		return this._requestedFields;
	}

	async resolve(ip: string): Promise<Location | null> {
		if (!net.isIP(ip)) {
			return null;
		}

		const requestUrl = this.mountLocationUrl(ip);

		try {
			const response: Response = await fetch(requestUrl);

			const entries = Object.entries<unknown>(await response.json());

			const payload: Map<string, unknown> = new Map(entries);

			// We cannot predict the response from the external request.
			// Therefore, the type hint must be generic and the response must be validated.
			if (this.isValidResponse(payload)) {
				return this.mountOutput(payload);
			}

			return null;
		} catch (error) {
			throw new Error(JSON.stringify(error));
		}
	}

	private mountLocationUrl(ip: string): string {
		const url = new URL(this.locationApiEndpoint);

		url.pathname = ip;

		url.searchParams.set('access_key', this.locationApiKey);

		const fields = Object.keys(this.requestedFields);

		if (fields.length > 0) {
			url.searchParams.set('fields', fields.join(','));
		}

		return url.toString();
	}

	private isValidResponse(payload: Map<string, unknown>): boolean {
		const payloadKeys = Array.from(payload.keys());
		const requestedFields = Object.keys(this.requestedFields);

		// Every requested field must be included and every field might be null if location is not available
		return requestedFields.every((field) => payloadKeys.includes(field)
			&& (payload.get(field) === null || typeof payload.get(field) === this.requestedFields[field])
		);
	}

	private mountOutput(payload: Map<string, unknown>): Location {
		const sanitizedMap = new Map();

		Object.keys(this.requestedFields).forEach((key) => {
			const sanitizedKey = key.replace(/_name/, '');
			sanitizedMap.set(sanitizedKey, payload.get(key));
		});

		return Object.fromEntries(sanitizedMap);
	}
}
