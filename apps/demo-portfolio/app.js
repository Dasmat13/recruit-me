/* ==========================================================================
   RECRUIT ME IF YOU CAN — Interactive Application JS
   State machine, Audio Synthesizer, Live Terminal Commands, and Interactive Portfolio
   ========================================================================== */

// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
// Override values in config.js or edit this section for a custom candidate.
const CFG = window.RECRUIT_ME_CONFIG || {
  candidateName: 'A Developer',
  candidateRole: 'Full Stack Developer',
  skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
  terminal: {
    scriptName: 'recruit-portfolio.sh',
    githubUser: 'your-username',
  },
  branding: {
    appName: 'Recruit Me',
    siteUrl: 'https://your-portfolio-url.com',
  },
  contact: {
    email: 'candidate@example.com',
    github: 'https://github.com/your-username',
    linkedin: 'https://linkedin.com/in/your-profile',
  },
};

// ─── DYNAMIC SOUND SYNTHESIZER (WEB AUDIO API) ──────────────────────────────
class RetroAudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playBeep(freq = 440, type = 'sine', duration = 0.1, delay = 0) {
    if (this.muted) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  playSelect() {
    this.playBeep(600, 'square', 0.05);
  }

  playToggle() {
    this.playBeep(400, 'sine', 0.08);
    this.playBeep(600, 'sine', 0.08, 0.05);
  }

  playRoundSuccess() {
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, idx) => {
      this.playBeep(freq, 'triangle', 0.15, idx * 0.08);
    });
  }

  playVictory() {
    const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, idx) => {
      this.playBeep(freq, 'square', 0.2, idx * 0.07);
    });
  }
  
  playFailure() {
    this.playBeep(220, 'sawtooth', 0.2);
    this.playBeep(180, 'sawtooth', 0.3, 0.15);
  }
}

const AudioSynth = new RetroAudioSynth();

// Toggle mute functionality
function toggleMute() {
  AudioSynth.muted = !AudioSynth.muted;
  const btn = document.getElementById("muteBtn");
  if (btn) {
    btn.innerHTML = AudioSynth.muted ? "🔇" : "🔊";
  }
  showToast(AudioSynth.muted ? "Sound muted" : "Sound unmuted", "info");
  AudioSynth.playToggle();
}


