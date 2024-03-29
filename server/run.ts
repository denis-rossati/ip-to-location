import {configuration} from './constants';
import {DependencyContainer} from '../src/DependencyContainer';

export async function run() {
	const dependencyContainer = new DependencyContainer(configuration);

	dependencyContainer.run();
}

run().catch(console.error);
