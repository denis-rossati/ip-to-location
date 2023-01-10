import dotenv from 'dotenv';
import path from 'path';
import { getEnvironmentVariable } from '../src/utils';

const devEnvironment = process.env.ENV === 'dev';

dotenv.config({ path: path.join(process.cwd(), devEnvironment ? '.dev.env' : '.env') });

export const LOCATION_INPUT_TOPIC_NAME = getEnvironmentVariable('LOCATION_INPUT_TOPIC_NAME');

