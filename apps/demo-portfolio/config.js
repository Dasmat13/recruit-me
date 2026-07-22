const config = {
  candidateName: 'A Developer',
  candidateRole: 'Full Stack Developer',
  candidateBio:
    'Passionate about building reliable software and contributing to open source. Adapt this bio to match any candidate.',
  theme: 'neuroblast',
  difficulty: 'medium',
  skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS', 'TypeScript', 'PostgreSQL'],
  contact: {
    email: 'candidate@example.com',
    github: 'https://github.com/your-username',
    linkedin: 'https://linkedin.com/in/your-profile',
    resume: 'https://your-portfolio-url.com/resume.pdf',
  },
  unlockRules: [
    { challenges: 2, score: 15, unlock: 'resume' },
    { challenges: 3, score: 25, unlock: 'contact' },
  ],
};

window.RECRUIT_ME_CONFIG = config;

export default config;
