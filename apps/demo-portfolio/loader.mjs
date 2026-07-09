import config from './config.js';
import themes from '../../packages/themes/index.mjs';
import { defaultEngine } from '../../packages/challenge-engine/index.mjs';
import initApp from './app.mjs';

if (config && config.theme) {
  themes.applyTheme(config.theme);
}

window.__recruitMeEngine = defaultEngine;

initApp({ config, engine: defaultEngine });
