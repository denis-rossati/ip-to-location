import {Observer, OutputMessage} from '../../src/types';

export class InMemoryProducer implements Observer {
	update(issue: OutputMessage) {
		return issue;
	}
}
