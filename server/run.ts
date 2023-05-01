import {configuration} from './constants';
import {DependencyContainer} from '../src/DependencyContainer';

export async function run() {
	const dependencyContainer: DependencyContainer = new DependencyContainer(configuration);

	dependencyContainer.run();
}

run().catch(console.error);
