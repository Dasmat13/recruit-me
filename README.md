# Recruit Me If You Can

![Recruit Me If You Can](https://via.placeholder.com/1200x600?text=Recruit+Me+If+You+Can) <!-- Replace with actual screenshot when available -->

> **Recruit Me If You Can** — A recruiter evaluation portfolio by [Dasmat Hansda]. Prove your company qualifies first before you ask me to apply.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup](#installation--setup)
4. [Deployment](#deployment)
5. [Roadmap](#roadmap)
6. [Contributing](#contributing)
7. [License](#license)

---

## Features

- **Recruiter Evaluation Flow:** Multi-step interactive assessment where recruiters must prove their company meets criteria before accessing the resume.
- **Terminal-Style UI:** Retro hacker aesthetic with command-line interactions and animated matrix background.
- **Role-Based Paths:** Different evaluation tracks for Fullstack, Backend, Frontend, and DevOps roles.
- **PDF Resume Generation:** Client-side resume download using jsPDF.
- **Dark / Light Mode:** Fully themed UI with persistent preference.
- **Responsive Design:** Works on desktop and mobile devices.
- **Retro Sound Effects:** Optional ambient sound effects for the hacker terminal experience.

## Tech Stack

### Frontend
- **HTML5** — Semantic structure
- **CSS3** — Custom properties, animations, responsive layout
- **Vanilla JavaScript (ES6+)** — DOM manipulation, event handling, jsPDF for PDF generation
- **Google Fonts** — Space Grotesk, JetBrains Mono

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Data persistence (results, submissions)
- **Jest + Supertest** — API testing
- **Docker Compose** — Containerized deployment

## Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm

### Frontend Only (Static Demo)

```bash
# Navigate to project root
cd recruit-me

# Serve with any static server
python3 -m http.server 8000
# or
npx serve .
```

### Full Stack (Frontend + Backend)

```bash
# Clone repository
git clone https://github.com/Dasmat13/recruit-me.git
cd recruit-me

# Install server dependencies
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MONGO_URI and FRONTEND_ORIGIN

# Start backend
npm run dev   # → http://localhost:3001

# In a separate terminal, serve frontend
cd ..
python3 -m http.server 8000
```

## Deployment

```bash
# Docker Compose (builds and starts both frontend and backend)
docker-compose up --build
```

## Roadmap

- [ ] Add admin dashboard to view recruiter submissions
- [ ] Support custom resume templates
- [ ] Add analytics for recruiter engagement
- [ ] Implement email notifications for new submissions
- [ ] Add i18n support for non-English recruiters
- [ ] PWA / offline terminal mode

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Found a bug? [Open an issue](https://github.com/Dasmat13/recruit-me/issues)
- Want a new feature? [Start a discussion](https://github.com/Dasmat13/recruit-me/issues)
- Ready to code? Check out [good first issues](https://github.com/Dasmat13/recruit-me/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.