// ─── SYSTEM NOTIFICATIONS (TOASTS) ──────────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warning") icon = "⚠️";
  
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  container.appendChild(toast);
  
  // Audio chime
  if (type === "success") AudioSynth.playBeep(880, 'sine', 0.1);
  else AudioSynth.playBeep(520, 'sine', 0.06);

  setTimeout(() => {
    toast.style.animation = "toastIn 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// ─── ASSESSMENT GAME DATA ───────────────────────────────────────────────────
// ─── ASSESSMENT GAME DATA ───────────────────────────────────────────────────
const QUESTIONS_BY_ROLE = {
  fullstack: [
    {
      id: 1,
      key: "culture",
      questions: [
        {
          text: "What is your company's average employee retention rate?",
          options: [
            { label: "Below 50% — High turnover",  pts: 0, hint: "Caution: Signal of poor management" },
            { label: "50–70% — Standard startup",  pts: 4, hint: "A bit unstable, but average" },
            { label: "70–85% — Solid team stability", pts: 8, hint: "Good work culture indicator" },
            { label: "Above 85% — People rarely leave", pts: 10, hint: "Outstanding employee satisfaction" },
          ]
        },
        {
          text: "How much learning/training budget does each engineer get annually?",
          options: [
            { label: "None — Rely on self-learning", pts: 0, hint: "No corporate support for growth" },
            { label: "Under ₹10K / $200", pts: 3, hint: "Enough for a few basic books/courses" },
            { label: "₹10K–₹50K / $200–$1000", pts: 7, hint: "Decent support for exams/training" },
            { label: "₹50K+ / $1000+ — We support growth", pts: 10, hint: "High commitment to education" },
          ]
        },
        {
          text: "How are promotions/career reviews structured?",
          options: [
            { label: "Vague, ad-hoc, or non-existent", pts: 0, hint: "No structured growth trajectory" },
            { label: "Subjective annual checks", pts: 4, hint: "Heavily reliant on manager bias" },
            { label: "Structured bi-annual progression framework", pts: 8, hint: "Transparent and fair promotion track" },
            { label: "Meritocracy-driven with custom milestone reviews", pts: 10, hint: "Fast-tracked growth for high performers" },
          ]
        },
      ]
    },
    {
      id: 2,
      key: "worklife",
      questions: [
        {
          text: "How do you handle frontend state management and performance tuning?",
          options: [
            { label: "No strategy — ad-hoc client re-renders", pts: 0, hint: "High tech debt, laggy UX" },
            { label: "Standard context API or basic redux store", pts: 4, hint: "Standard, works for simple projects" },
            { label: "Granular signals/memoization with lazy loading", pts: 8, hint: "Optimized bundle sizes, fast load times" },
            { label: "State machines / micro-frontends with metrics profiling", pts: 10, hint: "Top-tier client architecture and UX engineering" },
          ]
        },
        {
          text: "What is your approach to database scaling and query index tuning?",
          options: [
            { label: "Let database auto-resolve / no query profiling", pts: 0, hint: "Causes severe bottlenecks at scale" },
            { label: "Basic composite indexes on primary keys", pts: 4, hint: "Standard relational tuning" },
            { label: "Active query profiling, read-replicas, and caching", pts: 8, hint: "Highly scalable reads and writes" },
            { label: "Sharded datastores + automatic partition key routing", pts: 10, hint: "Ultra-high throughput backend architecture" },
          ]
        },
        {
          text: "How is API security and DDoS protection configured?",
          options: [
            { label: "None — public exposed endpoints", pts: 0, hint: "Vulnerable to scraping and attacks" },
            { label: "Basic API key checks and HTTPS", pts: 4, hint: "Minimum security baseline" },
            { label: "Layer 7 rate limiting, JWT rotation, and WAF rules", pts: 8, hint: "Secure and robust service endpoints" },
            { label: "Zero-trust service mesh + OAuth2 authorization server", pts: 10, hint: "Enterprise-grade secure microservices" },
          ]
        },
      ]
    },
    {
      id: 3,
      key: "tech",
      questions: [
        {
          text: "How do you prefer developers to walk through past projects?",
          options: [
            { label: "Leetcode whiteboard session (strictly theoretical)", pts: 0, hint: "Doesn't reflect real project craft" },
            { label: "Abstract slides or high-level system diagrams", pts: 2, hint: "Saves time but lacks code depth" },
            { label: "Live code walkthrough of actual PR contributions", pts: 8, hint: "Great signal of actual engineering skills" },
            { label: "Interactive system design session led by candidate", pts: 10, hint: "Peak technical and leadership communication" },
          ]
        },
        {
          text: "How are code reviews and PR checklist standards enforced?",
          options: [
            { label: "No reviews — push directly to main", pts: 0, hint: "Unstable codebase" },
            { label: "Formal peer review with optional comments", pts: 4, hint: "Standard but often delayed" },
            { label: "Mandatory PR approvals + automated lint & test hooks", pts: 8, hint: "Excellent quality guardrail" },
            { label: "Pair programming + pre-commit tests + release tagging", pts: 10, hint: "Superior engineering culture" },
          ]
        },
        {
          text: "How does the team make architectural design choices?",
          options: [
            { label: "Business or PM team mandates it", pts: 0, hint: "Leads to massive technical debt" },
            { label: "Tech lead makes all decisions unilaterally", pts: 4, hint: "Creates operational bottlenecks" },
            { label: "Ad-hoc developer-by-developer choice", pts: 2, hint: "Causes tech stack fragmentation" },
            { label: "RFC-driven: propose, document, review, decide", pts: 10, hint: "Peak collaborative architecture" },
          ]
        },
      ]
    },
    {
      id: 4,
      key: "growth",
      questions: [
        {
          text: "What is the biggest technical challenge the engineering team faces?",
          options: [
            { label: "Lack of clear product requirements and scope creep", pts: 0, hint: "Red flag: constant rework" },
            { label: "Constant firefighting of bugs in production", pts: 2, hint: "Caution: poor test coverage" },
            { label: "Monolith to microservices migration", pts: 8, hint: "Interesting scaling challenge" },
            { label: "Scaling datastores to handle high real-time traffic", pts: 10, hint: "Excellent deep-tech work opportunity" },
          ]
        },
        {
          text: "What primary metric is the engineering team measured on?",
          options: [
            { label: "Lines of code written per day", pts: 0, hint: "Terrible metric: promotes verbose code" },
            { label: "Sprint velocity / number of tickets closed", pts: 4, hint: "Feature-factory metric" },
            { label: "None — we don't track engineering metrics", pts: 6, hint: "High trust, but potentially unorganized" },
            { label: "System reliability, uptime, and business value", pts: 10, hint: "Mature engineering alignment" },
          ]
        },
        {
          text: "How competitive is the baseline compensation package?",
          options: [
            { label: "Below average — but we have 'family' vibes!", pts: 0, hint: "Red flag: compensation underfunded" },
            { label: "At standard market median", pts: 5, hint: "Standard baseline offer" },
            { label: "Slightly above market average", pts: 8, hint: "Attractive package" },
            { label: "Top-of-market base salary + equity + strong perks", pts: 10, hint: "Maximum recruitment appeal" },
          ]
        },
      ]
    }
  ],
  devops: [
    {
      id: 1,
      key: "culture",
      questions: [
        {
          text: "What is your company's average employee retention rate?",
          options: [
            { label: "Below 50% — High turnover",  pts: 0, hint: "Caution: Signal of poor management" },
            { label: "50–70% — Standard startup",  pts: 4, hint: "A bit unstable, but average" },
            { label: "70–85% — Solid team stability", pts: 8, hint: "Good work culture indicator" },
            { label: "Above 85% — People rarely leave", pts: 10, hint: "Outstanding employee satisfaction" },
          ]
        },
        {
          text: "How much learning/training budget does each engineer get annually?",
          options: [
            { label: "None — Rely on self-learning", pts: 0, hint: "No corporate support for growth" },
            { label: "Under ₹10K / $200", pts: 3, hint: "Enough for a few basic books/courses" },
            { label: "₹10K–₹50K / $200–$1000", pts: 7, hint: "Decent support for exams/training" },
            { label: "₹50K+ / $1000+ — We support growth", pts: 10, hint: "High commitment to education" },
          ]
        },
        {
          text: "How are promotions/career reviews structured?",
          options: [
            { label: "Vague, ad-hoc, or non-existent", pts: 0, hint: "No structured growth trajectory" },
            { label: "Subjective annual checks", pts: 4, hint: "Heavily reliant on manager bias" },
            { label: "Structured bi-annual progression framework", pts: 8, hint: "Transparent and fair promotion track" },
            { label: "Meritocracy-driven with custom milestone reviews", pts: 10, hint: "Fast-tracked growth for high performers" },
          ]
        },
      ]
    },
    {
      id: 2,
      key: "worklife",
      questions: [
        {
          text: "How are container orchestration and resource scaling configured?",
          options: [
            { label: "Manual scale up/down of virtual machines", pts: 0, hint: "Slow response times, high manual overhead" },
            { label: "Basic Kubernetes with static node pools", pts: 6, hint: "Standard cloud setup" },
            { label: "Managed serverless container engines", pts: 8, hint: "Low maintenance, good scaling" },
            { label: "Kubernetes with Karpenter/Cluster Autoscaler & Horizontal Pod Autoscaler", pts: 10, hint: "Cost-optimized, rapid auto-scaling" },
          ]
        },
        {
          text: "What is your approach to system monitoring and alerting dashboards?",
          options: [
            { label: "None — we find out when users complain", pts: 0, hint: "Severe operational risk" },
            { label: "Basic uptime checks and server logs", pts: 4, hint: "Reactively tracking errors" },
            { label: "Third-party APM services (Datadog/NewRelic)", pts: 8, hint: "Comprehensive but high cost" },
            { label: "Prometheus + Grafana with Alertmanager & custom metrics", pts: 10, hint: "High-observability infrastructure setup" },
          ]
        },
        {
          text: "How is infrastructure provisioned and deployed?",
          options: [
            { label: "Manual commands and scripts on production servers", pts: 0, hint: "Prone to configuration drift and outages" },
            { label: "Basic Ansible or bash scripts inside CD pipelines", pts: 5, hint: "Some automation, but lacks state tracking" },
            { label: "Cloud portal console config with cloud-formation templates", pts: 7, hint: "Partially automated" },
            { label: "Infrastructure-as-Code (Terraform/OpenTofu) integrated in GitOps pipelines", pts: 10, hint: "Stateful, repeatable infrastructure craft" },
          ]
        },
      ]
    },
    {
      id: 3,
      key: "tech",
      questions: [
        {
          text: "How do you prefer DevOps candidates to walk through past projects?",
          options: [
            { label: "Solving coding questions on whiteboard (e.g. hackerrank)", pts: 0, hint: "Irrelevant for devops roles" },
            { label: "Present slides of high-level architecture designs", pts: 3, hint: "Lacks code detail" },
            { label: "Designing a mock highly-available architecture on drawing board", pts: 8, hint: "Shows structural system design thinking" },
            { label: "Live walk through of actual Terraform or pipeline repos", pts: 10, hint: "Excellent signal of real systems work" },
          ]
        },
        {
          text: "How are pipeline configurations and security policies reviewed?",
          options: [
            { label: "No pipeline reviews — written by DevOps team lead", pts: 2, hint: "Creates single point of failure" },
            { label: "Ad-hoc audits by external security team once a year", pts: 3, hint: "Very slow feedback cycle" },
            { label: "Standard peer review on Git repo", pts: 6, hint: "Standard code review" },
            { label: "Automated security scanning (Trivy/Checkov) + peer reviews", pts: 10, hint: "Excellent DevSecOps pipeline design" },
          ]
        },
        {
          text: "How does the team make cloud architecture decisions?",
          options: [
            { label: "Unilaterally dictated by cloud provider salespeople", pts: 0, hint: "Inefficient and expensive" },
            { label: "DevOps lead decides everything", pts: 4, hint: "Tech silos" },
            { label: "Ad-hoc per project requirements", pts: 5, hint: "Inconsistent cloud footprint" },
            { label: "RFC-driven: propose design, review cost/security, decide", pts: 10, hint: "Best collaborative design standard" },
          ]
        },
      ]
    },
    {
      id: 4,
      key: "growth",
      questions: [
        {
          text: "What is the biggest technical challenge the engineering team faces?",
          options: [
            { label: "Frequent service downtime and poor alerting quality", pts: 2, hint: "Indicates high stress" },
            { label: "Legacy database clustering and replication lag", pts: 8, hint: "Interesting reliability challenge" },
            { label: "Reducing cloud spend and optimizing resource utilization", pts: 9, hint: "Classic FinOps challenge" },
            { label: "Migrating from virtual machines to containerized Kubernetes setups", pts: 10, hint: "Great modern infrastructure work" },
          ]
        },
        {
          text: "What primary metric is the engineering team measured on?",
          options: [
            { label: "Strict cloud budget limits", pts: 4, hint: "Cost-focused, potentially stifles growth" },
            { label: "None — we don't track metrics", pts: 5, hint: "Unorganized setup" },
            { label: "Uptime (e.g. 99.99%) and MTTR", pts: 9, hint: "Excellent reliability metrics" },
            { label: "Deployment frequency and DORA metrics", pts: 10, hint: "Optimal DevOps maturity signal" },
          ]
        },
        {
          text: "How competitive is the baseline compensation package?",
          options: [
            { label: "Below average — but we have 'family' vibes!", pts: 0, hint: "Red flag: compensation underfunded" },
            { label: "At standard market median", pts: 5, hint: "Standard baseline offer" },
            { label: "Slightly above market average", pts: 8, hint: "Attractive package" },
            { label: "Top-of-market base salary + equity + strong perks", pts: 10, hint: "Maximum recruitment appeal" },
          ]
        },
      ]
    }
  ],
  pm: [
    {
      id: 1,
      key: "culture",
      questions: [
        {
          text: "What is your company's average employee retention rate?",
          options: [
            { label: "Below 50% — High turnover",  pts: 0, hint: "Caution: Signal of poor management" },
            { label: "50–70% — Standard startup",  pts: 4, hint: "A bit unstable, but average" },
            { label: "70–85% — Solid team stability", pts: 8, hint: "Good work culture indicator" },
            { label: "Above 85% — People rarely leave", pts: 10, hint: "Outstanding employee satisfaction" },
          ]
        },
        {
          text: "How much learning/training budget does each engineer get annually?",
          options: [
            { label: "None — Rely on self-learning", pts: 0, hint: "No corporate support for growth" },
            { label: "Under ₹10K / $200", pts: 3, hint: "Enough for a few basic books/courses" },
            { label: "₹10K–₹50K / $200–$1000", pts: 7, hint: "Decent support for exams/training" },
            { label: "₹50K+ / $1000+ — We support growth", pts: 10, hint: "High commitment to education" },
          ]
        },
        {
          text: "How are promotions/career reviews structured?",
          options: [
            { label: "Vague, ad-hoc, or non-existent", pts: 0, hint: "No structured growth trajectory" },
            { label: "Subjective annual checks", pts: 4, hint: "Heavily reliant on manager bias" },
            { label: "Structured bi-annual progression framework", pts: 8, hint: "Transparent and fair promotion track" },
            { label: "Meritocracy-driven with custom milestone reviews", pts: 10, hint: "Fast-tracked growth for high performers" },
          ]
        },
      ]
    },
    {
      id: 2,
      key: "worklife",
      questions: [
        {
          text: "How are features and project scopes defined?",
          options: [
            { label: "Ad-hoc verbal requests or vague Slack pings", pts: 0, hint: "Leads to endless rework and frustration" },
            { label: "Unilateral dictates from business managers", pts: 2, hint: "Poor developer alignment" },
            { label: "High-level specs with technical input before sprints", pts: 8, hint: "Collaborative and clear features" },
            { label: "Detailed PRDs (Product Requirement Docs) with clear Figma mocks", pts: 10, hint: "Extremely professional product engineering" },
          ]
        },
        {
          text: "How is technical debt balanced against new feature velocity?",
          options: [
            { label: "Technical debt is ignored; always build features", pts: 0, hint: "Severe quality bottleneck soon" },
            { label: "Ad-hoc refactoring only when things break", pts: 4, hint: "Reactive architecture" },
            { label: "Separate technical sprints scheduled quarterly", pts: 8, hint: "Solid planned cleanup" },
            { label: "20% dev time dedicated to refactoring and stability", pts: 10, hint: "Healthy engineering standard" },
          ]
        },
        {
          text: "What does cross-functional autonomy look like?",
          options: [
            { label: "Micro-managed: PM dictates exactly how to write code", pts: 0, hint: "High friction, low innovation" },
            { label: "Engineers must seek approval for every minor UI choice", pts: 3, hint: "Slow feedback loops" },
            { label: "Complete separation: devs don't talk to product", pts: 4, hint: "Leads to building the wrong product" },
            { label: "PM defines 'What' and 'Why'; devs define 'How'", pts: 10, hint: "High-trust, productive partnership" },
          ]
        },
      ]
    },
    {
      id: 3,
      key: "tech",
      questions: [
        {
          text: "How do you prefer to run project walkthroughs and sprint demos?",
          options: [
            { label: "No demo — we deploy and hope it works", pts: 0, hint: "High production error risk" },
            { label: "Devs present a slide-deck summarizing work done", pts: 2, hint: "Lacks product interaction" },
            { label: "Walkthrough of GitHub code changes and PR diffs", pts: 7, hint: "Shows code quality, but not UX" },
            { label: "Interactive live demo of the feature working in staging", pts: 10, hint: "Best signal of working product" },
          ]
        },
        {
          text: "How does the team handle retrospective feed-backs?",
          options: [
            { label: "Formal meetings where blame is assigned for delayed tasks", pts: 0, hint: "Red flag: toxic work culture" },
            { label: "None — we immediately start the next sprint", pts: 1, hint: "No continuous improvement cycle" },
            { label: "Occasional feedback when a major outage happens", pts: 4, hint: "Reactive culture" },
            { label: "Blameless sprint retros focused on process improvements", pts: 10, hint: "Peak team collaboration" },
          ]
        },
        {
          text: "How are architectural and product trade-offs resolved?",
          options: [
            { label: "Decisions are postponed indefinitely", pts: 0, hint: "Analysis paralysis" },
            { label: "Unilateral decision by PM to meet deadlines", pts: 2, hint: "Creates massive future tech debt" },
            { label: "Tech lead makes final call without product alignment", pts: 5, hint: "May build unaligned features" },
            { label: "RFC discussion involving devs, product, and QA", pts: 10, hint: "Best balanced product-tech decision" },
          ]
        },
      ]
    },
    {
      id: 4,
      key: "growth",
      questions: [
        {
          text: "What is the biggest challenge the team is facing?",
          options: [
            { label: "High attrition rates and low developer morale", pts: 0, hint: "Caution: poor management culture" },
            { label: "Unstable releases and high regression rates", pts: 3, hint: "Indicates lack of tests/QA" },
            { label: "Balancing multiple stakeholder priorities", pts: 8, hint: "Standard prioritization challenge" },
            { label: "Achieving product-market fit / feature adoption", pts: 10, hint: "Very interesting product challenge" },
          ]
        },
        {
          text: "What primary metric is the product-tech team measured on?",
          options: [
            { label: "Ticket count / volume of Jira issues closed", pts: 1, hint: "Output-oriented and gaming-prone" },
            { label: "Strict adherence to sprint deadlines", pts: 4, hint: "Focuses on speed over quality" },
            { label: "We don't track metrics", pts: 5, hint: "Unstructured environment" },
            { label: "User engagement, retention, and business growth", pts: 10, hint: "Optimal outcomes-oriented metric" },
          ]
        },
        {
          text: "How competitive is the baseline compensation package?",
          options: [
            { label: "Below average — but we have 'family' vibes!", pts: 0, hint: "Red flag: compensation underfunded" },
            { label: "At standard market median", pts: 5, hint: "Standard baseline offer" },
            { label: "Slightly above market average", pts: 8, hint: "Attractive package" },
            { label: "Top-of-market base salary + equity + strong perks", pts: 10, hint: "Maximum recruitment appeal" },
          ]
        },
      ]
    }
  ]
};

function selectRole(role) {
  state.selectedRole = role;
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.role === role);
  });
  buildQuestions();
  AudioSynth.playSelect();
  showToast(`Switched path to ${role === 'fullstack' ? 'Full-Stack Developer' : role === 'devops' ? 'DevOps Engineer' : 'Product Manager'}`, 'info');
}

