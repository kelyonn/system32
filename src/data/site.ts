// Single source of truth. Edit content here; no component changes needed.
// Copy rules: no em dashes, no buzzwords, never claim skills not actually shown.
// Facts below come from the public READMEs at github.com/kelyonn. Draft copy: edit freely.

export type ProjectStatus = "shipped" | "in-progress";

export type Project = {
  id: string;
  name: string;
  /** One line (terse), shown in lists. */
  summary: string;
  /** Why it exists (warm, first person). */
  why: string;
  /** What it is (terse spec). */
  detail: string;
  status: ProjectStatus;
  stack: string[];
  /** Optional context line, e.g. where it was built. */
  context?: string;
  /** Public repo, if there is one. */
  repo?: string;
  /** Featured projects are listed first. */
  featured?: boolean;
  /** A recorded demo in public/demos. `note` says honestly what the recording shows. */
  demo?: { src: string; poster: string; note?: string };
};

export type DeskObject = {
  id: string;
  label: string;
  /** Shown on the small card when the OS is not booted yet. */
  blurb: string;
  /** Window id the object opens. */
  opens: string;
  /** Show the document itself on the desk card, so a click gives the answer without booting. */
  inline?: boolean;
};

export type Block =
  | { p: string }
  | { h: string }
  | { li: string[] }
  | { links: { label: string; href: string }[] };

export type Doc = {
  id: string;
  /** Window title and desktop icon label. */
  title: string;
  /** Name shown in the terminal. */
  filename: string;
  blocks: Block[];
};

export type TerminalCommand = {
  name: string;
  usage: string;
  description: string;
};

const gh = (name: string) => `https://github.com/kelyonn/${name}`;

