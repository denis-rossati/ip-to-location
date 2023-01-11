import dotenv from 'dotenv';
import path from 'path';
import {getEnvironmentVariable} from '../src/utils';

const envFile = process.env.ENV === 'dev' ? '.dev.env' : '.env';

dotenv.config({path: path.join(process.cwd(), envFile)});

export const LOCATION_INPUT_TOPIC_NAME = getEnvironmentVariable('LOCATION_INPUT_TOPIC_NAME');
export const LOCATION_OUTPUT_TOPIC_NAME = getEnvironmentVariable('LOCATION_OUTPUT_TOPIC_NAME');
export const API_URL = getEnvironmentVariable('API_URL');
export const API_KEY = getEnvironmentVariable('API_KEY');