function getRecruiterFeedbackTags() {
  const tags = [];
  const { culture, worklife, tech, growth } = state.scores;
  if (culture >= 8) tags.push("Vibrant Culture Maker");
  if (worklife >= 8) tags.push("Offered Realistic Expectations");
  if (tech >= 8) tags.push("Deep Respect for Code Craft");
  if (growth >= 8) tags.push("Focused on Growth Potential");
  if (tags.length === 0) {
    tags.push("Standard Corporate Protocol");
  }
  return tags;
}

function updateRecruiterReaction(roundId, pts, optIdx) {
  const faceEl = document.getElementById(`reactionFace-${roundId}`);
  const speechEl = document.getElementById(`reactionSpeech-${roundId}`);
  if (!faceEl || !speechEl) return;

  let emoji = "👔";
  let speech = "Awaiting response...";

  if (pts >= 8) {
    emoji = "😍";
    const goodSpeeches = [
      "Now that is how you build a scalable workspace!",
      "An actual investment in developer growth. Excellent!",
      "I am weeping tears of joy. Truly developer-first!",
      "Peak engineering maturity. Highly respect this choice!"
    ];
    speech = goodSpeeches[Math.min(optIdx, goodSpeeches.length - 1)];
  } else if (pts >= 4) {
    emoji = "👔";
    const midSpeeches = [
      "Pretty standard industry protocol.",
      "Acceptable. Not outstanding, but it works.",
      "Standard corporate baseline. KPIs will be met.",
      "Vague but stable. No red flags here."
    ];
    speech = midSpeeches[Math.min(optIdx, midSpeeches.length - 1)];
  } else {
    emoji = "💀";
    const badSpeeches = [
      "Wait, seriously? That's a massive red flag...",
      "RIP employee retention. Burnout alert!",
      "Micromanagement and legacy tech? Absolute nightmare.",
      "No budget and no structure? That's going to hurt."
    ];
    speech = badSpeeches[Math.min(optIdx, badSpeeches.length - 1)];
  }

  faceEl.textContent = emoji;
  speechEl.textContent = speech;
}

// ─── STATE MANAGEMENT ────────────────────────────────────────────────────────
const state = {
  currentScreen: 0,
  selectedRole: 'fullstack',
  recruiterFeedback: [],
  scores: { culture: 0, worklife: 0, tech: 0, growth: 0 },
  answered: { 1: {}, 2: {}, 3: {}, 4: {} },
};


// ─── APPLICATION INITIALIZATION ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  buildQuestions();
  runTerminalSequence();
  initMatrixEffect();
  initOfferCalculator();
  
  // Setup tabs listener
  document.querySelectorAll(".about-tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      switchTab(e.target.dataset.tab);
    });
  });
});


// ─── RETRO TYPING INTERACTIVE TERMINAL ───────────────────────────────────────
const terminalOutput = [];
let terminalReady = false;