export const site = {
  osName: "system32",
  person: {
    name: "Sri Kalyan Ippili",
    handle: "kelyonn",
    role: "CS student at PES University, Bengaluru · graduating 2027",
    tagline: "At the intersection of tech and product.",
    status: "Open to internships and jobs in tech, product and strategy.",
    email: "kalyan15122005@gmail.com",
  },
  links: [
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/srikalyanippili",
      display: "linkedin.com/in/srikalyanippili",
    },
    { label: "GitHub", href: "https://github.com/kelyonn", display: "github.com/kelyonn" },
    { label: "Instagram", href: "https://instagram.com/kalyan.1729", display: "instagram.com/kalyan.1729" },
  ],

  projects: [
    {
      id: "airlock",
      demo: { src: "/demos/airlock.mp4", poster: "/demos/airlock.jpg", note: "Real runs of the binary in Docker Desktop: pull, PID 1, namespaces, cgroups and a port-forwarded nginx." },
      name: "Airlock",
      summary: "A container runtime written from scratch in Go.",
      why: "Everyone says a container is just a process. I wanted to prove it by building one by hand.",
      detail:
        "Namespaces, pivot_root, cgroups v2, a hand-assembled BPF seccomp filter and a native OCI registry client, in Go. Not a Docker replacement: it is what sits underneath one. MIT licensed, CI on every push.",
      status: "shipped",
      stack: ["Go", "namespaces", "cgroups v2", "seccomp", "OCI"],
      repo: gh("airlock"),
      featured: true,
    },
    {
      id: "nexus",
      demo: { src: "/demos/nexus.mp4", poster: "/demos/nexus.jpg", note: "Real runs on a fresh Minikube cluster: one config file, deploy, status, logs, a chaos test and the local dashboard. Waits are sped up." },
      name: "Nexus",
      summary: "One config file, one command, a real Kubernetes cluster.",
      why: "I wanted an app running on real Kubernetes without first becoming a Kubernetes expert. It is for the developer who wants to ship, not run a cluster.",
      detail:
        "Fill in nexus.yaml, run nexus deploy. It generates the manifests and wires up ArgoCD, Prometheus, Grafana and optional Chaos Mesh. The tools underneath stay standard and inspectable. 607 tests, 99% coverage on the core. Install with pip install nexus-gitops.",
      status: "shipped",
      stack: ["Python", "Kubernetes", "ArgoCD", "Prometheus", "Grafana", "Chaos Mesh"],
      repo: gh("nexus"),
      featured: true,
    },
    {
      id: "flux",
      demo: { src: "/demos/flux.mp4", poster: "/demos/flux.jpg", note: "Real conversions, a warning, a refusal and flux doctor, from the actual binary." },
      name: "Flux",
      summary: "One command that picks the right engine to convert any file.",
      why: "No single tool converts everything well. I wanted one command that picks the right one for me.",
      detail:
        "Pandoc for documents, ImageMagick for images, FFmpeg for audio and video, a native Go engine for CSV, JSON, YAML and TOML, and Python adapters for high-fidelity PDF and DOCX. Smart route planning, batch mode, and a public package at pkg/flux.",
      status: "shipped",
      stack: ["Go", "Pandoc", "FFmpeg", "ImageMagick"],
      repo: gh("flux"),
      featured: true,
    },
    {
      id: "hue",
      demo: { src: "/demos/hue.mp4", poster: "/demos/hue.jpg", note: "A recorded run of the real colour field following an original track through four key changes, with a live key and mood readout." },
      name: "Hue",
      summary: "Paints whatever your Mac is playing as a live colour field.",
      why: "Some people see colour when they hear music. I wanted to see what that looks like.",
      detail:
        "Listens to system audio and renders a fluid field on the GPU, on-device. The mapping follows chromesthesia research: pitch drives lightness, emotion drives hue, energy drives saturation, in the OkLCh colour space.",
      status: "shipped",
      stack: ["Swift", "macOS", "GPU"],
      repo: gh("hue"),
      featured: true,
    },
    {
      id: "shuttr",
      demo: { src: "/demos/shuttr.mp4", poster: "/demos/shuttr.jpg", note: "A work-in-progress cut: the look so far, run through the real renderer. Tuning against real photos comes next." },
      name: "Shuttr",
      summary: "Makes your phone shoot like a 2000s digicam.",
      why: "The digicam you never had, in your pocket. Harsh flash, grain and the orange date stamp, on purpose.",
      detail:
        "Android-first Flutter app with CCD colour, flash, grain and a date stamp. Camcorder looks (VHS, MiniDV, Super 8, flip cam) are planned for v2. No ads, one-time unlock.",
      status: "in-progress",
      stack: ["Flutter", "Dart"],
      repo: gh("shuttr"),
      featured: true,
    },
    {
      id: "scout",
      demo: { src: "/demos/scout.mp4", poster: "/demos/scout.jpg", note: "The real dashboard and a 180-second live run. A status board says what worked, what is built but not exercised, and what is planned." },
      name: "Scout",
      summary: "Finds internships and new-grad roles within minutes of posting.",
      why: "I got tired of checking for roles by hand and missing the good ones by a day. I am the first user, so every choice answers to a real job search.",
      detail:
        "Watches the places roles get announced, turns each posting into one clean record, ranks it against a profile and notifies within minutes. Not a job board: it does not wait to be searched. Still being built.",
      status: "in-progress",
      stack: ["Go"],
      repo: gh("scout"),
      featured: true,
    },
    {
      id: "echo",
      demo: { src: "/demos/echo.mp4", poster: "/demos/echo.jpg", note: "Two real clients talking through a local broker." },
      name: "Echo",
      summary: "Real-time browser chat. No sign-up, no server.",
      why: "I wanted to see how little it takes to build a real chat: no account, no backend.",
      detail:
        "Browser clients talk over a shared MQTT broker on WebSockets. Group and direct chats, reactions, replies, voice notes, file sharing, disappearing messages, and it installs as a PWA.",
      status: "shipped",
      stack: ["JavaScript", "MQTT", "WebSockets", "PWA"],
      repo: gh("echo"),
    },
    {
      id: "iris",
      demo: { src: "/demos/iris.mp4", poster: "/demos/iris.jpg", note: "The real script run against a seeded test mailbox, not a live Gmail account." },
      name: "Iris",
      summary: "Your Gmail, sorted, with one calm daily brief.",
      why: "My inbox is flooded with hackathon, event and placement mail. I wanted one calm page instead.",
      detail:
        "Sorts matching mail into nested labels on a schedule, then serves a private card-style brief split into new and earlier. The page renders a saved snapshot, so it always loads instantly.",
      status: "shipped",
      stack: ["Google Apps Script", "JavaScript"],
      repo: gh("iris"),
    },
    {
      id: "vertex",
      demo: { src: "/demos/vertex.mp4", poster: "/demos/vertex.jpg", note: "The real app driven by scripted keyboard input, with no webcam. Hand and voice control are not shown." },
      name: "Vertex",
      summary: "Control 3D holograms with hands and voice, using only a webcam.",
      why: "I wanted the JARVIS interface without a depth sensor or any special hardware.",
      detail:
        "MediaPipe hand tracking turns gestures into orbit, move, zoom and scale on OpenGL models. Voice commands run through faster-whisper.",
      status: "shipped",
      stack: ["Python", "MediaPipe", "PyOpenGL", "faster-whisper"],
      repo: gh("vertex"),
    },
    {
      id: "vector",
      demo: { src: "/demos/vector.mp4", poster: "/demos/vector.jpg", note: "A scripted session; midnight is reached by moving the browser clock forward." },
      name: "Vector",
      summary: "A life operating system that makes habits a game you can lose.",
      why: "I wanted my habits to feel like a game I could lose.",
      detail:
        "Six life attributes that earn XP, mandatory daily protocols that reset at midnight, focus timer, achievements, and JSON export with optional Gist sync. Offline-first.",
      status: "shipped",
      stack: ["React", "TypeScript", "Capacitor", "Zustand"],
      repo: gh("vector"),
    },
    {
      id: "traffic-twin",
      demo: { src: "/demos/bengaluru-traffic-twin.mp4", poster: "/demos/bengaluru-traffic-twin.jpg", note: "The dashboard's own map and analytics, with live TomTom readings alongside." },
      name: "Bengaluru Traffic Twin",
      summary: "A full simulated day of Bengaluru traffic, on real roads.",
      why: "Bengaluru traffic is a daily argument. I wanted to see the whole city at once.",
      detail:
        "SUMO simulation on real OpenStreetMap roads: about 552,000 road segments and 95,000 trips over 24 hours. An animated deck.gl map, an analytics dashboard, and live TomTom readings as a reference.",
      status: "shipped",
      stack: ["Python", "SUMO", "deck.gl", "MapLibre"],
      repo: gh("bengaluru-traffic-twin"),
    },
    {
      id: "darwin",
      demo: { src: "/demos/darwin.mp4", poster: "/demos/darwin.jpg", note: "Five environments recorded live from the running app. Numbers differ run to run." },
      name: "Darwin",
      summary: "A neuroevolution engine in TypeScript with zero dependencies.",
      why: "I wanted to see if one evolution core could stay blind to what it evolves.",
      detail:
        "The same unchanged core evolves neural networks, strings and route permutations across five environments, all in the browser. No ML libraries.",
      status: "shipped",
      stack: ["TypeScript"],
      repo: gh("darwin"),
    },
    {
      id: "sentineledge",
      demo: { src: "/demos/sentineledge.mp4", poster: "/demos/sentineledge.jpg", note: "Ten adversarial messages through the real verify-and-reject gate, and a tampered record changing the Merkle root. The recorded evaluation is labelled as not re-run." },
      name: "SentinelEdge",
      summary: "Zero-trust traffic monitoring where every reading ships with a proof.",
      why: "My first project inside a research lab. The rule was simple: trust no edge device.",
      detail:
        "Edge cameras feed a FastAPI backend and TimescaleDB, and every message is signature-checked. Batch roots are anchored on a private Hyperledger Besu network so records can be audited offline. Co-built at the Centre for Innovation and Entrepreneurship (CIE), PES University. My parts: the Bengaluru digital twin, the Merkle-tree audit and the YOLO fine-tune.",
      status: "shipped",
      stack: ["Python", "FastAPI", "TimescaleDB", "Hyperledger Besu", "YOLO", "MQTT"],
      context: "Project Intern, CIE PESU, June to July 2026",
    },
    {
      id: "gbh",
      demo: { src: "/demos/gbh.mp4", poster: "/demos/gbh.jpg", note: "Real briefing and file-sorting output, plus the live dashboard recorded in a browser session." },
      name: "GBH Suite",
      summary: "A quiet macOS suite that sorts files, enforces focus and watches system health.",
      why: "I wanted my Mac to tidy itself without me thinking about it.",
      detail:
        "Eleven background services run as LaunchAgents: real-time file organisation, port and log sentinels, CPU runaway enforcement and git compliance checks. A backup archiver strips heavy dependencies to cut archive size by over 90 percent, and a small web dashboard shows system vitals.",
      status: "shipped",
      stack: ["Python", "FastAPI", "launchd", "macOS"],
      repo: gh("gbh-suite"),
    },
    {
      id: "capstone",
      name: "Capstone",
      summary: "Tells you whether two or three drugs interact, and why.",
      why: "Interaction checkers give a flag and no reason. I wanted one that explains itself.",
      detail:
        "Takes two or three drugs and says whether they interact and why. It combines DrugBank interaction and mechanism analysis, ML classifiers, and RAG over clinical literature, with an LLM to explain the findings. Still being built.",
      status: "in-progress",
      stack: ["Python", "ML", "RAG", "LLM", "DrugBank"],
      context: "Final-year capstone, PES University",
    },
  ] satisfies Project[],

  /** Clickable desk objects. `opens` is a window id. */
  deskObjects: [
    { id: "camera", label: "Shuttr", blurb: "Shuttr, the camera app that fakes a 2000s digicam.", opens: "project:shuttr" },
    { id: "headphones", label: "Hue", blurb: "Hue turns whatever you are listening to into colour.", opens: "project:hue" },
    { id: "notebook", label: "Field notes", blurb: "Field notes: small things worth knowing.", opens: "notes" },
    { id: "binoculars", label: "Scout", blurb: "Scout watches for internships so I do not have to.", opens: "project:scout" },
    { id: "note", label: "Contact", blurb: "Say hello. Email is fastest.", opens: "contact", inline: true },
    { id: "note2", label: "Socials", blurb: "GitHub, LinkedIn and Instagram in one place.", opens: "socials", inline: true },
    { id: "envelope", label: "Iris", blurb: "Iris sorts a flooded Gmail inbox into a calm brief.", opens: "project:iris" },
    { id: "folder", label: "Resume", blurb: "My resume, as a PDF.", opens: "resume" },
    { id: "walkie", label: "Echo", blurb: "Echo is chat that needs no sign-up and no server.", opens: "project:echo" },
  ] satisfies DeskObject[],

  /** Text windows, also shown as desktop files and terminal files. */
  docs: [
    {
      id: "about",
      title: "Profile",
      filename: "profile.txt",
      blocks: [
        { p: "I’m Kalyan, a final-year computer science student at PES University in Bengaluru, graduating in 2027." },
        { p: "I do two things: build products, and work out who they’re for and why they’d pay." },
        { p: "I build developer tools, like a container runtime and a GitOps CLI. I spent a summer at PES’s CIE on SentinelEdge, a zero-trust traffic platform for city infrastructure. I co-founded Devsper, an AI automation startup that didn’t make it. Best education I’ve had in what customers actually pay for." },
        { p: "I also run things. I led Appex through Horcrux 2.0, a 24-hour state-level hackathon with 120+ participants, and ran PR for Samarpana, where a 40-member team took a fundraiser to 8,000+ attendees." },
        { p: "I’m best between those two worlds: deep enough on the tech to decide things with engineers, and curious about the market side. Who the customer is, what they’ll pay for, why they’d switch." },
        { p: "Outside work: lifting, music, and TouchDesigner and computer vision for things with no purpose at all." },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      filename: "contact.txt",
      blocks: [
        { p: "Open to internships and jobs in tech, product and strategy. Always up for a conversation." },
        { p: "Email is fastest. I read everything." },
        {
          links: [
            { label: "kalyan15122005@gmail.com", href: "mailto:kalyan15122005@gmail.com" },
            { label: "linkedin.com/in/srikalyanippili", href: "https://linkedin.com/in/srikalyanippili" },
            { label: "github.com/kelyonn", href: "https://github.com/kelyonn" },
            { label: "instagram.com/kalyan.1729", href: "https://instagram.com/kalyan.1729" },
          ],
        },
      ],
    },
    {
      id: "socials",
      title: "Socials",
      filename: "socials.txt",
      blocks: [
        { h: "Work" },
        { links: [{ label: "linkedin.com/in/srikalyanippili", href: "https://linkedin.com/in/srikalyanippili" }] },
        { h: "Code" },
        { links: [{ label: "github.com/kelyonn", href: "https://github.com/kelyonn" }] },
        { h: "Life" },
        { links: [{ label: "instagram.com/kalyan.1729", href: "https://instagram.com/kalyan.1729" }] },
        { p: "Email is still the fastest way to reach me." },
      ],
    },
    {
      id: "experience",
      title: "Experience",
      filename: "experience.txt",
      blocks: [
        { h: "Co-Founder, Devsper (Feb to Oct 2026)" },
        {
          li: [
            "Co-founded an AI workflow automation startup for technical teams juggling multiple clients. You describe a workflow, it runs across tools like GitHub and Slack, with sealed per-client context packs and approval gates.",
            "Owned marketing, operations and logistics. Co-founders led product and engineering.",
            "Mapped 13 competitors (Lindy and Gumloop closest) and defined the category as “client-scoped automation”.",
            "Chose the wedge: software consultancies first, then startups, Bengaluru first.",
            "Drafted the GTM playbook and an investor pitch with every claim backed by data. Built a filtered angel and VC outreach list.",
            "Started customer discovery. Shut down in October 2026.",
          ],
        },
        { h: "Project Intern, CIE, PES University (June to July 2026, Bengaluru)" },
        {
          li: [
            "Co-built SentinelEdge, a zero-trust traffic monitoring platform for city infrastructure.",
            "Built a synthetic-city digital twin of Bengaluru (1,377 signals across 95 suburbs) generating MQTT traffic calibrated against live TomTom data.",
            "Designed a Merkle-tree tamper-evidence system with a background auditor, anchored on a private four-node Hyperledger Besu network.",
            "Fine-tuned a YOLO model for vehicle detection and counting.",
            "Shipped Verifiable Provenance Receipts, a per-reading proof anyone can check offline.",
          ],
        },
        { h: "Club Head, Appex (2025 to 2026)" },
        {
          li: [
            "Directed Horcrux 2.0, a 24-hour state-level hackathon, with 120+ participants.",
            "Kept seven workstreams in sync.",
            "Organised Survivor Island, a DSA challenge.",
          ],
        },
        { h: "PR and Campaigning Head, Samarpana (2025 to 2026)" },
        {
          li: [
            "Led PR for an initiative supporting families of Indian martyrs, with a 40-member team.",
            "Grew the handle by 1,200+ followers, at 30 to 40k views per post.",
            "Sold out Raas-Leher, about 3,000 attendees a day. 8,000+ attendees across all events.",
          ],
        },
        { h: "Education" },
        {
          li: [
            "B.Tech CSE, PES University, 2023 to expected 2027",
          ],
        },
      ],
    },
    {
      id: "now",
      title: "Now",
      filename: "now.txt",
      blocks: [
        { h: "Right now" },
        {
          li: [
            "This site. A 3D desk with a small operating system inside. You’re in it.",
            "Shuttr: A camera app that shoots like a 2000s digicam. Locking v1 (flash, grain, date stamp) before touching the camcorder looks.",
            "Scout: An internship finder that watches where roles get announced and pings me within minutes. Still rough.",
            "Capstone: A drug-drug interaction tool that takes two or three drugs and says whether they interact and why. It combines DrugBank interaction and mechanism analysis, ML classifiers, and RAG over clinical literature, with an LLM to explain the findings.",
          ],
        },
        { h: "Next" },
        { p: "Internships and jobs in tech, product and strategy." },
        { p: "Updated October 2026." },
      ],
    },
    {
      id: "stack",
      title: "Stack",
      filename: "stack.txt",
      blocks: [
        { p: "Things I have actually used. No skill bars." },
        { h: "Languages" },
        { li: ["Python", "Go", "TypeScript", "JavaScript", "Swift", "Dart", "SQL"] },
        { h: "Systems and cloud" },
        { li: ["Linux namespaces, cgroups v2, BPF seccomp", "Kubernetes, ArgoCD, Chaos Mesh", "Prometheus and Grafana"] },
        { h: "Backend and data" },
        { li: ["FastAPI", "MQTT", "TimescaleDB", "SUMO"] },
        { h: "Apps and frontend" },
        { li: ["React", "Flutter", "deck.gl", "MapLibre"] },
        { h: "AI and search" },
        { li: ["YOLO", "k-NN anomaly detection", "Genetic algorithms and neuroevolution"] },
        { h: "Security" },
        { li: ["Hyperledger Besu", "ECC signatures (secp256k1)", "Merkle trees", "Zero-trust design"] },
        { h: "Product and GTM" },
        { li: ["Competitor analysis", "Positioning", "ICP and GTM playbooks", "Customer discovery", "Investor pitch", "Campaign and PR planning"] },
      ],
    },
    {
      id: "readme",
      title: "Readme_first",
      filename: "readme_first.txt",
      blocks: [
        { p: "Click anything. One click opens it." },
        { p: "Prefer typing? Open the Terminal and type help. Everything it prints is clickable too." },
        { p: "Objects on the desk open projects and more. Hover one to see which. Try the walkie-talkie." },
        { p: "Short on time? Open Resume, or use Simple view (bottom left) for the whole site as plain text." },
      ],
    },
    {
      id: "notes",
      title: "Field notes",
      filename: "notes.txt",
      blocks: [
        { h: "Looking for" },
        { p: "Internships and jobs in tech, product and strategy. Developer tools, AI infrastructure, anything genuinely hard to build." },
        { h: "Ask me about" },
        {
          li: [
            "What a container really is.",
            "Getting an app onto Kubernetes without becoming a Kubernetes person.",
            "What I learned from a startup that didn’t make it.",
            "Working out who a product is for, and why they’d pay.",
            "Why I keep building the small version of something first.",
          ],
        },
        { h: "Receipts" },
        {
          li: [
            "Devsper: 13 competitors mapped, a category defined, a GTM playbook and investor pitch.",
            "Horcrux 2.0: 24 hours, 120+ participants, seven workstreams.",
            "Samarpana: 40-member team, 8,000+ attendees.",
            "Nexus: 607 tests, 99% coverage on the core.",
            "Airlock: namespaces, cgroups v2, a hand-built seccomp filter and an OCI client, in Go.",
            "Flux: one command, five conversion engines.",
            "Echo: chat with no server and no sign-up.",
            "Traffic Twin: about 552,000 road segments and 95,000 trips.",
            "SentinelEdge: every reading ships with a proof you can verify offline.",
          ],
        },
        { h: "Small things worth knowing" },
        {
          li: [
            "A container is a process with a restricted view.",
            "Git is the cluster’s memory.",
            "No converter does everything.",
            "Most people are strong at one side, tech or market. I’d bet on the combination.",
            "Pitch tracks lightness, emotion drives hue, energy drives saturation.",
          ],
        },
        { h: "Shortcuts" },
        {
          li: [
            "Terminal: type help.",
            "Esc closes the window in front. Double-click a title bar to roll a window up.",
            "Simple view (bottom left) is this whole site as plain text.",
          ],
        },
        { p: "Margin doodle: a very confident rectangle labelled 'cloud'." },
      ],
    },
  ] satisfies Doc[],

  /** Desktop icon order. Ids are window ids. */
  desktopIcons: [
    { id: "readme", label: "Readme_first" },
    { id: "about", label: "Profile" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "resume", label: "Resume" },
    { id: "stack", label: "Stack" },
    { id: "contact", label: "Contact" },
    { id: "now", label: "Now" },
    { id: "terminal", label: "Terminal" },
    { id: "trash", label: "Trash" },
  ],

  /** Windows opened when the desktop first loads. Empty: the visitor chooses. */
  bootWindows: [] as string[],

  bootLog: [
    "system32 firmware 1.0",
    "memory check ........ ok",
    "mounting /projects .. ok",
    "mounting /desk ...... ok",
    "loading fonts ....... ok",
    "starting desktop",
  ],

  terminalCommands: [
    { name: "help", usage: "help", description: "List commands." },
    { name: "ls", usage: "ls", description: "List files." },
    { name: "whoami", usage: "whoami", description: "Who is this." },
    { name: "projects", usage: "projects", description: "List projects." },
    { name: "open", usage: "open <name>", description: "Open a project or file." },
    { name: "cat", usage: "cat <file>", description: "Print a file." },
    { name: "resume", usage: "resume", description: "Open the resume PDF." },
    { name: "contact", usage: "contact", description: "Print email and links." },
    { name: "now", usage: "now", description: "What I am working on." },
    { name: "clear", usage: "clear", description: "Clear the screen." },
    { name: "exit", usage: "exit", description: "Close the terminal." },
  ] satisfies TerminalCommand[],

  trashJoke: "The trash is empty. Everything I wrote is somehow still in the repo.",
} as const;

export type Site = typeof site;
