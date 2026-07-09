import config from './config.js';
import { defaultEngine } from '../../packages/challenge-engine/index.mjs';
import initApp from './app.mjs';

window.__recruitMeEngine = defaultEngine;

initApp({ config, engine: defaultEngine });