function runTerminalSequence() {
  const lines = [
    "$ ./${CFG.terminal.scriptName}",
    "> Initializing candidate evaluation protocol...",
    "> CANDIDATE: ${CFG.candidateName} | STATUS: Available",
    "> Type 'help' to see hidden easter eggs.",
  ];
  const els = ["tl1", "tl2", "tl3", "tl4"];
  let delay = 400;
  lines.forEach((text, i) => {
    setTimeout(() => {
      typeText(els[i], text, 30);
      terminalOutput.push(text);
    }, delay);
    delay += text.length * 30 + 200;
  });
  
  setTimeout(() => {
    const cur = document.getElementById("tCursor");
    if (cur) cur.style.display = "none";
    const inputRow = document.getElementById("terminalInputRow");
    if (inputRow) inputRow.style.display = "flex";
    terminalReady = true;
    const startBtn = document.getElementById("startBtn");
    if (startBtn) {
      startBtn.style.animation = "pulse 1.5s ease infinite";
    }
  }, delay + 200);
}

function typeText(elId, text, speed) {
  const el = document.getElementById(elId);
  if (!el) return;
  let i = 0;
  el.textContent = "";
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

// Terminal commands handler
function handleTerminalSubmit(event) {
  if (event.key !== "Enter") return;
  const inputEl = document.getElementById("terminalInput");
  if (!inputEl) return;
  
  const rawCmd = inputEl.value.trim();
  const cmd = rawCmd.toLowerCase();
  inputEl.value = "";
  
  if (!cmd) return;
  
  AudioSynth.playSelect();
  
  const body = document.querySelector(".terminal-body");
  
  // Create history line
  const historyLine = document.createElement("p");
  historyLine.className = "t-line";
  historyLine.innerHTML = `<span class="t-prompt">$</span> ${rawCmd}`;
  body.insertBefore(historyLine, document.getElementById("terminalInputRow"));
  
  let responseText = "";
  let respType = "info";
  
  switch(cmd) {
    case "help":
      responseText = "Available commands: 'about', 'skills', 'matrix', 'hack', 'unlock', 'clear', 'beep', 'konami', 'recruit_me'";
      break;
    case "about":
      responseText = "${CFG.candidateName}: ${CFG.candidateRole || 'Developer'}. Passionate about building reliable software and contributing to open source.";
      break;
    case "skills":
      responseText = "Primary: Node.js, Express, MongoDB, JS/TS, PostgreSQL, Docker, AWS, Prometheus, Grafana, GitHub Actions, DSA.";
      break;
    case "matrix":
      document.body.classList.toggle("matrix-active");
      const isActive = document.body.classList.contains("matrix-active");
      responseText = isActive ? "Matrix rain protocol: ENGAGED." : "Matrix rain protocol: SUSPENDED.";
      respType = isActive ? "success" : "warning";
      showToast(responseText, respType);
      break;
    case "hack":
      runFakeHack();
      return;
    case "unlock":
      responseText = "CHEAT DETECTED: Recruiter override protocol initialized. Bypassing assessment...";
      respType = "success";
      setTimeout(() => {
        unlockContact();
        showToast("Access Override Successful!", "success");
      }, 1500);
      break;
    case "konami":
      responseText = "CHEAT DETECTED: Match Potential rating boosted to Tech Utopia! 🦄";
      respType = "success";
      AudioSynth.playVictory();
      launchConfetti();
      document.querySelectorAll(".rating-pill").forEach(pill => {
        pill.textContent = "Match Potential: Tech Utopia 🦄 (CHEAT)";
        pill.style.background = "var(--green)";
      });
      break;
    case "recruit_me":
      responseText = "Arcade Mode Unlocked! Initiating 'Developer's Journey' runner game...";
      respType = "success";
      setTimeout(() => {
        openMiniGame();
      }, 1000);
      break;
    case "beep":
      AudioSynth.playBeep(Math.random() * 600 + 300, 'square', 0.25);
      responseText = "BEEP! Frequency modulated synth tested successfully.";
      break;
    case "clear":
      body.querySelectorAll(".t-line").forEach(el => {
        if (el.id !== "terminalInputRow") el.remove();
      });
      return;
    default:
      responseText = `Unknown instruction: '${rawCmd}'. Type 'help' for commands.`;
      respType = "warning";
  }
  
  const respEl = document.createElement("p");
  respEl.className = "t-line";
  respEl.style.color = respType === "warning" ? "#FF3F3F" : respType === "success" ? "#00E87E" : "#00FF41";
  respEl.textContent = responseText;
  body.insertBefore(respEl, document.getElementById("terminalInputRow"));
  
  body.scrollTop = body.scrollHeight;
}

// Live GitHub API Sync and Stream
async function runFakeHack() {
  const body = document.querySelector(".terminal-body");
  
  const writeLine = (text, color = "#00FF41") => {
    const p = document.createElement("p");
    p.className = "t-line";
    p.style.color = color;
    p.textContent = text;
    body.insertBefore(p, document.getElementById("terminalInputRow"));
    body.scrollTop = body.scrollHeight;
  };

  writeLine("CONNECTING TO API.GITHUB.COM...", "#FF3F3F");
  AudioSynth.playBeep(300, 'sawtooth', 0.08);
  
  try {
    const res = await fetch(`https://api.github.com/users/${CFG.terminal.githubUser}/repos`);
    if (!res.ok) throw new Error("GitHub offline or rate limit");
    const repos = await res.json();
    
    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5);
      
    writeLine("CONNECTION SECURED. STREAMING LIVE GITHUB REPOSITORIES...", "#FF9F43");
    AudioSynth.playBeep(400, 'sawtooth', 0.08);
    
    let delay = 300;
    topRepos.forEach((repo, idx) => {
      setTimeout(() => {
        writeLine(`[Repo Unlocked] ${repo.name} | Stars: ⭐${repo.stargazers_count} | Lang: ${repo.language || 'JS'}`, "#00FF41");
        AudioSynth.playBeep(500 + idx * 80, 'sine', 0.05);
      }, delay);
      delay += 350;
    });
    
    setTimeout(() => {
      writeLine("[Success] Real-time GitHub sync complete. Candidate's credentials verified.", "#00E87E");
      showToast("Sync with GitHub profile successful!", "success");
      unlockContact();
    }, delay + 200);

  } catch (err) {
    console.warn("GitHub API error, running offline backup hack:", err);
    let delay = 300;
    const hackLines = [
      "BYPASSING SECURITY CHECKS...",
      "RECRUITER CREDENTIALS REVEALED: [ADMINISTRATOR]",
      "DASMAT HANSDA OVERRIDE STATUS: GRANTED"
    ];
    hackLines.forEach((text, idx) => {
      setTimeout(() => {
        writeLine(`[!] ${text}`, "#FF3F3F");
        AudioSynth.playBeep(300 + idx * 80, 'sawtooth', 0.08);
      }, delay);
      delay += 300;
    });
    setTimeout(() => {
      showToast("Override unlocked via backup hack!", "success");
      unlockContact();
    }, delay + 200);
  }
}

// ─── RETRO RUNNER ARCADE MINI-GAME ──────────────────────────────────────────
let gameActive = false;
let gameLoopId = null;
let runnerHighScore = 0;

const game = {
  player: { x: 50, y: 170, vy: 0, width: 30, height: 30, isJumping: false },
  obstacles: [],
  score: 0,
  speed: 4,
  gravity: 0.6,
  jumpStrength: -10,
  groundY: 170,
  spawnTimer: 0,
};

function openMiniGame() {
  const modal = document.getElementById("gameModal");
  if (!modal) return;
  modal.style.display = "flex";
  restartMiniGame();
}

function closeMiniGame() {
  const modal = document.getElementById("gameModal");
  if (modal) modal.style.display = "none";
  gameActive = false;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
}

function restartMiniGame() {
  game.player.y = game.groundY;
  game.player.vy = 0;
  game.player.isJumping = false;
  game.obstacles = [];
  game.score = 0;
  game.speed = 4;
  game.spawnTimer = 0;
  gameActive = true;
  
  const restartBtn = document.getElementById("btnRestartGame");
  if (restartBtn) restartBtn.style.display = "none";
  
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  runnerGameLoop();
}

function runnerGameLoop() {
  if (!gameActive) return;
  updateRunnerGame();
  drawRunnerGame();
  gameLoopId = requestAnimationFrame(runnerGameLoop);
}

const OBSTACLE_TYPES = [
  { name: "BUG 🐛", color: "#FF3F3F" },
  { name: "MICROMANAGEMENT 👔", color: "#FF9F43" },
  { name: "LEGACY CODE 💀", color: "#8E44AD" },
  { name: "SCOPE CREEP 📉", color: "#3498DB" },
];

