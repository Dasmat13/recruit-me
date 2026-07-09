# Recruit Me

![Recruit Me](https://via.placeholder.com/1200x600?text=Recruit+Me+Portfolio+Framework)

> **Recruit Me** — an open-source portfolio × game × challenge framework.
>
> Recruiters complete challenges, developers explore projects, and contributors extend the platform.

---

## User Journeys

### 🧑 Recruiter
Instead of reading a resume immediately, visitors see a mission screen, complete challenges, and unlock contact/projects.

### 👨‍💻 Developer
Visitors explore open-source contributions, challenge mechanics, themes, and can propose new challenge types.

### 🎮 Explorer
Visitors simply browse projects, skills, timeline, certifications, and blog posts without playing challenges.

---

## Features

- **Multiple Modes:** Recruiter, Developer, and Explorer paths.
- **Challenge System:** Quiz, drag-and-drop, terminal simulator, code review, memory game, puzzles.
- **Themes:** Terminal, Retro Arcade, Cyberpunk, Minimal, and more.
- **Gamification:** Achievements for completing challenges and milestones.
- **Customization:** Change name, role, theme, and challenge selection via `apps/demo-portfolio/config.js`.

---

## Project Structure

```
apps/
├── demo-portfolio/         # Running portfolio demo
packages/
├── challenge-engine/       # Challenge registry and scoring runtime
├── ui/                     # Shared UI primitives
├── animations/             # Reusable animation presets
└── themes/                 # Theme tokens and themes
challenges/
├── quiz/
├── drag-drop/
├── terminal/
├── code-review/
├── puzzle/
└── memory-game/
docs/
examples/
templates/
server/
```

## Getting Started

### Run the Demo Portfolio

```bash
cd apps/demo-portfolio
python3 -m http.server 8000
# Open http://localhost:8000
```

### Run the Backend (Optional)

```bash
cd server
npm install
npm run dev
```

## Customization

Fork `apps/demo-portfolio/config.js` and replace:
- name
- role
- skills
- contact links
- theme

No build step required.

## Roadmap

- [ ] Ship challenge-engine v1
- [ ] Add theme marketplace
- [ ] Recruiter analytics (privacy-conscious)
- [ ] Mobile-optimized challenge modes
- [ ] Multi-language support
- [ ] AI-generated interview challenge hints
- [ ] One-click resume PDF export
- [ ] Leaderboard

## Contributing

We welcome all kinds of contributions. See [CONTRIBUTING.md](CONTRIBUTING.md).

- Frontend: UI, themes, animations
- Challenges: new challenge modules
- Backend: API and tests
- Docs: guides and architecture notes

Start with [`challenges/example/`](challenges/example/) for a template challenge.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
