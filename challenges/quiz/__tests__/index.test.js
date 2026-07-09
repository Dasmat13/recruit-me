/**
 * @jest-environment jsdom
 */

import { init, cleanup } from '../index.js';

describe('quiz challenge', () => {
  let container;
  let engine;

  beforeEach(() => {
    container = document.createElement('div');
    engine = { complete: jest.fn() };
  });

  afterEach(() => {
    cleanup(container);
  });

  test('renders the first question', () => {
    init(container, engine);
    expect(container.textContent).toContain('container orchestration');
  });

  test('renders three option buttons per question', () => {
    init(container, engine);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);
  });

  test('advances to next question on answer', () => {
    init(container, engine);
    const buttons = container.querySelectorAll('button');
    buttons[0].click();
    expect(container.textContent).toContain('CI/CD');
  });

  test('shows submit button at end of quiz', () => {
    init(container, engine);
    const buttons = container.querySelectorAll('button');
    buttons[0].click(); // q1
    buttons[0].click(); // q2
    buttons[0].click(); // q3 → result
    expect(container.textContent).toContain('Quiz Complete');
    expect(container.textContent).toContain('Submit');
  });

  test('calls engine.complete with final score on submit', () => {
    init(container, engine);
    const buttons = container.querySelectorAll('button');
    buttons[0].click();
    buttons[0].click();
    buttons[0].click();
    const submit = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Submit'
    );
    submit.click();
    expect(engine.complete).toHaveBeenCalledWith('quiz', expect.any(Number));
  });

  test('cleanup removes DOM content', () => {
    init(container, engine);
    cleanup(container);
    expect(container.innerHTML).toBe('');
  });
});
