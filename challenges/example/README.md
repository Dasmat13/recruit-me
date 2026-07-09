# challenge-example

A sample challenge module for Recruit Me.

## How to use

```js
import { defaultEngine } from '@recruit-me/challenge-engine';
import example from './index.js';

defaultEngine.register('example', example);
defaultEngine.start('example', document.getElementById('challenge-root'));
```

## Rules

- Keep UI updates local to the provided container element.
- Use modules exported from `@recruit-me/ui` for shared UI helpers.
- Do not rely on third-party frameworks inside challenge modules.
