type Segment = string | { em: string } | { link: string; href: string };

export type WorkProject = {
  kind?: string;
  name: string;
  desc: string;
  tags?: string[];
  links?: { label: string; href: string }[];
};

export type WorkEntry = {
  years: string;
  company: string;
  role: string;
  blurb?: string;
  link?: string;
  projects?: WorkProject[];
};

type Note = { n: string; title: string; body: string };

type FooterLink = { label: string; href: string; external?: boolean };

type LabProject = {
  kind: string;
  name: string;
  blurb: string;
  tags: string[];
  links: { label: string; href: string }[];
};

export type Content = {
  meta: { title: string; description: string };
  nav: {
    work: string;
    studio: string;
    play: string;
    notes: string;
    contact: string;
    theme: string;
  };
  hero: {
    metaLine: string;
    avatarAlt: string;
    h1Line1: string;
    h1Line2Pre: string;
    h1Line2Accent: string;
    h1Line2Post: string;
    lede: Segment[];
  };
  work: { kicker: string; title: string; entries: WorkEntry[] };
  studio: {
    kicker: string;
    title: string;
    quiet: string;
    pre: string;
    linkLabel: string;
    linkHref: string;
    post: string;
  };
  playground: {
    kicker: string;
    title: string;
    intro: string;
    demoIntro: string;
    inputLabel: string;
    inputPlaceholder: string;
    meta: string;
    overlayLabel: string;
    hint: string;
    labLink: { label: string; href: string };
    projects: LabProject[];
  };
  notes: { kicker: string; title: string; items: Note[] };
  footer: {
    getInTouch: string;
    links: FooterLink[];
    stackLine: string;
    updated: string;
    version: string;
  };
};

export const content: Content = {
  meta: {
    title: "Tom Cardoen · Software Engineer",
    description:
      "Software engineer and designer in Liège, Belgium. I design and build software. Lately, smart batteries at Azimut.",
  },
  nav: {
    work: "Work",
    studio: "Studio",
    play: "Play",
    notes: "Notes",
    contact: "Contact",
    theme: "Toggle dark mode",
  },
  hero: {
    metaLine: "Tom Cardoen · Software Engineer · Liège, BE",
    avatarAlt: "Portrait of Tom Cardoen",
    h1Line1: "I design and build software.",
    h1Line2Pre: "Lately: smart ",
    h1Line2Accent: "batteries",
    h1Line2Post: ".",
    lede: [
      "At ",
      { link: "Azimut", href: "https://azimut.be" },
      " I build the apps for our smart home batteries. Outside work I ship my own things: ",
      { link: "seal", href: "https://ots.tomca.be" },
      ", a secret-sharer. And through ",
      { link: "Nodeo", href: "https://nodeo.be" },
      ", I help others ship theirs.",
    ],
  },
  work: {
    kicker: "01 / Work",
    title: "Where I’ve worked",
    entries: [
      {
        years: "2025 → now",
        company: "Azimut",
        role: "Software Engineer",
        blurb:
          "I build the software around the battery: the part that makes a home’s energy readable at a glance, and turns an installer’s setup from an afternoon into a few minutes.",
        projects: [
          {
            name: "Azimut Energy",
            desc: "The owner-facing companion app.",
            tags: ["Flutter", "GraphQL", "MQTT"],
            links: [{ label: "Live", href: "https://app.azimut.be/" }],
          },
        ],
      },
      {
        years: "2023 → 24",
        company: "Noshaq",
        role: "Intern, then part-time dev",
        blurb:
          "A 15-week internship, then stayed on part-time, building internal web tools used daily at Noshaq.",
      },
      {
        years: "2021 → 24",
        company: "HELMo",
        role: "BSc, Application Development",
        blurb: "Graduated with distinction. Liège.",
      },
    ],
  },
  studio: {
    kicker: "02 / Studio",
    title: "Nodeo",
    quiet: "freelance, since Oct 2024",
    pre: "Freelancing, with ",
    linkLabel: "nodeo.be",
    linkHref: "https://nodeo.be",
    post: ". I take founders and small teams from idea to shipped product: web and mobile, design and build, one person you actually talk to.",
  },
  playground: {
    kicker: "03 / Playground",
    title: "Things I build for fun",
    intro: "My corner for tinkering with stuff, no pressure. Every so often one turns into a real project.",
    demoIntro:
      "What does your name look like? Type it below. Every name gets its own shape, unique and the same every time.",
    inputLabel: "your name",
    inputPlaceholder: "Tom",
    meta: "deterministic, unique per name",
    overlayLabel: "Signature",
    hint: "type · move · feel",
    labLink: { label: "More in the lab", href: "/lab" },
    projects: [
      {
        kind: "2026",
        name: "seal",
        blurb:
          "One-time secret sharing, end-to-end encrypted: the server never sees the message.",
        tags: ["TypeScript", "Web Crypto", "zero-knowledge"],
        links: [
          { label: "Live", href: "https://ots.tomca.be" },
          { label: "Code", href: "https://github.com/t0m-car/seal" },
        ],
      },
    ],
  },
  notes: {
    kicker: "04 / Notes",
    title: "What I keep coming back to",
    items: [
      {
        n: "01",
        title: "I learn by building.",
        body: "My GitHub is full of prototypes: an evolution simulator, a memory game, piles of little tools. Each one taught me something, even the ones I never finished.",
      },
      {
        n: "02",
        title: "I won’t choose between design and code.",
        body: "I’d rather move between the Figma file and the codebase all day than be great at only one. Most of the good stuff is in the back-and-forth.",
      },
      {
        n: "03",
        title: "I don’t trust software that asks for too much.",
        body: "I built seal so the server can’t read your messages, half to prove I could, half because most apps hoard data they don’t need.",
      },
    ],
  },
  footer: {
    getInTouch: "Get in touch",
    links: [
      { label: "tom@tomca.be", href: "mailto:tom@tomca.be" },
      { label: "GitHub", href: "https://github.com/t0m-car", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/tom-cardoen/", external: true },
      { label: "Nodeo", href: "https://nodeo.be", external: true },
    ],
    stackLine:
      "Currently with: Next.js · React · Three.js · TypeScript · Go · .NET · Tailwind · Figma",
    updated: "updated",
    version: "tomca.be · v0.1",
  },
};