function updateRunnerGame() {
  game.score++;
  document.getElementById("runnerScore").textContent = game.score;
  if (game.score > runnerHighScore) {
    runnerHighScore = game.score;
    document.getElementById("runnerHighScore").textContent = runnerHighScore;
  }

  if (game.score % 500 === 0) {
    game.speed += 0.5;
  }

  game.player.vy += game.gravity;
  game.player.y += game.player.vy;

  if (game.player.y >= game.groundY) {
    game.player.y = game.groundY;
    game.player.vy = 0;
    game.player.isJumping = false;
  }

  game.spawnTimer++;
  if (game.spawnTimer > Math.max(60, 120 - game.speed * 5)) {
    game.spawnTimer = 0;
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    game.obstacles.push({
      x: 640,
      y: game.groundY + 10,
      width: 25 + Math.random() * 20,
      height: 20,
      text: type.name,
      color: type.color
    });
  }

  for (let i = game.obstacles.length - 1; i >= 0; i--) {
    const obs = game.obstacles[i];
    obs.x -= game.speed;

    const px = game.player.x;
    const py = game.player.y;
    const pw = game.player.width;
    const ph = game.player.height;

    if (px < obs.x + obs.width &&
        px + pw > obs.x &&
        py < obs.y + obs.height &&
        py + ph > obs.y) {
      gameOverRunner();
      return;
    }

    if (obs.x + obs.width < 0) {
      game.obstacles.splice(i, 1);
    }
  }
}

function gameOverRunner() {
  gameActive = false;
  AudioSynth.playBeep(150, "sawtooth", 0.5);
  showToast("Game Over! Try again.", "warning");
  const restartBtn = document.getElementById("btnRestartGame");
  if (restartBtn) restartBtn.style.display = "inline-block";
}

function drawRunnerGame() {
  const canvas = document.getElementById("runnerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  ctx.fillStyle = "#FFFEF0";
  ctx.fillRect(0, 0, 640, 240);

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, game.groundY + game.player.height);
  ctx.lineTo(640, game.groundY + game.player.height);
  ctx.stroke();

  ctx.fillStyle = "#F5E642";
  ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(game.player.x, game.player.y, game.player.width, game.player.height);
  
  ctx.fillStyle = "#000000";
  ctx.fillRect(game.player.x + 18, game.player.y + 6, 4, 4);
  ctx.beginPath();
  ctx.arc(game.player.x + 18, game.player.y + 18, 5, 0, Math.PI);
  ctx.stroke();

  game.obstacles.forEach(obs => {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.fillText(obs.text, obs.x, obs.y - 5);
  });
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameActive) {
      e.preventDefault();
      if (!game.player.isJumping) {
        game.player.vy = game.jumpStrength;
        game.player.isJumping = true;
        AudioSynth.playBeep(400, "sine", 0.08);
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const runnerCanvas = document.getElementById("runnerCanvas");
  if (runnerCanvas) {
    runnerCanvas.addEventListener("click", () => {
      if (gameActive && !game.player.isJumping) {
        game.player.vy = game.jumpStrength;
        game.player.isJumping = true;
        AudioSynth.playBeep(400, "sine", 0.08);
      }
    });
  }
});


// ─── MATRIX FALLING CODE BACKGROUND EFFECT ──────────────────────────────────
function initMatrixEffect() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  const columns = Math.floor(width / 20);
  const drops = Array(columns).fill(1);
  const chars = "0110101010111000110101010110010101101".split("");
  
  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "#00FF41";
    ctx.font = "14px monospace";
    
    drops.forEach((y, x) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, x * 20, y * 20);
      
      if (y * 20 > height && Math.random() > 0.975) {
        drops[x] = 0;
      }
      drops[x]++;
    });
  }
  
  setInterval(draw, 33);
}


// ─── ROUNDS AND QUESTIONS SYSTEM BUILDER ─────────────────────────────────────
function buildQuestions() {
  const currentRounds = QUESTIONS_BY_ROLE[state.selectedRole];
  
  // Clear any existing questions in DOM first
  for (let id = 1; id <= 4; id++) {
    const container = document.getElementById(`q-round${id}`);
    if (container) container.innerHTML = '';
  }
  
  currentRounds.forEach(round => {
    const container = document.getElementById(`q-round${round.id}`);
    if (!container) return;
    
    round.questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "q-card";
      card.innerHTML = `
        <div class="q-num">Q${qi + 1}</div>
        <div class="q-text">${q.text}</div>
        <div class="options-grid" id="opts-r${round.id}-q${qi}"></div>
      `;
      
      const grid = card.querySelector(".options-grid");
      q.options.forEach((opt, oi) => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.innerHTML = `
          <span>${opt.label}</span>
          <span class="opt-hint">${opt.hint}</span>
        `;
        
        // If already answered, make it show as selected
        const prevAnswer = state.answered[round.id][qi];
        if (prevAnswer !== undefined && prevAnswer === opt.pts) {
          btn.classList.add("selected");
        }
        
        btn.addEventListener("click", () => {
          selectOption(round.id, qi, oi, opt.pts, btn, grid);
        });
        grid.appendChild(btn);
      });
      container.appendChild(card);
    });
  });
}

function selectOption(roundId, qIdx, optIdx, pts, btn, grid) {
  grid.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  
  state.answered[roundId][qIdx] = pts;
  AudioSynth.playSelect();
  
  // Live Reaction Avatar updates!
  updateRecruiterReaction(roundId, pts, optIdx);
  
  // Calculate dynamic total score to update live recruiter rating badge
  updateRecruiterLiveRating();

  const round = QUESTIONS_BY_ROLE[state.selectedRole].find(r => r.id === roundId);
  const allAnswered = Object.keys(state.answered[roundId]).length === round.questions.length;
  const nextBtn = document.getElementById(`btn-r${roundId}`);
  if (nextBtn && allAnswered) {
    nextBtn.disabled = false;
    nextBtn.style.animation = "pulse 1.5s ease infinite";
  }
}

// Real-time rating calculations
function updateRecruiterLiveRating() {
  let tempTotal = 0;
  let count = 0;
  for (let r = 1; r <= 4; r++) {
    Object.values(state.answered[r]).forEach(pts => {
      tempTotal += pts;
      count++;
    });
  }
  
  // Map score to description
  let badgeText = "Evaluating... 📋";
  let color = "var(--gray)";
  
  if (count > 0) {
    if (tempTotal <= 15) {
      badgeText = "Sweatshop 💀";
      color = "var(--red)";
    } else if (tempTotal <= 30) {
      badgeText = "Average Corp 👔";
      color = "var(--orange)";
    } else if (tempTotal <= 55) {
      badgeText = "Growth Hub 🚀";
      color = "var(--blue)";
    } else {
      badgeText = "Tech Utopia 🦄";
      color = "var(--green)";
    }
  }
  
  document.querySelectorAll(".rating-pill").forEach(pill => {
    pill.textContent = `Match Potential: ${badgeText}`;
    pill.style.background = color;
  });
}


// ─── PAGE & ROUTING STATE MACHINE ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  
  const target = typeof id === "number"
    ? document.getElementById(`screen-${id}`)
    : document.getElementById(id);
    
  if (target) {
    target.style.display = "flex";
    requestAnimationFrame(() => target.classList.add("active"));
    window.scrollTo(0, 0);
  }
  
  state.currentScreen = id;
  
  // Update nav labels & progress bar
  updateNavLabel(id);
  updateProgressBar(id);
  
  // Trigger animations for skill bars when viewing portfolio
  if (id === "screen-portfolio") {
    setTimeout(animateSkillBars, 150);
  }
  
  // Handle leaderboard loading
  if (id === "screen-leaderboard" || id === "leaderboard") {
    loadLeaderboard();
  }
}

function updateNavLabel(id) {
  const el = document.getElementById("navRoundLabel");
  if (!el) return;
  const labels = {
    0: "", 1: "Round 01/04", 2: "Round 02/04",
    3: "Round 03/04", 4: "Round 04/04",
    5: "Results", 6: "Contact Unlocked", "screen-portfolio": "Portfolio"
  };
  el.textContent = labels[id] || "";
}

function updateProgressBar(id) {
  const progressFill = document.getElementById("progressFill");
  if (!progressFill) return;
  
  const steps = { 0: 0, 1: 25, 2: 50, 3: 75, 4: 100, 5: 100, 6: 100, "screen-portfolio": 100 };
  const percentage = steps[id] !== undefined ? steps[id] : 0;
  progressFill.style.width = percentage + "%";
}

function startChallenge() {
  AudioSynth.playRoundSuccess();
  showScreen(1);
  showToast("Evaluation started. Answer honestly!", "info");
}

