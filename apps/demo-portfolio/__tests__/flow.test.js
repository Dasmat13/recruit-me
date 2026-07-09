/**
 * @jest-environment jsdom
 */

import { initApp } from '../../apps/demo-portfolio/app.mjs';

describe('recruiter mode integration', () => {
  beforeEach(() => {
    window.RECRUIT_ME_CONFIG = {
      candidateName: 'Test Candidate',
      candidateRole: 'Developer',
      theme: 'minimal',
      difficulty: 'easy',
      contact: {
        resume: '#resume',
        github: '#github',
        linkedin: '#linkedin',
        email: 'test@example.com',
      },
      unlockRules: [
        { challenges: 1, score: 1, unlock: 'resume' },
        { challenges: 2, score: 10, unlock: 'contact' },
      ],
    };

    document.body.innerHTML = `
      <section id="landing" class="screen">
        <button class="path-card" data-mode="recruiter" type="button">Recruiter</button>
      </section>
      <section id="flow" class="screen hidden" aria-hidden="true">
        <div id="challenge-root" aria-live="polite"></div>
        <button id="next-challenge" type="button">Continue</button>
      </section>
      <section id="unlock-screen" class="screen hidden" aria-hidden="true">
        <ul class="unlock-links">
          <li data-link="resume" class="hidden"><a id="link-resume" href="#">Resume</a></li>
          <li data-link="contact" class="hidden"><a id="link-contact" href="#">Contact</a></li>
        </ul>
      </section>
      <button id="view-portfolio" type="button">View Portfolio Directly</button>
      <div id="toast-container"></div>
    `;
  });

  test('shows landing screen on init', async () => {
    await initApp();
    const landing = document.getElementById('landing');
    expect(landing.classList.contains('hidden')).toBe(false);
  });

  test('switches to flow screen when recruiter path is selected', async () => {
    await initApp();
    const recruiterBtn = document.querySelector('[data-mode="recruiter"]');
    recruiterBtn.click();
    const flow = document.getElementById('flow');
    expect(flow.classList.contains('hidden')).toBe(false);
  });

  test('renders a challenge in the challenge root', async () => {
    await initApp();
    document.querySelector('[data-mode="recruiter"]').click();
    const root = document.getElementById('challenge-root');
    expect(root.innerHTML).not.toBe('');
  });

  test('unlocks resume link after completing required challenges', async () => {
    await initApp();
    document.querySelector('[data-mode="recruiter"]').click();
    const nextBtn = document.getElementById('next-challenge');
    nextBtn.click();
    const resumeLi = document.querySelector('.unlock-links li[data-link="resume"]');
    expect(resumeLi.classList.contains('hidden')).toBe(false);
  });
});
