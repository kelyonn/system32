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
    role: "CS student at PES University, Bengaluru",
    tagline: "I build systems, and I am moving toward product and strategy.",
    email: "kalyan15122005@gmail.com",
  },
  links: [
    { label: "GitHub", href: "https://github.com/kelyonn", display: "github.com/kelyonn" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/srikalyanippili",
      display: "linkedin.com/in/srikalyanippili",
    },
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
        "Namespaces, pivot_root, cgroups v2, a hand-assembled BPF seccomp filter and a native OCI registry client. It is not a Docker replacement. It is what sits underneath one.",
      status: "shipped",
      stack: ["Go", "namespaces", "cgroups v2", "seccomp", "OCI"],
      repo: gh("airlock"),
      featured: true,
    },
    {
      id: "nexus",
      name: "Nexus",
      summary: "An open-source GitOps CLI. One config file, one command, a real cluster.",
      why: "I wanted an app running on real Kubernetes without first becoming a Kubernetes expert.",
      detail:
        "Fill in nexus.yaml, run nexus deploy. It generates the manifests and wires up ArgoCD, Prometheus, Grafana and optional Chaos Mesh. The tools underneath stay standard and inspectable.",
      status: "shipped",
      stack: ["Python", "Kubernetes", "ArgoCD", "Prometheus", "Grafana", "Chaos Mesh"],
      repo: gh("nexus"),
      featured: true,
    },
    {
      id: "flux",
      demo: { src: "/demos/flux.mp4", poster: "/demos/flux.jpg", note: "Real conversions, a warning, a refusal and flux doctor, from the actual binary." },
      name: "Flux",
      summary: "A file-conversion CLI and Go SDK that routes across five engines.",
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
      name: "Hue",
      summary: "A macOS app that paints whatever your Mac is playing as a live colour field.",
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
      name: "Shuttr",
      summary: "A camera app that makes your phone shoot like a 2000s digicam.",
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
      name: "Scout",
      summary: "An autonomous pipeline that finds internships and new-grad roles. In progress.",
      why: "I got tired of checking for roles by hand and missing the good ones by a day.",
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
      summary: "Real-time chat in the browser. No sign-up, no server.",
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
      summary: "A private Gmail sorter and daily brief, in one Apps Script file.",
      why: "My inbox is flooded with hackathon, event and placement mail. I wanted one calm page instead.",
      detail:
        "Sorts matching mail into nested labels on a schedule, then serves a private card-style brief split into new and earlier. The page renders a saved snapshot, so it always loads instantly.",
      status: "shipped",
      stack: ["Google Apps Script", "JavaScript"],
      repo: gh("iris"),
    },
    {
      id: "vertex",
      name: "Vertex",
      summary: "Control 3D holograms with your hands and voice, using only a webcam.",
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
      summary: "A gamified life operating system: daily rules, tasks, streaks and stats.",
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
      summary: "A digital twin of Bengaluru's roads running a full simulated day.",
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
      summary: "A neuroevolution engine in TypeScript with zero runtime dependencies.",
      why: "I wanted to see if one evolution core could stay blind to what it evolves.",
      detail:
        "The same unchanged core evolves neural networks, strings and route permutations across five environments, all in the browser. No ML libraries.",
      status: "shipped",
      stack: ["TypeScript"],
      repo: gh("darwin"),
    },
    {
      id: "sentineledge",
      name: "SentinelEdge",
      summary: "Zero-trust, edge-AI traffic monitoring, co-built as a project intern.",
      why: "My first project inside a research lab. The rule was simple: trust no edge device.",
      detail:
        "Edge cameras feed a FastAPI backend and TimescaleDB, and every message is signature-checked. Batch roots are anchored on a private Hyperledger Besu network so records can be audited offline. Co-built at the Centre for Innovation and Entrepreneurship (CIE), PES University.",
      status: "shipped",
      stack: ["Python", "FastAPI", "TimescaleDB", "Hyperledger Besu", "YOLO", "MQTT"],
      context: "Project Intern, CIE PESU, June to July 2026",
    },
    {
      id: "gbh",
      name: "GBH Suite",
      summary: "A quiet macOS automation suite: file sorting, focus mode and system monitoring.",
      why: "I wanted my Mac to tidy itself without me thinking about it.",
      detail:
        "Eleven background services run as LaunchAgents: real-time file organisation, port and log sentinels, CPU runaway enforcement and git compliance checks. A backup archiver strips heavy dependencies to cut archive size by over 90 percent, and a small web dashboard shows system vitals.",
      status: "shipped",
      stack: ["Python", "FastAPI", "launchd", "macOS"],
      repo: gh("gbh-suite"),
    },
  ] satisfies Project[],

  /** Clickable desk objects. `opens` is a window id. */
  deskObjects: [
    { id: "camera", label: "Shuttr", blurb: "Shuttr, the camera app that fakes a 2000s digicam.", opens: "project:shuttr" },
    { id: "headphones", label: "Hue", blurb: "Hue turns whatever you are listening to into colour.", opens: "project:hue" },
    { id: "notebook", label: "Field notes", blurb: "Field notes: small things worth knowing.", opens: "notes" },
    { id: "binoculars", label: "Scout", blurb: "Scout watches for internships so I do not have to.", opens: "project:scout" },
    { id: "note", label: "Contact", blurb: "Say hello. Email is fastest.", opens: "contact" },
    { id: "note2", label: "Socials", blurb: "GitHub, LinkedIn and Instagram in one place.", opens: "socials" },
    { id: "envelope", label: "Iris", blurb: "Iris sorts a flooded Gmail inbox into a calm brief.", opens: "project:iris" },
    { id: "walkie", label: "Echo", blurb: "Echo is chat that needs no sign-up and no server.", opens: "project:echo" },
  ] satisfies DeskObject[],

  /** Text windows, also shown as desktop files and terminal files. */
  docs: [
    {
      id: "about",
      title: "Profile",
      filename: "profile.txt",
      blocks: [
        { p: "I am Kalyan, a computer science student at PES University in Bengaluru, graduating in 2027." },
        {
          p: "I build things close to the operating system: a container runtime, a GitOps CLI, a file converter. Then I build things for people: a camera app, a chat, a calmer inbox.",
        },
        { p: "I learn by making a small version of the thing. Airlock started as 'what is a container, really?' and ended up as a runtime." },
        { p: "Lately I care as much about who a tool is for as how it works. That is why I am moving toward product and operator roles." },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      filename: "contact.txt",
      blocks: [
        { p: "Email is fastest. I read everything." },
        {
          links: [
            { label: "kalyan15122005@gmail.com", href: "mailto:kalyan15122005@gmail.com" },
            { label: "github.com/kelyonn", href: "https://github.com/kelyonn" },
            { label: "linkedin.com/in/srikalyanippili", href: "https://linkedin.com/in/srikalyanippili" },
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
        { h: "Code" },
        { links: [{ label: "github.com/kelyonn", href: "https://github.com/kelyonn" }] },
        { h: "Work" },
        { links: [{ label: "linkedin.com/in/srikalyanippili", href: "https://linkedin.com/in/srikalyanippili" }] },
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
        { h: "Project Intern, CIE, PES University" },
        { p: "June to July 2026, Bengaluru. Centre for Innovation and Entrepreneurship." },
        {
          li: [
            "Co-built SentinelEdge, a zero-trust edge-AI traffic monitoring platform that treats every edge device as untrusted.",
            "Built a synthetic-city digital twin of Bengaluru (SUMO and OpenStreetMap, 1,377 signals across 95 suburbs) that generates MQTT traffic calibrated against live TomTom data.",
            "Designed a Merkle-tree tamper-evidence system with a background auditor, anchored on a private four-node Hyperledger Besu network.",
            "Fine-tuned a YOLO model for vehicle detection and counting, for edge-device inference.",
            "Shipped Verifiable Provenance Receipts: a per-reading proof that anyone can check offline without trusting the server.",
          ],
        },
        { h: "Club Head, Appex (2025 to 2026)" },
        {
          li: [
            "Directed Horcrux 2.0, a 24-hour state-level hackathon, with a team of 120+.",
            "Ran seven functions in parallel, from track design and sponsorship to logistics and approvals.",
            "Organised Survivor Island, a DSA challenge modelled on real interview formats.",
          ],
        },
        { h: "PR and Campaigning Head, Samarpana (2025 to 2026)" },
        {
          li: [
            "Led PR for a student-run initiative that supports families of Indian martyrs, with a 40-member team.",
            "Grew the official handle by 1,200+ followers and sustained 30 to 40k views per post.",
            "Sold out Raas-Leher, the flagship Garba night, with about 3,000 attendees a day.",
          ],
        },
        { h: "PES University, Bengaluru" },
        { p: "B.Tech in Computer Science and Engineering, 2023 to expected 2027." },
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
            "This site. A 3D desk with a small operating system inside.",
            "Shuttr, the digicam camera app. Getting v1 right before the camcorder looks.",
            "Scout, the internship finder. Still rough.",
          ],
        },
        { p: "Updated October 2026." },
      ],
    },
    {
      id: "stack",
      title: "Stack",
      filename: "stack.txt",
      blocks: [
        { p: "Things I have actually shipped with. No skill bars." },
        { h: "Languages" },
        { li: ["Python", "Go", "TypeScript", "Swift", "SQL"] },
        { h: "Systems and cloud" },
        { li: ["Linux namespaces, cgroups v2, BPF seccomp", "Kubernetes, ArgoCD, Chaos Mesh", "Prometheus and Grafana"] },
        { h: "Backend and data" },
        { li: ["FastAPI", "MQTT", "TimescaleDB", "SUMO traffic simulation"] },
        { h: "AI and search" },
        { li: ["YOLO", "k-NN anomaly detection", "Genetic algorithms and neuroevolution"] },
        { h: "Security" },
        { li: ["Hyperledger Besu", "ECC signatures (secp256k1)", "Merkle trees", "Zero-trust design"] },
      ],
    },
    {
      id: "readme",
      title: "Readme_first",
      filename: "readme_first.txt",
      blocks: [
        { p: "Click anything. One click opens it." },
        { p: "Prefer typing? Open the Terminal and type help. Everything it prints is clickable too." },
        { p: "Objects on the desk open projects. Hover one to see which. Try the walkie-talkie." },
        { p: "Short on time? Simple view, bottom left, is the whole site as plain text." },
      ],
    },
    {
      id: "notes",
      title: "Field notes",
      filename: "notes.txt",
      blocks: [
        { h: "Looking for" },
        { p: "Internships and new-grad roles. Product, strategy or operator seats where I can still get close to the system." },
        { h: "Ask me about" },
        {
          li: [
            "What a container really is, and what building one taught me.",
            "Getting an app onto Kubernetes without becoming a Kubernetes person.",
            "Why I keep building the small version of something first.",
            "Designing a tool for one user before trying to make it for everyone.",
          ],
        },
        { h: "Receipts" },
        {
          li: [
            "Nexus: 607 tests, 99% coverage on the core. Install with pip install nexus-gitops.",
            "Airlock: namespaces, cgroups v2, a hand-built seccomp filter and an OCI client, in Go. MIT licensed, CI on every push.",
            "Flux: one command, five conversion engines, and a public Go package at pkg/flux.",
            "Echo: group and direct chat with no server and no sign-up. It installs as an app.",
            "Bengaluru Traffic Twin: about 552,000 road segments and 95,000 trips in one simulated day.",
            "SentinelEdge: every reading ships with a proof you can verify offline, with no trust in the server.",
          ],
        },
        { h: "Small things worth knowing" },
        {
          li: [
            "A container is a process with a restricted view. Namespaces limit what it can see, cgroups limit what it can use, seccomp limits what it can ask the kernel for.",
            "Git is the cluster's memory. If it is not committed, ArgoCD will undo it.",
            "No converter does everything. Pandoc for documents, ImageMagick for images, FFmpeg for sound and video.",
            "Pitch tracks lightness, emotion drives hue, energy drives saturation. That is how Hue paints music.",
          ],
        },
        { h: "Shortcuts" },
        {
          li: [
            "Terminal: type help. Everything it prints is clickable.",
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
    { id: "about", label: "Profile" },
    { id: "projects", label: "Projects" },
    { id: "resume", label: "Resume" },
    { id: "contact", label: "Contact" },
    { id: "experience", label: "Experience" },
    { id: "now", label: "Now" },
    { id: "stack", label: "Stack" },
    { id: "readme", label: "Readme_first" },
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
    { name: "clear", usage: "clear", description: "Clear the screen." },
    { name: "exit", usage: "exit", description: "Close the terminal." },
  ] satisfies TerminalCommand[],

  trashJoke: "The trash is empty. Everything I wrote is somehow still in the repo.",
} as const;

export type Site = typeof site;