function nextRound(currentRound) {
  const round = QUESTIONS_BY_ROLE[state.selectedRole].find(r => r.id === currentRound);
  let roundTotal = 0;
  Object.values(state.answered[currentRound]).forEach(pts => roundTotal += pts);
  
  const maxPts = round.questions.length * 10;
  const normalized = Math.round((roundTotal / maxPts) * 10);
  state.scores[round.key] = normalized;
  
  AudioSynth.playRoundSuccess();
  showScreen(currentRound + 1);
  showToast(`Round ${currentRound} Complete!`, "success");
}

function goToResume() {
  // Redirect to the portfolio which serves as the resume view.
  goToPortfolio();
}

function goToPortfolio() {
  AudioSynth.playToggle();
  showScreen("screen-portfolio");
  showToast("Switched to portfolio mode.", "info");
}


// ─── ASSESSMENT RESULTS CALCULATOR ───────────────────────────────────────────
function showResults() {
  const round4 = QUESTIONS_BY_ROLE[state.selectedRole].find(r => r.id === 4);
  let r4total = 0;
  Object.values(state.answered[4]).forEach(pts => r4total += pts);
  const r4max = round4.questions.length * 10;
  state.scores.growth = Math.round((r4total / r4max) * 10);
  
  // Calculate feedback tags
  state.recruiterFeedback = getRecruiterFeedbackTags();
  
  // Display rating back
  const ratingBackCard = document.getElementById("ratingBackCard");
  const ratingBackList = document.getElementById("ratingBackList");
  if (ratingBackCard && ratingBackList) {
    ratingBackList.innerHTML = "";
    state.recruiterFeedback.forEach(tag => {
      const item = document.createElement("div");
      item.className = "rating-back-item";
      item.innerHTML = `
        <span>${tag}</span>
        <span class="stars">⭐⭐⭐⭐⭐</span>
      `;
      ratingBackList.appendChild(item);
    });
    ratingBackCard.style.display = "block";
  }

  // Display and generate LinkedIn Badge preview
  const badgeDownloadCard = document.getElementById("badgeDownloadCard");
  if (badgeDownloadCard) {
    badgeDownloadCard.style.display = "block";
    setTimeout(() => {
      generateLinkedInBadgeCanvas();
    }, 100);
  }
  
  showScreen(5);
  setTimeout(() => animateResults(), 300);
}

function generateLinkedInBadgeCanvas() {
  const canvas = document.getElementById("badgeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  const nameEl = document.getElementById("recruiterNameInput");
  const recruiterName = (nameEl ? nameEl.value.trim() : "") || "Top Recruiter";
  
  const { culture, worklife, tech, growth } = state.scores;
  const total = culture + worklife + tech + growth;
  
  // Map score to description
  let verdict = "Tech Utopia 🦄";
  let verdictColor = "#00E87E"; // green
  if (total <= 15) {
    verdict = "Sweatshop 💀";
    verdictColor = "#FF3F3F"; // red
  } else if (total <= 30) {
    verdict = "Average Corp 👔";
    verdictColor = "#FF9F43"; // orange
  } else if (total <= 55) {
    verdict = "Growth Hub 🚀";
    verdictColor = "#54A0FF"; // blue
  }

  // 1. Draw Background
  ctx.fillStyle = "#FFFEF0";
  ctx.fillRect(0, 0, 600, 315);
  
  // 2. Draw outer border
  ctx.strokeStyle = "#0D0D0D";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 594, 309);
  
  // 3. Draw a nice Neobrutalist top bar
  ctx.fillStyle = "#F5E642"; // yellow
  ctx.fillRect(3, 3, 594, 50);
  ctx.strokeRect(3, 3, 594, 50);
  
  // Title text
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "800 18px 'Space Grotesk', sans-serif";
  ctx.fillText("RECRUITER QUALIFICATION CERTIFICATE", 20, 34);
  
  // 4. Draw Score badge (top right)
  ctx.fillStyle = "#D6A2E8"; // purple
  ctx.fillRect(450, 15, 130, 26);
  ctx.strokeRect(450, 15, 130, 26);
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "bold 12px 'JetBrains Mono', monospace";
  ctx.fillText(`SCORE: ${total}/40`, 465, 32);

  // 5. Draw Recruiter name
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "bold 14px 'JetBrains Mono', monospace";
  ctx.fillText("THIS CERTIFIES THAT:", 30, 95);
  
  ctx.font = "900 28px 'Space Grotesk', sans-serif";
  ctx.fillText(recruiterName.toUpperCase(), 30, 135);
  
  // Draw an underline for the name
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 145);
  ctx.lineTo(570, 145);
  ctx.stroke();
  
  // 6. Draw Compatibility verdict
  ctx.font = "bold 14px 'JetBrains Mono', monospace";
  ctx.fillText("PASSED ASSESSMENT PATH FOR:", 30, 185);
  
  const roleName = state.selectedRole === 'fullstack' ? 'FULL-STACK DEVELOPER' : state.selectedRole === 'devops' ? 'DEVOPS ENGINEER' : 'PRODUCT MANAGER';
  ctx.fillStyle = "#00D2D3"; // cyan
  ctx.fillRect(30, 195, 260, 32);
  ctx.strokeRect(30, 195, 260, 32);
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "900 14px 'Space Grotesk', sans-serif";
  ctx.fillText(roleName, 45, 216);

  // Verdict Badge
  ctx.fillStyle = verdictColor;
  ctx.fillRect(310, 195, 260, 32);
  ctx.strokeRect(310, 195, 260, 32);
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "900 14px 'Space Grotesk', sans-serif";
  ctx.fillText(`MATCH: ${verdict.toUpperCase()}`, 325, 216);

  // 7. Footer credits
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "bold 11px 'JetBrains Mono', monospace";
  ctx.fillText("Candidate: ${CFG.candidateName}", 30, 275);
  ctx.fillText("recruit-me-if-you-can.vercel.app", 30, 292);

  // Decorative stamp
  ctx.fillStyle = "#FF9F43"; // orange
  ctx.beginPath();
  ctx.arc(520, 265, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = "#0D0D0D";
  ctx.font = "900 10px 'Space Grotesk', sans-serif";
  ctx.fillText("VERIFIED", 498, 273);
}

