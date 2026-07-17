# Recruit Me

![Recruit Me](https://via.placeholder.com/1200x600?text=Recruit+Me+Portfolio+Framework)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/Dasmat13/recruit-me/blob/main/CONTRIBUTING.md)
[![Issues](https://img.shields.io/badge/issues-15%2B-open)](https://github.com/Dasmat13/recruit-me/issues)

> **Recruit Me** — an open-source portfolio × game × challenge framework.
>
> Recruiters complete challenges, developers explore projects, and contributors extend the platform.

---

## What is Recruit Me?

Recruit Me turns a developer portfolio into an interactive experience. Instead of a static resume, visitors **play, solve, and explore** to unlock your work.

It's built for three audiences:

| Audience | Experience |
|----------|-----------|
| 🧑 **Recruiter** | Complete challenges to prove tech aptitude, then unlock resume, projects, and contact |
| 👨‍💻 **Developer** | Browse the source, add new challenge types, themes, and animations |
| 🎮 **Explorer** | Browse projects, skills, timeline, and milestones without playing challenges |

---

## User Journeys

### 🧑 Recruiter Mode

Instead of scrolling a PDF, recruiters see a mission briefing:

- **Mission:** Evaluate the candidate's stack
- **Difficulty:** Configurable easy / medium / hard
- **Estimated Time:** ~3 minutes

Then they complete **real technical challenges**:

1. **Learn About Me** — quiz questions about tech preferences and experience
2. **Fix My Deployment** — rearrange a broken CI/CD pipeline
3. **Match Technologies** — drag-and-drop tools to categories (Docker → Containerization, etc.)
4. **Bug Hunt** — spot the issue in a real GitHub Actions snippet
5. **Unlock Portfolio** — reveal resume, GitHub, LinkedIn, projects, and contact info

### 👨‍💻 Developer Mode

This is where open source thrives. Developers can:

- Add new challenge types (quiz, drag-and-drop, terminal, code review, puzzle)
- Create new themes (Terminal, Retro Arcade, Cyberpunk, Minimal, VS Code)
- Improve animations and accessibility
- Translate the interface
- Add docs, tests, and CI workflows

### 🎮 Explorer Mode

Visitors simply browse:

- Projects
- Skills
- Timeline
- Certifications
- Blog

No challenge required.

---

## Features

- **Multiple Paths:** Recruiter, Developer, and Explorer modes
- **Challenge Engine:** Pluggable challenge system with scoring and achievements
- **Theme System:** Terminal, Retro Arcade, Cyberpunk, Minimal, and custom themes
- **Gamification:** Achievements like Bug Hunter, CI/CD Master, Cloud Explorer
- **Responsive:** Works on desktop and mobile
- **No Build Step:** Vanilla HTML/CSS/JS for the demo app
- **Optional Backend:** Express + MongoDB for storing results and analytics

---

## Project Structure

```
apps/
├── demo-portfolio/          # Working portfolio demo (clone this)
│   ├── config.js            # Edit this for your own portfolio
│   ├── index.html
│   ├── style.css
│   └── app.mjs
│
packages/
├── challenge-engine/        # Core runtime: registry, scoring, flow
├── ui/                      # Shared UI primitives
├── animations/              # Reusable animation presets
└── themes/                  # Theme tokens and switch logic
│
challenges/
├── quiz/                    # Multiple-choice challenges
├── drag-drop/               # Drag and drop matching
├── terminal/                # Terminal simulator
├── code-review/             # Spot the bug snippets
├── puzzle/                  # General puzzle template
├── memory-game/             # Memory card mini-game
└── example/                 # Template for new challenge types
│
docs/
├── architecture.md          # Contribution areas and roadmap
└── examples/                # Example challenge combinations
templates/
└── portfolio-config.example.json
server/                      # Optional backend API
```

---

## Getting Started

### Run in 2 Minutes (No Backend)

The demo portfolio is a static app and does not need Node.js, MongoDB, or environment variables.

```bash
git clone https://github.com/Dasmat13/recruit-me.git
cd recruit-me
cd apps/demo-portfolio
python3 -m http.server 8000
```

Open <http://localhost:8000> after the server starts.

### Run With the Optional Backend

Use this path when you want to store assessment results and use the analytics API. The backend requires Node.js 18+, npm, and a running MongoDB instance.

```bash
# From the repository root
cd server
npm install
cp .env.example .env
# Set MONGO_URI in server/.env if MongoDB is not running locally.
npm run dev
```

The API listens on <http://localhost:3001>. In a second terminal, serve the demo:

```bash
cd apps/demo-portfolio
python3 -m http.server 8000
```

For a fully containerized setup, run `docker-compose up --build` from the repository root.

### Docker

```bash
docker-compose up --build
```

---

## Customization

Make this portfolio your own in **4 steps**:

1. **Fork** the repo
2. **Edit `apps/demo-portfolio/config.js`**
3. **Update `apps/demo-portfolio/index.html`** with your projects and bio
4. **Deploy** to Vercel, Netlify, or any static host

```js
// config.js example
window.RECRUIT_ME_CONFIG = {
  candidateName: 'Your Name',
  candidateRole: 'Full Stack Developer',
  skills: ['JavaScript', 'Node.js', 'Docker', 'AWS'],
  contact: {
    email: 'you@example.com',
    github: 'https://github.com/your-username',
    linkedin: 'https://linkedin.com/in/your-profile',
  },
  theme: 'retro',
  difficulty: 'medium',
};
```

No build step required.

---

## Challenge Types

Contributors can build reusable challenge modules:

| Type | Description | Example |
|------|-------------|---------|
| ✅ Quiz | Multiple-choice questions | Tech stack preferences |
| ✅ Drag & Drop | Match items to categories | Tools → categories |
| ✅ Terminal | Command-line simulator | Git commands |
| ✅ Code Review | Spot the bug | Broken CI pipeline |
| ✅ Memory Game | Card matching | DevOps icon pairs |
| ✅ Puzzle | Cross-domain puzzles | Coming soon |
| 🚀 Escape Room | Multi-step puzzle chain | **Wanted** |
| 🚀 SQL Challenge | Write the correct query | **Wanted** |
| 🚀 Kubernetes Puzzle | Fix the manifest | **Wanted** |

Every challenge is a self-contained module in `challenges/*/index.js`.

---

## Roadmap

- [x] Core recruiter evaluation flow
- [x] Challenge engine scaffold with registry and scoring
- [x] Starter challenge modules (quiz, drag-drop, terminal, code-review)
- [x] Theme system with terminal and retro presets
- [ ] Ship challenge-engine v1 with full test coverage
- [ ] Add 10+ community challenge modules
- [ ] Theme marketplace for community themes
- [ ] Recruiter analytics (privacy-conscious, optional)
- [ ] Mobile-optimized challenge interactions
- [ ] Multi-language support (i18n)
- [ ] AI-generated interview challenge hints
- [ ] One-click resume PDF export
- [ ] Leaderboard for completed assessments
- [ ] Challenge authoring CLI/tooling

---

## Contributing

We welcome all kinds of contributions:

- **Frontend** — UI polish, new themes, responsive fixes
- **Challenges** — build new challenge modules under `challenges/*`
- **Backend** — API endpoints, tests, CI improvements
- **Docs** — guides, architecture notes, example portfolios
- **Design** — icons, illustrations, theme concepts
- **Beginners** — bug fixes, typos, small enhancements

### Quick Contribution Flow

1. Check [open issues](https://github.com/Dasmat13/recruit-me/issues) for `good first issue` or `help wanted`
2. Fork and branch from `main`
3. Make your changes
4. Open a PR referencing the issue (e.g. `Closes #4`)

### Writing a Challenge

Every challenge is a module exporting `init(container)`.

```js
// challenges/example/index.js
export function init(container) {
  container.innerHTML = '<h3>Your challenge here</h3>';
}
```

See `challenges/example/` for a full template, and `CONTRIBUTING.md` for guidelines.

---

## Tech Stack

### Demo Portfolio
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Google Fonts: Space Grotesk, JetBrains Mono
- jsPDF for PDF generation

### Backend (Optional)
- Node.js + Express
- MongoDB + Mongoose
- Jest + Supertest
- Docker Compose

### Packages
- `challenge-engine` — registry, scoring, flow control
- `ui` — shared UI helpers
- `animations` — fade/slide presets
- `themes` — theme tokens and runtime switching

---

## Star History

If this project helps you or inspires your own portfolio, consider starring the repo. It helps others find it.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ and open-source contributions by the community.</sub>
</div>