function downloadBadgeImage() {
  const canvas = document.getElementById("badgeCanvas");
  if (!canvas) return;
  
  const link = document.createElement("a");
  link.download = `Recruiter_Badge_${state.selectedRole}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("Badge downloaded! Share it on LinkedIn.", "success");
}

function shareOnLinkedIn() {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
  window.open(url, "_blank");
}

function animateResults() {
  const { culture, worklife, tech, growth } = state.scores;
  const total = culture + worklife + tech + growth;
  
  const bars = [
    { bar: "bar-culture",  num: "num-culture",  val: culture },
    { bar: "bar-worklife", num: "num-worklife", val: worklife },
    { bar: "bar-tech",     num: "num-tech",     val: tech },
    { bar: "bar-growth",   num: "num-growth",   val: growth },
  ];
  
  bars.forEach(({ bar, num, val }, i) => {
    setTimeout(() => {
      const barEl = document.getElementById(bar);
      const numEl = document.getElementById(num);
      if (barEl) barEl.style.width = (val / 10 * 100) + "%";
      if (numEl) animateCounter(numEl, val, 10);
    }, i * 250);
  });
  
  setTimeout(() => {
    const totalEl = document.getElementById("totalNum");
    if (totalEl) animateCounter(totalEl, total, 40, true);
    
    const titleEl = document.getElementById("resultsTitle");
    const chipEl = document.getElementById("verdictChip");
    const msgEl = document.getElementById("verdictMsg");
    
    if (total >= 32) {
      AudioSynth.playVictory();
      launchConfetti();
      if (titleEl) titleEl.textContent = "Congratulations. You Qualify.";
      if (chipEl) { chipEl.textContent = "✓ QUALIFIED"; chipEl.className = "verdict-chip qualified"; }
      if (msgEl) msgEl.textContent = "Outstanding score! Your company demonstrated solid engineering practices, high developer trust, and realistic support benchmarks. Contact pathways are now unlocked.";
    } else if (total >= 22) {
      AudioSynth.playBeep(440, 'triangle', 0.25);
      if (titleEl) titleEl.textContent = "You're Close. Match is Partial.";
      if (chipEl) { chipEl.textContent = "⚠ PARTIAL MATCH"; chipEl.className = "verdict-chip partial"; }
      if (msgEl) msgEl.textContent = "Your company shows good structure, but fails a few critical tests in developer tooling autonomy or work stress balances. You can still reach out.";
    } else {
      AudioSynth.playFailure();
      if (titleEl) titleEl.textContent = "Evaluation Failed.";
      if (chipEl) { chipEl.textContent = "✗ NEEDS WORK"; chipEl.className = "verdict-chip failed"; }
      if (msgEl) msgEl.textContent = "The scores indicating micro-management or lower tech investments make it unlikely to align. You are welcome to study the portfolio to see candidate standards.";
    }
    // Reveal PDF and Share Link buttons after results are displayed
    const pdfBtn = document.getElementById("pdfBtn");
    if (pdfBtn) pdfBtn.style.display = "inline-block";
    const shareBtn = document.getElementById("shareLinkBtn");
    if (shareBtn) shareBtn.style.display = "inline-block";
  }, bars.length * 250 + 400);
}

function animateCounter(el, target, maxVal, isTotal = false) {
  let current = 0;
  if (target === 0) {
    el.textContent = isTotal ? "0 / 40" : `0/${maxVal}`;
    return;
  }
  const step = Math.ceil(target / 15);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = isTotal ? `${current} / 40` : `${current}/${maxVal}`;
    if (current >= target) clearInterval(interval);
  }, 40);
}


// ─── CONTACT PANEL ACCESS ────────────────────────────────────────────────────
function unlockContact() {
  showScreen(6);
  launchConfetti();
  
  const cards = document.querySelectorAll(".contact-card");
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add("reveal");
      AudioSynth.playBeep(400 + i * 150, 'sine', 0.1);
    }, 300 + i * 200);
  });
}


// ─── INTERACTIVE PORTFOLIO SKILL BARS ────────────────────────────────────────
function animateSkillBars() {
  document.querySelectorAll(".skill-bar-fill").forEach(fill => {
    const val = fill.dataset.level || 0;
    fill.style.width = val + "%";
  });
}


// ─── PORTFOLIO TAB NAVIGATION ────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll(".about-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".about-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `about-pane-${tabId}`);
  });
  AudioSynth.playSelect();
}


// ─── INTERACTIVE JOB OFFER CALCULATOR ────────────────────────────────────────
const targetOffer = {
  salary: 15, // LPA or base level equivalent
  remote: 3, // Days Remote
  learning: 1000 // Annual Learning Budget
};

function initOfferCalculator() {
  const sliders = ['calcSalary', 'calcRemote', 'calcLearning'];
  sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", recalculateOfferAttraction);
    }
  });
  recalculateOfferAttraction();
}

function recalculateOfferAttraction() {
  const salary = parseFloat(document.getElementById("calcSalary").value);
  const remote = parseInt(document.getElementById("calcRemote").value);
  const learning = parseInt(document.getElementById("calcLearning").value);
  
  // Render live values
  document.getElementById("valSalary").textContent = `${salary} LPA`;
  document.getElementById("valRemote").textContent = remote === 5 ? "Fully Remote" : `${remote} Days`;
  document.getElementById("valLearning").textContent = `₹${(learning/1000).toFixed(0)}K / $${learning}`;

  // Attraction Algorithm: weighted values
  let score = 0;
  
  // Salary: up to 40 pts
  if (salary >= 20) score += 40;
  else if (salary >= 15) score += 32;
  else if (salary >= 10) score += 20;
  else score += (salary / 10) * 15;
  
  // Remote: up to 30 pts
  if (remote >= 4) score += 30;
  else if (remote === 3) score += 25;
  else if (remote === 2) score += 18;
  else if (remote === 1) score += 8;
  else score += 2;
  
  // Learning budget: up to 30 pts
  if (learning >= 1500) score += 30;
  else if (learning >= 1000) score += 25;
  else if (learning >= 500) score += 18;
  else score += (learning / 500) * 10;
  
  const finalScore = Math.min(Math.round(score), 100);
  
  // Render score
  const scoreNumEl = document.getElementById("calcScoreNum");
  const verdictEl = document.getElementById("calcScoreVerdict");
  
  if (scoreNumEl) scoreNumEl.textContent = `${finalScore}%`;
  
  let verdict = "Low Match";
  let bg = "var(--red)";
  
  if (finalScore >= 85) {
    verdict = "Instant Reply! 🚀";
    bg = "var(--green)";
  } else if (finalScore >= 60) {
    verdict = "Strong Interest 🤝";
    bg = "var(--yellow)";
  } else {
    verdict = "Standard Review 📋";
    bg = "var(--orange)";
  }
  
  if (verdictEl) {
    verdictEl.textContent = verdict;
    verdictEl.style.background = bg;
  }
  
  // Save dynamic templates details
  window.calculatedOffer = { salary, remote, learning, finalScore, verdict };
}

function generatePDFReport() {
  if (typeof window.jspdf === 'undefined') {
    showToast('PDF library not loaded.', 'warning');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ margin: 15 });
  doc.setFontSize(22);
  doc.text('Recruiter Compatibility Report', 105, 20, { align: 'center' });
  doc.setFontSize(13);
  doc.text(`Overall match: ${state.scores.culture + state.scores.worklife + state.scores.tech + state.scores.growth} / 40`, 20, 35);
  doc.text(`Company Culture: ${state.scores.culture} / 10`, 20, 45);
  doc.text(`Work-Life Balance: ${state.scores.worklife} / 10`, 20, 55);
  doc.text(`Technical Environment: ${state.scores.tech} / 10`, 20, 65);
  doc.text(`Growth & Compensation: ${state.scores.growth} / 10`, 20, 75);
  doc.text(`Offer Attraction Index: ${window.calculatedOffer?.finalScore ?? 'N/A'}%`, 20, 85);
  doc.text(`Verdict: ${document.getElementById('verdictChip')?.textContent ?? ''}`, 20, 95);
  doc.save('recruiter-report.pdf');
  showToast('PDF report downloaded.', 'success');
}

document.getElementById('pdfBtn').addEventListener('click', generatePDFReport);


// ─── PITCH EMAIL COPY ────────────────────────────────────────────────────────
function copyPitchEmail() {
  const offer = window.calculatedOffer;
  if (!offer) return;

  const text = `Hi Candidate,\n\nI just evaluated our company on this portfolio and we scored an offer attraction index of ${offer.finalScore}% (${offer.verdict}).\n\nHere are some of the benchmarks we support:\n- Salary Package: ${offer.salary} LPA\n- Hybrid/Remote Split: ${offer.remote} Days Remote\n- Dedicated Tech Training budget: ₹${(offer.learning/1000).toFixed(0)}K annually\n\nWe would love to discuss this opening with you further.\n\nBest regards,\n[My Name]\n[My Company]`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Pitch Email template copied to clipboard!", "success");
  }).catch(() => {
    showToast("Failed to copy automatically", "warning");
  });
}


// ─── CONFETTI SIMULATION ENGINE ──────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 12 + 6,
    h: Math.random() * 6 + 4,
    color: ["#F5E642","#FF3F3F","#00E87E","#D6A2E8","#00D2D3","#54A0FF"][Math.floor(Math.random()*6)],
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 6,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 3,
  }));
  
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
    });
    
    frame++;
    if (frame < 200) requestAnimationFrame(draw);
    else canvas.style.display = "none";
  }
  draw();
}


const API_BASE = 'http://localhost:3001';

// ─── SHAREABLE LINK — Backend API (cross-device) ──────────────────────────────
async function generateShareableLink() {
  try {
    const nameEl = document.getElementById('recruiterNameInput');
    const nameVal = nameEl ? nameEl.value.trim() : 'Anonymous';

    const res = await fetch(`${API_BASE}/api/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores: { ...state.scores },
        offerIndex: window.calculatedOffer?.finalScore ?? null,
        name: nameVal || 'Anonymous',
        role: state.selectedRole,
        recruiterFeedback: state.recruiterFeedback || [],
      }),
    });

    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const { slug } = await res.json();
    return `${window.location.origin}${window.location.pathname}?result=${slug}`;


  } catch (err) {
    // Graceful fallback to localStorage if server is unreachable
    console.warn('[Sharing] Backend unreachable, falling back to localStorage:', err.message);
    const slug = crypto.randomUUID().split('-')[0];
    localStorage.setItem(`recruit-me-${slug}`, JSON.stringify({
      scores: state.scores,
      role: state.selectedRole,
      recruiterFeedback: state.recruiterFeedback || []
    }));
    showToast('Server offline — link works on this device only.', 'warning');
    return `${window.location.origin}${window.location.pathname}?result=local_${slug}`;
  }
}

async function copyShareableLink() {
  const container = document.getElementById('shareLinkContainer');
  const input = document.getElementById('shareLinkInput');

  showToast('Generating link...', 'info');
  const url = await generateShareableLink();

  if (input) {
    input.value = url;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Shareable link copied to clipboard!', 'success');
    } catch {
      input.select();
      document.execCommand('copy');
      showToast('Shareable link copied!', 'success');
    }
  }
  if (container) container.style.display = 'block';
}

document.getElementById('shareLinkBtn').addEventListener('click', copyShareableLink);


// ─── SHARED RESULT LOADER — Backend API ──────────────────────────────────────
async function loadSharedResult() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('result');
  if (!slug) return;

  try {
    // Local fallback slug
    if (slug.startsWith('local_')) {
      const localKey = `recruit-me-${slug.slice(6)}`;
      const raw = localStorage.getItem(localKey);
      if (!raw) { showToast('Shared result not found.', 'warning'); return; }
      const data = JSON.parse(raw);
      state.scores = { ...data.scores };
      if (data.role) {
        state.selectedRole = data.role;
        document.querySelectorAll(".role-btn").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.role === data.role);
        });
        buildQuestions();
      }
      showScreen(5);
      setTimeout(() => animateResults(), 200);
      return;
    }

    // Backend fetch
    const res = await fetch(`${API_BASE}/api/results/${slug}`);
    if (res.status === 404) {
      showToast('This result link has expired or does not exist.', 'warning');
      return;
    }
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    state.scores = { ...data.scores };
    if (data.role) {
      state.selectedRole = data.role;
      document.querySelectorAll(".role-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.role === data.role);
      });
      buildQuestions();
    }
    showScreen(5);
    setTimeout(() => animateResults(), 200);

  } catch (err) {
    console.error('[loadSharedResult]', err);
    showToast('Could not load shared result.', 'error');
  }
}


// ─── LIVE RECRUITER COUNTER ───────────────────────────────────────────────────
async function loadRecruiterCounter() {
  const el = document.getElementById('recruiterCount');
  if (!el) return;
  try {
    const res = await fetch(`${API_BASE}/api/results/counter`);
    if (!res.ok) return;
    const { count } = await res.json();
    // Animate count-up
    let current = 0;
    const step = Math.ceil(count / 30);
    const timer = setInterval(() => {
      current = Math.min(current + step, count);
      el.textContent = current;
      if (current >= count) clearInterval(timer);
    }, 40);
  } catch {
    // silently fail — counter is non-critical
  }
}

// ─── LEADERBOARD LOADER ──────────────────────────────────────────────────────
async function loadLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;
  container.innerHTML = '<p style="opacity:0.5; font-family:\'JetBrains Mono\', monospace;">Loading leaderboard…</p>';
  try {
    const res = await fetch(`${API_BASE}/api/results/leaderboard`);
    if (!res.ok) throw new Error('API failed');
    const { leaderboard } = await res.json();
    if (!leaderboard || leaderboard.length === 0) {
      container.innerHTML = '<p style="opacity:0.5; padding: 1rem; border: 3px solid var(--black); background: var(--white); box-shadow: 4px 4px 0 var(--black); font-family:\'JetBrains Mono\', monospace;">No entries yet. Be the first to qualify!</p>';
      return;
    }
    
    let html = `
      <div class="brutal-table-wrapper" style="overflow-x:auto;">
        <table class="brutal-table" style="width:100%; border-collapse:collapse; border:3px solid var(--black); background:var(--white); box-shadow:6px 6px 0 var(--black); font-family:\'JetBrains Mono\', monospace; color:var(--black);">
          <thead>
            <tr style="border-bottom:3px solid var(--black); background:var(--yellow); text-align:left;">
              <th style="padding:0.75rem; border-right:3px solid var(--black);">Rank</th>
              <th style="padding:0.75rem; border-right:3px solid var(--black);">Company / Recruiter</th>
              <th style="padding:0.75rem; border-right:3px solid var(--black);">Role</th>
              <th style="padding:0.75rem; border-right:3px solid var(--black);">Offer Index</th>
              <th style="padding:0.75rem; border-right:3px solid var(--black);">Score</th>
              <th style="padding:0.75rem;">Insights</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    leaderboard.forEach((entry, idx) => {
      const rank = idx + 1;
      const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const name = entry.name ? entry.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Anonymous';
      const offer = entry.offerIndex !== null ? `${entry.offerIndex}%` : 'N/A';
      const score = `${entry.total} / 40`;
      const roleName = entry.role === 'fullstack' ? '💻 Full-Stack' : entry.role === 'devops' ? '🚀 DevOps' : entry.role === 'pm' ? '👔 Product' : '💻 Full-Stack';
      const feedbackStr = entry.recruiterFeedback && entry.recruiterFeedback.length > 0 
        ? entry.recruiterFeedback.map(tag => `<span style="font-size: 0.7rem; background: var(--purple); border: 1px solid var(--black); padding: 0.1rem 0.4rem; margin-right: 0.2rem; display: inline-block;">${tag}</span>`).join('') 
        : '<span style="font-size: 0.7rem; color: #888;">Standard</span>';
      
      html += `
        <tr style="border-bottom:${idx === leaderboard.length - 1 ? '0' : '3px solid var(--black)'};">
          <td style="padding:0.75rem; border-right:3px solid var(--black); font-weight:bold;">${rankEmoji}</td>
          <td style="padding:0.75rem; border-right:3px solid var(--black);">${name}</td>
          <td style="padding:0.75rem; border-right:3px solid var(--black);">${roleName}</td>
          <td style="padding:0.75rem; border-right:3px solid var(--black); font-weight:bold;">${offer}</td>
          <td style="padding:0.75rem; border-right:3px solid var(--black); font-weight:bold;">${score}</td>
          <td style="padding:0.75rem;">${feedbackStr}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="color:var(--red); font-weight:bold; padding:1rem; border:3px solid var(--black); background:var(--white); box-shadow:4px 4px 0 var(--black); font-family:\'JetBrains Mono\', monospace;">Failed to load leaderboard. Server might be offline.</p>';
  }
}


// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────
const SHORTCUTS = [
  { key: '?',   description: 'Toggle this shortcuts panel' },
  { key: 'Esc', description: 'Close shortcuts panel / go back' },
  { key: 'p',   description: 'View Portfolio' },
  { key: 'r',   description: 'Restart assessment (from landing)' },
  { key: '1–4', description: 'Jump to Round 1–4 (assessment active)' },
  { key: 'm',   description: 'Toggle sound mute' },
  { key: 'd',   description: 'Toggle Dark / Light mode' },
];

function buildShortcutsPanel() {
  const existing = document.getElementById('shortcuts-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'shortcuts-panel';
  panel.innerHTML = `
    <div class="shortcuts-inner">
      <div class="shortcuts-header">
        <span class="shortcuts-title">⌨️ Keyboard Shortcuts</span>
        <button class="shortcuts-close" onclick="buildShortcutsPanel()">✕</button>
      </div>
      <table class="shortcuts-table">
        ${SHORTCUTS.map(s => `
          <tr>
            <td><kbd>${s.key}</kbd></td>
            <td>${s.description}</td>
          </tr>`).join('')}
      </table>
    </div>
  `;
  document.body.appendChild(panel);
}

document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  // Don't intercept when typing in inputs
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  switch (e.key) {
    case '?':
      buildShortcutsPanel();
      break;
    case 'Escape': {
      const panel = document.getElementById('shortcuts-panel');
      if (panel) panel.remove();
      break;
    }
    case 'p':
      goToPortfolio();
      break;
    case 'r':
      showScreen(0);
      break;
    case 'm':
      toggleMute();
      break;
    case 'd':
      toggleDarkMode();
      break;
    case '1': case '2': case '3': case '4': {
      const round = parseInt(e.key);
      if (round >= 1 && round <= 4) showScreen(round);
      break;
    }
  }
});


// ─── DARK / LIGHT MODE ───────────────────────────────────────────────────────
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') !== 'light';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('recruit-me-theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('darkModeBtn');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  showToast(`Switched to ${isDark ? 'light' : 'dark'} mode`, 'info');
}

// Load saved theme preference
(function initTheme() {
  const saved = localStorage.getItem('recruit-me-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('darkModeBtn');
  if (btn) btn.textContent = saved === 'dark' ? '🌙' : '☀️';
})();


// ─── SCROLL PROGRESS BAR ─────────────────────────────────────────────────────
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, { passive: true });
})();


// ─── ADD PULSE ANIMATION ─────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0%,100% { transform: translate(0,0); box-shadow: 5px 5px 0 #0D0D0D; }
    50% { transform: translate(-3px,-3px); box-shadow: 8px 8px 0 #0D0D0D; }
  }
`;
document.head.appendChild(style);


// ─── BOOT ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadSharedResult();
  loadRecruiterCounter();
});
