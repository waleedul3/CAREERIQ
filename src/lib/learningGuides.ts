import type { RoadmapTask } from '../types/index.ts';

export type ResourceCategory =
  | 'Official Docs'
  | 'YouTube'
  | 'Free Tutorial'
  | 'Free Course'
  | 'GitHub';

export interface LearningResource {
  title: string;
  url: string;
  category: ResourceCategory;
  description: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  estimatedMinutes: number;
  explanation: string[];
  concepts: Array<{ term: string; definition: string }>;
  codeExample?: {
    title: string;
    language: string;
    code: string;
    notes: string;
  };
  stepByStepGuidance: string[];
  keyTakeaways: string[];
}

export interface MiniProjectSuggestion {
  title: string;
  description: string;
  deliverables: string[];
}

export interface SkillLearningGuide {
  skill: string;
  introduction: string;
  objectives: string[];
  topics: LearningTopic[];
  exercises: string[];
  miniProjects: MiniProjectSuggestion[];
  keyTakeaways: string[];
  resources: LearningResource[];
}

function normalizeSkillKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function githubTopicUrl(topic: string): string {
  return `https://github.com/search?q=${encodeURIComponent(topic)}&type=repositories`;
}

function makeResources(params: {
  skill: string;
  officialUrl: string;
  officialTitle: string;
  tutorialUrl: string;
  tutorialTitle: string;
  courseUrl?: string;
  courseTitle?: string;
  youtubeQuery: string;
  githubQuery: string;
}): LearningResource[] {
  return [
    {
      title: params.officialTitle,
      url: params.officialUrl,
      category: 'Official Docs',
      description: `Primary reference and getting-started documentation for ${params.skill}.`,
    },
    {
      title: `YouTube Tutorials: ${params.skill}`,
      url: youtubeSearchUrl(params.youtubeQuery),
      category: 'YouTube',
      description: `Curated YouTube search for structured ${params.skill} walkthroughs and hands-on coding tutorials.`,
    },
    {
      title: params.tutorialTitle,
      url: params.tutorialUrl,
      category: 'Free Tutorial',
      description: `Step-by-step written guide and examples for ${params.skill}.`,
    },
    {
      title: params.courseTitle || 'freeCodeCamp Curriculum',
      url: params.courseUrl || 'https://www.freecodecamp.org/learn/',
      category: 'Free Course',
      description: `Free interactive coursework and guided exercises covering ${params.skill}.`,
    },
    {
      title: `GitHub Repositories: ${params.skill} Examples`,
      url: githubTopicUrl(params.githubQuery),
      category: 'GitHub',
      description: `Open-source starter templates, sample projects, and reference implementations for ${params.skill}.`,
    },
  ];
}

const GUIDE_CATALOG: Record<string, SkillLearningGuide> = {
  html: {
    skill: 'HTML',
    introduction:
      'HyperText Markup Language (HTML) is the structural foundation of every web page. Writing semantic, accessible HTML ensures screen readers, search engines, and browsers interpret your content reliably.',
    objectives: [
      'Structure pages with semantic landmarks (<header>, <main>, <nav>, <section>, <footer>)',
      'Build accessible forms with explicit <label> associations, native validation, and helpful error hints',
      'Use proper heading hierarchy, tables, media attributes, and ARIA roles only when native elements fall short',
    ],
    topics: [
      {
        id: 'html-semantic-structure',
        title: 'Semantic Landmarks & Document Structure',
        estimatedMinutes: 35,
        explanation: [
          'Semantic HTML replaces generic <div> wrappers with elements that describe their meaning. Screen readers rely on landmarks like <main>, <nav>, and <article> so keyboard users can jump directly to content.',
          'Always maintain a single <h1> per page representing the primary topic, followed by nested <h2> and <h3> headings without skipping levels.',
        ],
        concepts: [
          { term: 'Landmark Elements', definition: 'Regions such as <header>, <nav>, <main>, <aside>, and <footer> that define page layout roles.' },
          { term: 'Document Outline', definition: 'The logical hierarchy formed by <h1>–<h6> headings.' },
          { term: 'Native Semantics', definition: 'Using <button> for actions and <a> for navigation instead of clickable <div> elements.' },
        ],
        codeExample: {
          title: 'Semantic Page Layout',
          language: 'html',
          code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Portfolio</title>
  </head>
  <body>
    <header>
      <nav aria-label="Primary navigation">
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main>
      <h1>Software Engineering Portfolio</h1>
      <section id="projects" aria-labelledby="projects-heading">
        <h2 id="projects-heading">Featured Work</h2>
        <article>
          <h3>CareerIQ Analytics</h3>
          <p>Full-stack readiness dashboard built with React and MongoDB.</p>
        </article>
      </section>
    </main>
    <footer>
      <p>Built with semantic HTML5</p>
    </footer>
  </body>
</html>`,
          notes: 'Notice how aria-labelledby links the section to its heading for assistive technology.',
        },
        stepByStepGuidance: [
          'Create an index.html file with the HTML5 doctype and lang="en".',
          'Wrap your navigation in <nav> and primary content in <main>.',
          'Verify heading order using your browser DevTools Accessibility tree.',
        ],
        keyTakeaways: [
          'Prefer native semantic elements over generic <div> and <span>.',
          'Never skip heading levels (e.g. jumping from <h1> to <h4>).',
        ],
      },
      {
        id: 'html-forms-accessibility',
        title: 'Accessible Forms & Native Validation',
        estimatedMinutes: 40,
        explanation: [
          'Forms are the primary way users interact with web applications. Every input must have a programmatically associated <label> using matching for and id attributes.',
          'HTML5 input types (email, url, number, date) and attributes (required, min, max, pattern) provide built-in validation and mobile-friendly keyboards before JavaScript even runs.',
        ],
        concepts: [
          { term: 'Label Association', definition: 'Pairing <label for="email"> with <input id="email"> so clicking the label focuses the input.' },
          { term: 'Fieldset & Legend', definition: 'Grouping related radio buttons or checkboxes with <fieldset> and <legend>.' },
        ],
        codeExample: {
          title: 'Accessible Registration Form',
          language: 'html',
          code: `<form action="/api/register" method="post">
  <div>
    <label for="full-name">Full name</label>
    <input id="full-name" name="name" type="text" required minlength="2" autocomplete="name" />
  </div>
  <div>
    <label for="student-email">University email</label>
    <input id="student-email" name="email" type="email" required autocomplete="email" />
  </div>
  <button type="submit">Create account</button>
</form>`,
          notes: 'Adding autocomplete attributes helps browsers and password managers autofill fields accurately.',
        },
        stepByStepGuidance: [
          'Build a 3-field form using explicit <label> tags and native input types.',
          'Test submitting empty or malformed values to observe browser constraint validation.',
          'Navigate the entire form using only Tab, Shift+Tab, and Enter.',
        ],
        keyTakeaways: [
          'Every form control needs an accessible label.',
          'Use type="submit" inside <form> so pressing Enter submits naturally.',
        ],
      },
    ],
    exercises: [
      'Refactor a div-heavy landing page into semantic <header>, <nav>, <main>, <section>, and <footer> landmarks.',
      'Build an accessible multi-section student profile form with <fieldset>, <legend>, and native validation.',
    ],
    miniProjects: [
      {
        title: 'Accessible Engineering Portfolio Skeleton',
        description: 'Create a pure semantic HTML portfolio with zero CSS that remains readable and keyboard-navigable.',
        deliverables: ['Semantic landmarks', 'Project table with <thead>/<tbody>', 'Validated contact form'],
      },
    ],
    keyTakeaways: [
      'Clean HTML structure simplifies CSS styling, JavaScript DOM queries, and accessibility compliance.',
    ],
    resources: makeResources({
      skill: 'HTML',
      officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      officialTitle: 'MDN Web Docs: HTML',
      tutorialUrl: 'https://www.w3schools.com/html/',
      tutorialTitle: 'W3Schools HTML Tutorial',
      courseUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      courseTitle: 'freeCodeCamp Responsive Web Design',
      youtubeQuery: 'HTML5 semantic elements and forms full tutorial',
      githubQuery: 'html5 semantic portfolio starter',
    }),
  },

  css: {
    skill: 'CSS',
    introduction:
      'Cascading Style Sheets (CSS) control layout, typography, spacing, and responsive behavior across mobile, tablet, and desktop viewports.',
    objectives: [
      'Master the CSS box model, specificity, and custom properties (CSS variables)',
      'Build 1D layouts with Flexbox and 2D page grids with CSS Grid',
      'Design mobile-first responsive interfaces using media queries and fluid units',
    ],
    topics: [
      {
        id: 'css-flexbox-grid',
        title: 'Flexbox & CSS Grid Layouts',
        estimatedMinutes: 45,
        explanation: [
          'Flexbox excels at distributing space along a single axis (navigation bars, button groups, card headers). CSS Grid excels at two-dimensional layouts (dashboards, sidebars, multi-column card grids).',
          'Combine repeat(auto-fit, minmax(260px, 1fr)) in CSS Grid to create responsive card grids that adapt without dozens of media queries.',
        ],
        concepts: [
          { term: 'Main & Cross Axis', definition: 'In Flexbox, justify-content aligns along the main axis while align-items aligns along the cross axis.' },
          { term: 'fr Unit', definition: 'A fractional unit in CSS Grid representing a share of available container space.' },
        ],
        codeExample: {
          title: 'Responsive Dashboard Grid',
          language: 'css',
          code: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}`,
          notes: 'Using gap instead of margins between grid/flex items prevents uneven outer spacing.',
        },
        stepByStepGuidance: [
          'Build a top navigation bar with display: flex and justify-content: space-between.',
          'Create a 3-column card grid that collapses to 1 column on narrow screens.',
          'Inspect grid lines using browser DevTools Layout overlay.',
        ],
        keyTakeaways: [
          'Use Flexbox for 1D alignment and CSS Grid for 2D page structures.',
          'Prefer gap over margin hacks for consistent spacing.',
        ],
      },
      {
        id: 'css-responsive-tokens',
        title: 'CSS Custom Properties & Mobile-First Media Queries',
        estimatedMinutes: 35,
        explanation: [
          'CSS custom properties (--bg-surface, --text-primary) centralize your color palette and spacing tokens, making light/dark themes clean to maintain.',
          'Writing mobile-first CSS starts with single-column base styles and layers @media (min-width: 768px) enhancements for larger viewports.',
        ],
        concepts: [
          { term: 'Custom Properties', definition: 'Variables declared with --name and read with var(--name) that cascade through the DOM.' },
          { term: 'box-sizing: border-box', definition: 'Ensures padding and border are included inside an element’s declared width.' },
        ],
        codeExample: {
          title: 'Theme Tokens & Breakpoint',
          language: 'css',
          code: `:root {
  --surface: #ffffff;
  --ink: #0f172a;
  --accent: #1d4ed8;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 260px 1fr;
  }
}`,
          notes: 'Mobile-first rules keep small-screen CSS simple and override only what changes on desktop.',
        },
        stepByStepGuidance: [
          'Define root color variables for surface, text, border, and accent colors.',
          'Test your layout at 375px, 768px, and 1280px widths in DevTools.',
        ],
        keyTakeaways: [
          'Always set box-sizing: border-box globally.',
          'Use relative units (rem, %, fr) for scalable typography and layouts.',
        ],
      },
    ],
    exercises: [
      'Recreate a 12-column responsive dashboard layout using CSS Grid without horizontal overflow at 375px.',
      'Implement a light/dark theme toggle using CSS custom properties.',
    ],
    miniProjects: [
      {
        title: 'Responsive SaaS Pricing & Analytics Page',
        description: 'Build a 3-tier pricing grid and comparison table that adapts cleanly from mobile to desktop.',
        deliverables: ['Flexbox navbar', 'Auto-fit CSS Grid cards', 'Zero horizontal scroll at 375px'],
      },
    ],
    keyTakeaways: [
      'Mastering Flexbox, Grid, and custom properties covers 90% of modern UI layout challenges.',
    ],
    resources: makeResources({
      skill: 'CSS',
      officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      officialTitle: 'MDN Web Docs: CSS',
      tutorialUrl: 'https://www.w3schools.com/css/',
      tutorialTitle: 'W3Schools CSS Tutorial',
      courseUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      courseTitle: 'freeCodeCamp Responsive Web Design',
      youtubeQuery: 'CSS Flexbox and Grid crash course',
      githubQuery: 'css grid flexbox responsive examples',
    }),
  },

  javascript: {
    skill: 'JavaScript',
    introduction:
      'JavaScript powers interactive web interfaces and Node.js backends. Modern ES2023+ JavaScript emphasizes immutable array transforms, async/await error handling, and modular code.',
    objectives: [
      'Understand scope, closures, and the JavaScript event loop',
      'Transform data cleanly with map, filter, reduce, and destructuring',
      'Fetch and handle asynchronous API data with async/await and try/catch',
    ],
    topics: [
      {
        id: 'js-modern-syntax-arrays',
        title: 'Modern ES Modules, Destructuring & Array Methods',
        estimatedMinutes: 45,
        explanation: [
          'Prefer const by default and let only when reassignment is necessary. Object and array destructuring make function signatures and state updates concise.',
          'Methods like map, filter, find, some, and reduce express data transformations declaratively without mutating original arrays.',
        ],
        concepts: [
          { term: 'Immutability', definition: 'Creating new arrays/objects instead of mutating existing ones in place.' },
          { term: 'Closure', definition: 'A function that retains access to variables from its outer lexical scope even after the outer function returns.' },
        ],
        codeExample: {
          title: 'Filtering & Summarizing Roadmap Tasks',
          language: 'javascript',
          code: `const tasks = [
  { id: '1', skill: 'React', hours: 12, status: 'Completed' },
  { id: '2', skill: 'Node.js', hours: 10, status: 'In Progress' },
  { id: '3', skill: 'Docker', hours: 8, status: 'Not Started' },
];

const remainingHours = tasks
  .filter(({ status }) => status !== 'Completed')
  .reduce((total, { hours }) => total + hours, 0);

console.log({ remainingHours }); // { remainingHours: 18 }`,
          notes: 'Destructuring inside arrow function parameters keeps transformation pipelines readable.',
        },
        stepByStepGuidance: [
          'Practice rewriting for-loops using filter() and map().',
          'Use spread syntax ({ ...obj, updated: true }) to clone objects safely.',
        ],
        keyTakeaways: [
          'Use const by default; avoid var.',
          'Chain filter and reduce for clean, bug-free aggregations.',
        ],
      },
      {
        id: 'js-async-fetch',
        title: 'Promises, Async/Await & Fetch Error Handling',
        estimatedMinutes: 50,
        explanation: [
          'Network requests are asynchronous. async/await lets you write asynchronous code that reads sequentially, while Promise.all runs independent requests concurrently.',
          'Important: fetch() only rejects on network failure—it does NOT reject on HTTP 404 or 500! Always check response.ok before parsing JSON.',
        ],
        concepts: [
          { term: 'Event Loop', definition: 'The mechanism coordinating the call stack, microtask queue (Promises), and macrotask queue (timers/I/O).' },
          { term: 'response.ok', definition: 'Boolean property on Fetch Response that is true for HTTP 200–299 status codes.' },
        ],
        codeExample: {
          title: 'Safe JSON Fetch Helper',
          language: 'javascript',
          code: `async function fetchRoadmap(role) {
  const url = \`/api/roadmap?role=\${encodeURIComponent(role)}\`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || \`Request failed (\${response.status})\`);
  }
  return response.json();
}`,
          notes: 'Always encode query parameters with encodeURIComponent and validate response.ok.',
        },
        stepByStepGuidance: [
          'Write an async function that fetches data and handles both network and HTTP errors.',
          'Use Promise.all([fetchA(), fetchB()]) when two requests do not depend on each other.',
        ],
        keyTakeaways: [
          'Always check response.ok after await fetch().',
          'Wrap await calls in try/catch to surface clear user-facing errors.',
        ],
      },
    ],
    exercises: [
      'Write a filterable, sortable array utility for a list of student projects.',
      'Build an async data fetcher with loading, success, and error states.',
    ],
    miniProjects: [
      {
        title: 'Interactive Task & Study Tracker',
        description: 'Build a browser app that filters tasks by status, tracks study hours, and persists state in localStorage.',
        deliverables: ['ES modules', 'Array filter/reduce summary', 'Error-safe async data loading'],
      },
    ],
    keyTakeaways: [
      'Solid JavaScript fundamentals make React, TypeScript, and Node.js significantly easier to master.',
    ],
    resources: makeResources({
      skill: 'JavaScript',
      officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      officialTitle: 'MDN JavaScript Guide',
      tutorialUrl: 'https://javascript.info/',
      tutorialTitle: 'The Modern JavaScript Tutorial (javascript.info)',
      courseUrl: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
      courseTitle: 'freeCodeCamp JavaScript Algorithms & Data Structures',
      youtubeQuery: 'Modern JavaScript ES6 async await tutorial',
      githubQuery: 'javascript projects beginners es6',
    }),
  },

  typescript: {
    skill: 'TypeScript',
    introduction:
      'TypeScript adds static type checking on top of JavaScript, catching mismatched API payloads, undefined property access, and refactoring errors before code ever runs.',
    objectives: [
      'Define interfaces, type aliases, union types, and discriminated unions',
      'Use generics to build reusable functions and API response wrappers',
      'Enable strict mode and narrow unknown values safely at runtime',
    ],
    topics: [
      {
        id: 'ts-types-unions',
        title: 'Interfaces, Unions & Type Narrowing',
        estimatedMinutes: 40,
        explanation: [
          'Interfaces and type aliases describe the shape of objects and API contracts. Union types like "Not Started" | "In Progress" | "Completed" prevent invalid string typos.',
          'Type narrowing uses typeof, in, Array.isArray, or discriminated union tags to prove a value’s exact type inside conditional blocks.',
        ],
        concepts: [
          { term: 'Union Type', definition: 'A type formed from two or more types, representing values that may be any one of those types.' },
          { term: 'Discriminated Union', definition: 'A union of object types sharing a common literal property (e.g., status: "loading" | "error" | "ready").' },
        ],
        codeExample: {
          title: 'Typed API State & Narrowing',
          language: 'typescript',
          code: `type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

function renderStatus<T>(state: RequestState<T>): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'error':
      return \`Error: \${state.message}\`;
    case 'ready':
      return 'Loaded successfully';
  }
}`,
          notes: 'Exhaustive switch statements ensure every possible state is handled.',
        },
        stepByStepGuidance: [
          'Turn on "strict": true in tsconfig.json.',
          'Replace any types with unknown and write type guards to narrow them.',
        ],
        keyTakeaways: [
          'Prefer union types over loose strings for status fields.',
          'Avoid any; use unknown when parsing untrusted JSON.',
        ],
      },
      {
        id: 'ts-generics-api',
        title: 'Generics & Shared Client/Server Contracts',
        estimatedMinutes: 40,
        explanation: [
          'Generics let functions and interfaces work across many data types while preserving type information. A generic apiRequest<T>(url) function returns Promise<T>.',
          'Sharing TypeScript types between your Express/API backend and React frontend keeps data contracts synchronized.',
        ],
        concepts: [
          { term: 'Generic Parameter <T>', definition: 'A placeholder type supplied by the caller at usage time.' },
          { term: 'Utility Types', definition: 'Built-in helpers like Partial<T>, Pick<T, K>, Omit<T, K>, and Record<K, V>.' },
        ],
        codeExample: {
          title: 'Generic API Fetch Wrapper',
          language: 'typescript',
          code: `interface RoadmapSummary {
  targetRole: string;
  completedCount: number;
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<T>;
}

const summary = await apiGet<RoadmapSummary>('/api/roadmap');`,
          notes: 'The caller gets full autocomplete on summary.targetRole and summary.completedCount.',
        },
        stepByStepGuidance: [
          'Write a generic wrapper function for API requests.',
          'Use Pick<User, "id" | "name"> to create a public projection type.',
        ],
        keyTakeaways: [
          'Generics eliminate duplicate type definitions across API helpers.',
        ],
      },
    ],
    exercises: [
      'Convert an existing JavaScript utility module to strict TypeScript with zero any annotations.',
      'Model an API response state using a discriminated union.',
    ],
    miniProjects: [
      {
        title: 'Type-Safe API Client & Validator',
        description: 'Build a typed fetch client paired with runtime validation for a student task list.',
        deliverables: ['Strict tsconfig', 'Generic request helper', 'Discriminated union UI state'],
      },
    ],
    keyTakeaways: [
      'TypeScript turns entire classes of runtime bugs into immediate editor feedback.',
    ],
    resources: makeResources({
      skill: 'TypeScript',
      officialUrl: 'https://www.typescriptlang.org/docs/',
      officialTitle: 'TypeScript Official Documentation',
      tutorialUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      tutorialTitle: 'The TypeScript Handbook',
      courseUrl: 'https://www.totaltypescript.com/tutorials/beginners-typescript',
      courseTitle: 'Total TypeScript: Beginners Tutorial (Free)',
      youtubeQuery: 'TypeScript full course for beginners',
      githubQuery: 'typescript react node starter',
    }),
  },

  react: {
    skill: 'React',
    introduction:
      'React is a component-based library for building interactive user interfaces. Instead of manually mutating the DOM, you describe UI as a function of state and props.',
    objectives: [
      'Compose reusable functional components with typed props',
      'Manage local and derived state using useState, useEffect, and custom hooks',
      'Build controlled forms, handle async loading/error states, and lift state cleanly',
    ],
    topics: [
      {
        id: 'react-components-props',
        title: 'Components, JSX & Unidirectional Data Flow',
        estimatedMinutes: 40,
        explanation: [
          'Every React component is a JavaScript function returning JSX. Data flows downward from parent to child via props, while user actions flow upward via callback props.',
          'Keep components focused and pure: given the same props and state, a component should render the same output.',
        ],
        concepts: [
          { term: 'Props', definition: 'Read-only inputs passed from a parent component to a child component.' },
          { term: 'Key Prop', definition: 'A stable unique identifier (never array index for dynamic lists) used by React to track list items.' },
        ],
        codeExample: {
          title: 'Typed Task Card Component',
          language: 'tsx',
          code: `interface TaskCardProps {
  title: string;
  hours: number;
  completed: boolean;
  onToggle: () => void;
}

export function TaskCard({ title, hours, completed, onToggle }: TaskCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-500">{hours} hrs</p>
      <button type="button" onClick={onToggle}>
        {completed ? 'Completed' : 'Mark Completed'}
      </button>
    </div>
  );
}`,
          notes: 'Passing onToggle as a callback keeps state ownership in the parent container.',
        },
        stepByStepGuidance: [
          'Break a UI screen into small presentational components.',
          'Pass unique IDs (like task.taskId) as the key prop when mapping arrays.',
        ],
        keyTakeaways: [
          'Props are immutable inside the child component.',
          'Use stable IDs for list keys.',
        ],
      },
      {
        id: 'react-state-effects',
        title: 'useState, Derived State & useEffect',
        estimatedMinutes: 50,
        explanation: [
          'useState triggers a re-render when updated. Never store values in state if they can be calculated directly from existing state or props (for example, completion percentage).',
          'useEffect synchronizes React with external systems such as API fetches, event listeners, or timers—always include a cleanup or cancellation flag for async fetches.',
        ],
        concepts: [
          { term: 'Derived State', definition: 'Values computed during render from existing state/props rather than duplicated in another useState.' },
          { term: 'Dependency Array', definition: 'The second argument to useEffect telling React which values trigger re-running the effect.' },
        ],
        codeExample: {
          title: 'Fetching Data Safely in useEffect',
          language: 'tsx',
          code: `import { useEffect, useState } from 'react';

export function TopicCounter() {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/roadmap')
      .then((r) => r.json())
      .then((data) => {
        if (active) setTopics(data.topics ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p>Loading topics...</p>;
  return <p>Total topics: {topics.length}</p>;
}`,
          notes: 'The active cleanup flag prevents state updates if the component unmounts mid-request.',
        },
        stepByStepGuidance: [
          'Compute filtered lists and counts directly during render instead of storing them in separate state.',
          'Always return a cleanup function when subscribing to window events or async effects.',
        ],
        keyTakeaways: [
          'Avoid redundant state; derive values during render.',
          'Always handle loading and error states explicitly.',
        ],
      },
    ],
    exercises: [
      'Build a searchable, filterable list of skills using derived state.',
      'Create a controlled form component with validation and optimistic status updates.',
    ],
    miniProjects: [
      {
        title: 'Interactive Learning Progress Dashboard',
        description: 'Build a React dashboard showing skill cards, status filters, and live completion percentage.',
        deliverables: ['Typed props', 'Derived completion percentage', 'Async fetch with error recovery'],
      },
    ],
    keyTakeaways: [
      'Think in terms of state, derived values, and clean component boundaries.',
    ],
    resources: makeResources({
      skill: 'React',
      officialUrl: 'https://react.dev/learn',
      officialTitle: 'React Official Documentation (react.dev/learn)',
      tutorialUrl: 'https://react.dev/learn/thinking-in-react',
      tutorialTitle: 'Thinking in React',
      courseUrl: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
      courseTitle: 'freeCodeCamp Front End Development Libraries',
      youtubeQuery: 'React 19 tutorial for beginners hooks',
      githubQuery: 'react typescript dashboard starter',
    }),
  },

  nextjs: {
    skill: 'Next.js',
    introduction:
      'Next.js is a full-stack React framework supporting server-side rendering, App Router file-based routing, Server Components, and API Route Handlers.',
    objectives: [
      'Organize pages, layouts, and dynamic routes ([id]) in the App Router',
      'Choose appropriately between Server Components and Client Components ("use client")',
      'Build backend API endpoints using Route Handlers and deploy to Vercel',
    ],
    topics: [
      {
        id: 'nextjs-app-router',
        title: 'App Router, Layouts & Dynamic Routes',
        estimatedMinutes: 40,
        explanation: [
          'In the Next.js App Router, folders define URL segments and special files like page.tsx, layout.tsx, and loading.tsx define UI behavior.',
          'Dynamic segments like app/roadmap/learn/[taskId]/page.tsx let a single component render personalized content for any taskId parameter.',
        ],
        concepts: [
          { term: 'Server Component', definition: 'Default component in Next.js App Router that executes on the server and sends zero component JS to the browser.' },
          { term: 'Client Component', definition: 'Component marked with "use client" to enable hooks (useState, useEffect) and browser event handlers.' },
        ],
        codeExample: {
          title: 'Dynamic Route Page in App Router',
          language: 'tsx',
          code: `export default async function LearnTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return (
    <main className="p-6">
      <h1>Learning Module: {decodeURIComponent(taskId)}</h1>
    </main>
  );
}`,
          notes: 'Push "use client" down to interactive leaf components so layouts stay fast.',
        },
        stepByStepGuidance: [
          'Create a nested route with a shared layout.tsx.',
          'Read dynamic route params cleanly and handle missing items with notFound().',
        ],
        keyTakeaways: [
          'Keep Server Components as the default and add "use client" only where interactivity is needed.',
        ],
      },
    ],
    exercises: [
      'Create a dynamic /items/[id] route with a custom loading skeleton.',
      'Build a GET and POST Route Handler with Zod request validation.',
    ],
    miniProjects: [
      {
        title: 'Full-Stack Student Resource Portal',
        description: 'Combine App Router dynamic pages with API Route Handlers and database persistence.',
        deliverables: ['Shared layout', 'Dynamic detail route', 'Validated Route Handler'],
      },
    ],
    keyTakeaways: [
      'Next.js unifies React UI rendering, routing, and server APIs in one project.',
    ],
    resources: makeResources({
      skill: 'Next.js',
      officialUrl: 'https://nextjs.org/learn',
      officialTitle: 'Next.js Official Learn Course',
      tutorialUrl: 'https://nextjs.org/docs/app',
      tutorialTitle: 'Next.js App Router Documentation',
      youtubeQuery: 'Next.js App Router full tutorial',
      githubQuery: 'nextjs app router starter template',
    }),
  },

  tailwindcss: {
    skill: 'Tailwind CSS',
    introduction:
      'Tailwind CSS is a utility-first CSS framework that lets you build consistent, responsive, and dark-mode-ready interfaces directly in your markup.',
    objectives: [
      'Compose spacing, typography, color, and border utilities consistently',
      'Use responsive prefixes (sm:, md:, lg:) and dark: variants',
      'Maintain accessible contrast and clean component readability',
    ],
    topics: [
      {
        id: 'tailwind-responsive-dark',
        title: 'Utility Composition, Responsive Prefixes & Dark Mode',
        estimatedMinutes: 35,
        explanation: [
          'Tailwind applies mobile-first breakpoints: unprefixed classes apply to all screen sizes, while sm:, md:, and lg: apply at those minimum widths and above.',
          'Use dark: prefixes alongside slate/neutral scales to ensure cards, inputs, and text remain legible in both light and dark themes.',
        ],
        concepts: [
          { term: 'Utility-First', definition: 'Composing single-purpose classes (p-5, rounded-xl, text-sm) instead of writing custom CSS selectors for every block.' },
          { term: 'Responsive Modifier', definition: 'Breakpoint prefixes like sm:grid-cols-2 lg:grid-cols-3.' },
        ],
        codeExample: {
          title: 'Responsive Dark-Mode Card',
          language: 'tsx',
          code: `<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 className="text-base font-bold text-slate-900 dark:text-white">
      Tailwind CSS Guide
    </h2>
    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
      In Progress
    </span>
  </div>
</div>`,
          notes: 'flex-col on mobile switching to sm:flex-row prevents cramped headers on 375px screens.',
        },
        stepByStepGuidance: [
          'Style a card layout mobile-first using flex-col, then add sm:flex-row.',
          'Check contrast ratios for both light and dark mode badges.',
        ],
        keyTakeaways: [
          'Extract repeated multi-class patterns into React components rather than long @apply rules.',
        ],
      },
    ],
    exercises: [
      'Build a responsive sidebar + header workspace shell with a mobile drawer.',
    ],
    miniProjects: [
      {
        title: 'Light/Dark Component Kit',
        description: 'Create cards, badges, alerts, and form inputs with consistent Tailwind spacing and contrast.',
        deliverables: ['Responsive grid', 'Dark mode support', 'Focus-visible keyboard rings'],
      },
    ],
    keyTakeaways: [
      'Tailwind enforces visual consistency when you stick to a disciplined spacing and color scale.',
    ],
    resources: makeResources({
      skill: 'Tailwind CSS',
      officialUrl: 'https://tailwindcss.com/docs',
      officialTitle: 'Tailwind CSS Official Documentation',
      tutorialUrl: 'https://tailwindcss.com/docs/responsive-design',
      tutorialTitle: 'Tailwind Responsive Design Guide',
      youtubeQuery: 'Tailwind CSS v4 full tutorial',
      githubQuery: 'tailwindcss components ui starter',
    }),
  },

  nodejs: {
    skill: 'Node.js',
    introduction:
      'Node.js executes JavaScript on the server using an event-driven, non-blocking I/O model, making it ideal for REST APIs, authentication services, and real-time backends.',
    objectives: [
      'Understand the Node.js event loop and non-blocking asynchronous I/O',
      'Build structured Express servers with middleware, routing, and error handlers',
      'Manage environment variables, file paths, and process signals safely',
    ],
    topics: [
      {
        id: 'nodejs-express-middleware',
        title: 'Express Routing, Middleware & Error Handling',
        estimatedMinutes: 45,
        explanation: [
          'Middleware functions intercept incoming HTTP requests to parse JSON bodies, verify authentication cookies, enforce rate limits, and log errors.',
          'Always return explicit HTTP status codes (200, 201, 400, 401, 403, 404, 500) and never leak raw stack traces to clients in production.',
        ],
        concepts: [
          { term: 'Middleware', definition: 'A function with access to (req, res, next) that runs before the final route handler.' },
          { term: 'Non-Blocking I/O', definition: 'Handling database and network operations asynchronously so the single event loop thread stays responsive.' },
        ],
        codeExample: {
          title: 'Validated Express Route Handler',
          language: 'typescript',
          code: `import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

const topicSchema = z.object({
  topicId: z.string().min(1),
  completed: z.boolean(),
});

app.patch('/api/topics', (req, res) => {
  const parsed = topicSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }
  res.json({ updated: parsed.data });
});`,
          notes: 'Validating req.body with Zod at the route boundary protects downstream database queries.',
        },
        stepByStepGuidance: [
          'Create an Express router with health check and CRUD endpoints.',
          'Add authentication middleware that attaches req.user and rejects missing tokens with 401.',
        ],
        keyTakeaways: [
          'Keep routes thin, validate all inputs, and centralize auth checks in middleware.',
        ],
      },
    ],
    exercises: [
      'Build an Express router with GET, POST, and PATCH endpoints backed by Zod validation.',
    ],
    miniProjects: [
      {
        title: 'RESTful Study Progress API',
        description: 'Build a Node.js + Express API with rate limiting, auth middleware, and structured JSON errors.',
        deliverables: ['Express router', 'Zod validation', 'Global error handler'],
      },
    ],
    keyTakeaways: [
      'Clean middleware layering keeps Node.js backends predictable and secure.',
    ],
    resources: makeResources({
      skill: 'Node.js',
      officialUrl: 'https://nodejs.org/en/learn',
      officialTitle: 'Node.js Official Learn Portal',
      tutorialUrl: 'https://expressjs.com/en/starter/installing.html',
      tutorialTitle: 'Express.js Getting Started',
      courseUrl: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
      courseTitle: 'freeCodeCamp Back End Development and APIs',
      youtubeQuery: 'Node.js Express REST API tutorial',
      githubQuery: 'nodejs express typescript starter',
    }),
  },

  apis: {
    skill: 'APIs',
    introduction:
      'Application Programming Interfaces (APIs) define the contract between client applications and backend services using HTTP methods, status codes, headers, and JSON payloads.',
    objectives: [
      'Design resource-oriented REST endpoints with appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)',
      'Use status codes accurately (200, 201, 400, 401, 403, 404, 409, 500)',
      'Validate payloads, paginate large lists, and test contracts automatically',
    ],
    topics: [
      {
        id: 'apis-rest-contracts',
        title: 'REST Design, HTTP Methods & Status Codes',
        estimatedMinutes: 40,
        explanation: [
          'REST APIs model nouns (resources like /api/roadmap or /api/tasks) rather than verbs. Use GET for safe reads, POST for creation, PATCH for partial updates, and DELETE for removal.',
          'Consistent error JSON shapes ({ error: "Human-readable message" }) make frontend error handling straightforward.',
        ],
        concepts: [
          { term: 'Idempotency', definition: 'Repeating the same PUT or DELETE request produces the same server state as calling it once.' },
          { term: '401 vs 403', definition: '401 means unauthenticated (who are you?); 403 means authenticated but unauthorized (you lack permission).' },
        ],
        codeExample: {
          title: 'Consistent REST Endpoint Pattern',
          language: 'typescript',
          code: `// GET /api/tasks?status=In%20Progress
// PATCH /api/roadmap/topics -> { taskId, topicId, completed }
// Response 200 OK:
{
  "roadmap": {
    "targetRole": "Full Stack Developer",
    "tasks": [],
    "topicCompletions": {
      "full-stack-developer-req-react": ["react-components-props"]
    }
  }
}`,
          notes: 'Returning the updated resource in PATCH responses lets the UI stay in sync immediately.',
        },
        stepByStepGuidance: [
          'Document your endpoints with method, path, request body, and expected status codes.',
          'Write integration tests verifying both happy paths and 400/401/403 failure cases.',
        ],
        keyTakeaways: [
          'Use HTTP status codes honestly so clients and monitoring tools can react properly.',
        ],
      },
    ],
    exercises: [
      'Design a REST contract for a student learning tracker with filtering and status updates.',
    ],
    miniProjects: [
      {
        title: 'Tested JSON API Service',
        description: 'Build and test a 4-endpoint REST API with validation, auth, and integration tests.',
        deliverables: ['REST endpoints', 'Error schema', 'Vitest/Supertest checks'],
      },
    ],
    keyTakeaways: [
      'Clear API contracts decouple frontend and backend development.',
    ],
    resources: makeResources({
      skill: 'APIs',
      officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
      officialTitle: 'MDN HTTP Response Status Codes',
      tutorialUrl: 'https://restfulapi.net/',
      tutorialTitle: 'RESTful API Design Guide',
      courseUrl: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
      courseTitle: 'freeCodeCamp Back End & APIs',
      youtubeQuery: 'REST API design best practices tutorial',
      githubQuery: 'rest api express zod example',
    }),
  },

  database: {
    skill: 'Database',
    introduction:
      'Databases persist application state reliably across restarts and deployments. Understanding schema modeling, indexing, and user-scoped queries is essential for every backend and full-stack engineer.',
    objectives: [
      'Compare relational (SQL) and document (NoSQL) modeling trade-offs',
      'Design schemas with proper references, constraints, and indexes',
      'Write scoped queries that prevent cross-user data leaks',
    ],
    topics: [
      {
        id: 'db-modeling-indexing',
        title: 'Schema Modeling, References & Indexing',
        estimatedMinutes: 45,
        explanation: [
          'Embed sub-documents when data is small, bounded, and always read together (such as tasks inside a user’s roadmap). Reference separate collections when data grows unboundedly (such as logs or assessments).',
          'Indexes speed up queries on frequently filtered fields like userId or email, avoiding full collection scans.',
        ],
        concepts: [
          { term: 'Index', definition: 'A data structure (typically B-Tree) that accelerates lookups at a small write-overhead cost.' },
          { term: 'User-Scoped Query', definition: 'Always filtering by userId: req.user.id so users can only read or modify their own records.' },
        ],
        codeExample: {
          title: 'Indexed Mongoose Schema Example',
          language: 'typescript',
          code: `const RoadmapProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    targetRole: { type: String, required: true },
    tasks: [RoadmapTaskSubSchema],
  },
  { timestamps: true }
);`,
          notes: 'unique: true on userId guarantees one roadmap document per student.',
        },
        stepByStepGuidance: [
          'Identify your primary query patterns before finalizing your schema.',
          'Add indexes to foreign keys (userId) and sort keys (createdAt).',
        ],
        keyTakeaways: [
          'Design schemas around how your application queries and updates data.',
        ],
      },
    ],
    exercises: [
      'Design a schema for users, profiles, and learning progress with appropriate indexes.',
    ],
    miniProjects: [
      {
        title: 'Multi-Collection Student Progress Store',
        description: 'Model and query user-scoped records with validation and compound indexes.',
        deliverables: ['Normalized/embedded schemas', 'Indexed queries', 'CRUD integration test'],
      },
    ],
    keyTakeaways: [
      'Good schema design and indexing prevent performance bottlenecks as data grows.',
    ],
    resources: makeResources({
      skill: 'Database',
      officialUrl: 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/',
      officialTitle: 'MongoDB Data Modeling Guide',
      tutorialUrl: 'https://www.postgresql.org/docs/current/tutorial.html',
      tutorialTitle: 'PostgreSQL Official Tutorial',
      youtubeQuery: 'Database design and indexing tutorial SQL NoSQL',
      githubQuery: 'database schema design examples',
    }),
  },

  mongodb: {
    skill: 'MongoDB',
    introduction:
      'MongoDB is a document database storing JSON-like BSON records. Paired with Mongoose and MongoDB Atlas, it provides flexible schemas, validation, and cloud persistence.',
    objectives: [
      'Model Mongoose schemas with validation, defaults, and timestamps',
      'Perform atomic updates with findOneAndUpdate and $set/$addToSet',
      'Connect securely to MongoDB Atlas using connection pooling in serverless environments',
    ],
    topics: [
      {
        id: 'mongodb-mongoose-crud',
        title: 'Mongoose Schemas, Connection Caching & Atomic Updates',
        estimatedMinutes: 40,
        explanation: [
          'In serverless runtimes like Vercel, cache the Mongoose connection promise on globalThis so warm invocations reuse the existing socket pool instead of opening new connections on every request.',
          'Use .lean() on read-only queries to return plain JavaScript objects for faster serialization.',
        ],
        concepts: [
          { term: 'Connection Caching', definition: 'Storing the active Mongoose connection promise in a module/global cache across serverless invocations.' },
          { term: '.lean()', definition: 'Tells Mongoose to skip hydrating full Document instances on read-only queries.' },
        ],
        codeExample: {
          title: 'Upsert Progress in Mongoose',
          language: 'typescript',
          code: `const updated = await RoadmapProgressModel.findOneAndUpdate(
  { userId: req.user.id },
  { $set: { targetRole: 'Full Stack Developer' } },
  { returnDocument: 'after', upsert: true }
).lean();`,
          notes: 'returnDocument: "after" returns the newly updated document instead of the old one.',
        },
        stepByStepGuidance: [
          'Define a Mongoose schema with required fields and enum constraints.',
          'Test upserting and querying documents scoped to userId.',
        ],
        keyTakeaways: [
          'Never hardcode MONGODB_URI in source files; always load it from environment variables.',
        ],
      },
    ],
    exercises: [
      'Implement a Mongoose model with subdocuments and a user-scoped update endpoint.',
    ],
    miniProjects: [
      {
        title: 'MongoDB Atlas Persistence Layer',
        description: 'Build a cached Atlas connection helper and CRUD service with Mongoose.',
        deliverables: ['Cached db.ts helper', 'Validated schemas', 'User-scoped queries'],
      },
    ],
    keyTakeaways: [
      'Connection caching and schema validation make MongoDB reliable in production.',
    ],
    resources: makeResources({
      skill: 'MongoDB',
      officialUrl: 'https://www.mongodb.com/docs/atlas/',
      officialTitle: 'MongoDB Atlas Documentation',
      tutorialUrl: 'https://mongoosejs.com/docs/guide.html',
      tutorialTitle: 'Mongoose Official Guide',
      courseUrl: 'https://learn.mongodb.com/',
      courseTitle: 'MongoDB University Free Courses',
      youtubeQuery: 'MongoDB Atlas Mongoose Node.js tutorial',
      githubQuery: 'mongodb mongoose express starter',
    }),
  },

  sql: {
    skill: 'SQL',
    introduction:
      'Structured Query Language (SQL) is the standard language for querying and analyzing relational databases across engineering and data analytics roles.',
    objectives: [
      'Filter, sort, and aggregate rows with WHERE, GROUP BY, and HAVING',
      'Combine tables accurately using INNER, LEFT, and SELF JOINs',
      'Write readable multi-step queries using CTEs (WITH) and window functions',
    ],
    topics: [
      {
        id: 'sql-joins-aggregations',
        title: 'JOINs, GROUP BY & Window Functions',
        estimatedMinutes: 45,
        explanation: [
          'INNER JOIN returns rows matching in both tables, while LEFT JOIN preserves all rows from the left table even when no match exists on the right.',
          'Window functions (ROW_NUMBER(), RANK(), SUM() OVER) compute rankings and running totals without collapsing rows like GROUP BY does.',
        ],
        concepts: [
          { term: 'CTE (Common Table Expression)', definition: 'A named temporary result set defined with WITH that makes complex queries modular.' },
          { term: 'WHERE vs HAVING', definition: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.' },
        ],
        codeExample: {
          title: 'Ranking Skills by Completion Hours',
          language: 'sql',
          code: `WITH role_hours AS (
  SELECT
    target_role,
    skill,
    SUM(estimated_hours) AS total_hours
  FROM roadmap_tasks
  WHERE status = 'Completed'
  GROUP BY target_role, skill
)
SELECT
  target_role,
  skill,
  total_hours,
  RANK() OVER (PARTITION BY target_role ORDER BY total_hours DESC) AS skill_rank
FROM role_hours;`,
          notes: 'CTEs break analytical queries into clear, testable steps.',
        },
        stepByStepGuidance: [
          'Write a query joining students with their assessments using LEFT JOIN.',
          'Add a window function to rank scores within each branch.',
        ],
        keyTakeaways: [
          'Use CTEs to avoid deeply nested subqueries.',
        ],
      },
    ],
    exercises: [
      'Solve 10 SQL queries covering LEFT JOINs, GROUP BY/HAVING, and ROW_NUMBER().',
    ],
    miniProjects: [
      {
        title: 'Placement Analytics SQL Workbook',
        description: 'Write analytical queries summarizing student readiness by degree track and skill coverage.',
        deliverables: ['Normalized schema', '5+ CTE/window queries', 'Index recommendations'],
      },
    ],
    keyTakeaways: [
      'SQL fluency is tested in almost every backend, data analyst, and data scientist interview.',
    ],
    resources: makeResources({
      skill: 'SQL',
      officialUrl: 'https://www.postgresql.org/docs/current/sql.html',
      officialTitle: 'PostgreSQL SQL Reference',
      tutorialUrl: 'https://www.w3schools.com/sql/',
      tutorialTitle: 'W3Schools SQL Tutorial',
      courseUrl: 'https://www.kaggle.com/learn/intro-to-sql',
      courseTitle: 'Kaggle Intro to SQL (Free)',
      youtubeQuery: 'SQL joins CTEs window functions tutorial',
      githubQuery: 'sql practice queries analytical',
    }),
  },

  git: {
    skill: 'Git',
    introduction:
      'Git is the distributed version control system used across software teams to track history, collaborate via branches and pull requests, and roll back regressions safely.',
    objectives: [
      'Stage, commit, branch, and merge changes cleanly',
      'Resolve merge conflicts without losing teammate work',
      'Use .gitignore, status, diff, and pull requests effectively',
    ],
    topics: [
      {
        id: 'git-branching-prs',
        title: 'Branching, Atomic Commits & Merge Conflicts',
        estimatedMinutes: 35,
        explanation: [
          'Never commit secrets (.env) or build artifacts (node_modules/, dist/)—configure .gitignore from day one.',
          'Work on feature branches (git checkout -b feat/learning-guide), review your diff before committing, and write descriptive commit messages.',
        ],
        concepts: [
          { term: 'Staging Area', definition: 'The index where you select exact changes (git add) before recording a snapshot (git commit).' },
          { term: 'Merge Conflict', definition: 'Occurs when two branches edit the same lines and Git asks you to choose the final result.' },
        ],
        codeExample: {
          title: 'Daily Feature Branch Workflow',
          language: 'bash',
          code: `git checkout -b feat/roadmap-learning-view
git status
git diff
git add src/pages/RoadmapPage.tsx
git commit -m "Add Start Learning navigation to roadmap tasks"
git push -u origin feat/roadmap-learning-view`,
          notes: 'Checking git status and git diff before committing catches accidental debug logs.',
        },
        stepByStepGuidance: [
          'Create a feature branch, make an edit, inspect git diff, and commit.',
          'Simulate a conflict between two branches and resolve it cleanly.',
        ],
        keyTakeaways: [
          'Small, focused commits make code reviews and rollbacks effortless.',
        ],
      },
    ],
    exercises: [
      'Create a branch, commit two changes, and open a pull request on GitHub.',
    ],
    miniProjects: [
      {
        title: 'Clean Open-Source Workflow Repo',
        description: 'Set up a repository with .gitignore, README, branch commits, and tagged release v1.0.0.',
        deliverables: ['Clean commit history', 'Proper .gitignore', 'Documented PR'],
      },
    ],
    keyTakeaways: [
      'Git confidence protects your work and speeds up team collaboration.',
    ],
    resources: makeResources({
      skill: 'Git',
      officialUrl: 'https://git-scm.com/doc',
      officialTitle: 'Git Official Documentation',
      tutorialUrl: 'https://learngitbranching.js.org/',
      tutorialTitle: 'Learn Git Branching (Interactive)',
      youtubeQuery: 'Git and GitHub tutorial for beginners',
      githubQuery: 'git workflow cheat sheet',
    }),
  },

  docker: {
    skill: 'Docker',
    introduction:
      'Docker packages an application and its exact runtime dependencies into portable containers so software runs identically on your laptop and in production.',
    objectives: [
      'Write clean, layered Dockerfiles using multi-stage builds',
      'Orchestrate multi-container stacks (app + database) with Docker Compose',
      'Keep images small and secure with .dockerignore and non-root users',
    ],
    topics: [
      {
        id: 'docker-multi-stage',
        title: 'Images, Containers & Multi-Stage Dockerfiles',
        estimatedMinutes: 45,
        explanation: [
          'Docker caches each instruction layer. Copy package.json and run npm ci BEFORE copying your source code so dependency installation is cached when only app code changes.',
          'Multi-stage builds compile TypeScript/Vite in a builder stage and copy only production artifacts into a slim final image.',
        ],
        concepts: [
          { term: 'Image vs Container', definition: 'An image is a read-only blueprint; a container is a running instance of that image.' },
          { term: '.dockerignore', definition: 'Excludes node_modules, .git, and .env from the Docker build context.' },
        ],
        codeExample: {
          title: 'Multi-Stage Node.js Dockerfile',
          language: 'dockerfile',
          code: `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "server.ts"]`,
          notes: 'Ordering package*.json copy before COPY . . maximizes Docker layer cache hits.',
        },
        stepByStepGuidance: [
          'Add a .dockerignore excluding node_modules and .env.',
          'Build and run your container locally and verify health checks.',
        ],
        keyTakeaways: [
          'Never bake .env secrets into a Docker image; pass them at runtime.',
        ],
      },
    ],
    exercises: [
      'Containerize a Node.js + Vite app and verify it responds on port 3000.',
    ],
    miniProjects: [
      {
        title: 'Dockerized Full-Stack Dev Environment',
        description: 'Write a Dockerfile and compose.yml linking an Express API to a local MongoDB container.',
        deliverables: ['Multi-stage Dockerfile', '.dockerignore', 'compose.yml'],
      },
    ],
    keyTakeaways: [
      'Containers eliminate "works on my machine" environment drift.',
    ],
    resources: makeResources({
      skill: 'Docker',
      officialUrl: 'https://docs.docker.com/get-started/',
      officialTitle: 'Docker Official Get Started Guide',
      tutorialUrl: 'https://docs.docker.com/build/building/multi-stage/',
      tutorialTitle: 'Docker Multi-Stage Builds',
      youtubeQuery: 'Docker tutorial for beginners Dockerfile compose',
      githubQuery: 'docker node react compose example',
    }),
  },

  testing: {
    skill: 'Testing',
    introduction:
      'Automated testing verifies that your business logic, API endpoints, and UI workflows continue working as your codebase evolves.',
    objectives: [
      'Write fast, deterministic unit tests for pure domain functions using Vitest',
      'Build API integration tests verifying auth, validation, and status codes',
      'Structure tests with Arrange-Act-Assert for clarity',
    ],
    topics: [
      {
        id: 'testing-unit-integration',
        title: 'Unit Tests vs Integration Tests (Vitest)',
        estimatedMinutes: 40,
        explanation: [
          'Unit tests validate pure logic (skill gap matching, Zod schemas, preprocessing math) in milliseconds with no network or database.',
          'Integration tests spin up your Express app on an ephemeral port and verify real HTTP requests, authentication guards (401/403), and database persistence.',
        ],
        concepts: [
          { term: 'Arrange-Act-Assert', definition: 'The three-step structure of a readable test: set up inputs, call the unit under test, verify the output.' },
          { term: 'Regression Test', definition: 'A test added after fixing a bug to guarantee the bug never returns.' },
        ],
        codeExample: {
          title: 'Vitest Unit Test Example',
          language: 'typescript',
          code: `import { describe, expect, it } from 'vitest';
import { analyzeSkillGap } from '../../src/lib/careerRoles';

describe('analyzeSkillGap', () => {
  it('identifies missing required skills accurately', () => {
    const report = analyzeSkillGap(['HTML', 'CSS', 'Git'], 'Full Stack Developer');
    expect(report.matchedRequired).toContain('HTML');
    expect(report.missingRequired).toContain('React');
  });
});`,
          notes: 'Testing edge cases (empty arrays, invalid inputs) gives the highest confidence.',
        },
        stepByStepGuidance: [
          'Write unit tests for boundary values (0, max, empty input).',
          'Add an integration test verifying unauthenticated requests return 401.',
        ],
        keyTakeaways: [
          'Test behavior and contracts, not internal implementation details.',
        ],
      },
    ],
    exercises: [
      'Add unit tests for a validation schema and a data transformation function.',
    ],
    miniProjects: [
      {
        title: 'Automated API & Domain Test Suite',
        description: 'Build a Vitest suite covering domain logic, Zod schemas, and Express endpoints.',
        deliverables: ['Unit test file', 'API integration test', 'Passing npm test run'],
      },
    ],
    keyTakeaways: [
      'Tests turn refactoring from risky guesswork into a confident routine.',
    ],
    resources: makeResources({
      skill: 'Testing',
      officialUrl: 'https://vitest.dev/guide/',
      officialTitle: 'Vitest Official Guide',
      tutorialUrl: 'https://playwright.dev/docs/intro',
      tutorialTitle: 'Playwright End-to-End Testing Docs',
      youtubeQuery: 'Vitest unit and integration testing TypeScript tutorial',
      githubQuery: 'vitest express typescript testing example',
    }),
  },

  python: {
    skill: 'Python',
    introduction:
      'Python is the primary language for data science, machine learning, scripting, and backend automation due to its readable syntax and rich scientific ecosystem.',
    objectives: [
      'Write clean Python using list/dict comprehensions, type hints, and pathlib',
      'Manage isolated virtual environments (.venv) and dependencies',
      'Structure reusable modules with pytest unit tests',
    ],
    topics: [
      {
        id: 'python-modern-basics',
        title: 'Data Structures, Type Hints & Virtual Environments',
        estimatedMinutes: 45,
        explanation: [
          'Always isolate project dependencies inside a virtual environment (python -m venv .venv) so packages never conflict globally.',
          'Python type hints (def clean_rows(rows: list[dict]) -> list[dict]:) document function contracts cleanly.',
        ],
        concepts: [
          { term: 'Virtual Environment', definition: 'An isolated Python interpreter and site-packages directory per project.' },
          { term: 'List Comprehension', definition: 'Concise syntax [x * 2 for x in items if x > 0] for transforming sequences.' },
        ],
        codeExample: {
          title: 'Typed Python Data Helper',
          language: 'python',
          code: `from pathlib import Path
import json

def summarize_scores(scores: list[float]) -> dict[str, float]:
    if not scores:
        return {"count": 0, "average": 0.0}
    return {
        "count": len(scores),
        "average": round(sum(scores) / len(scores), 2),
    }

print(summarize_scores([78.5, 84.0, 91.2]))`,
          notes: 'Guard against empty lists before dividing by len(scores).',
        },
        stepByStepGuidance: [
          'Create a .venv and install packages cleanly.',
          'Write a module using pathlib.Path instead of hardcoded string paths.',
        ],
        keyTakeaways: [
          'Use virtual environments and type hints on every Python project.',
        ],
      },
    ],
    exercises: [
      'Write a Python script that reads a CSV file, cleans whitespace, and outputs summary JSON.',
    ],
    miniProjects: [
      {
        title: 'Reproducible Python CSV Auditor',
        description: 'Build a CLI script that checks missing values, duplicates, and numeric ranges in a dataset.',
        deliverables: ['pathlib file handling', 'Type-annotated functions', 'pytest checks'],
      },
    ],
    keyTakeaways: [
      'Clean Python fundamentals unlock Pandas, Scikit-Learn, and backend automation.',
    ],
    resources: makeResources({
      skill: 'Python',
      officialUrl: 'https://docs.python.org/3/tutorial/',
      officialTitle: 'Python Official Tutorial',
      tutorialUrl: 'https://www.w3schools.com/python/',
      tutorialTitle: 'W3Schools Python Tutorial',
      courseUrl: 'https://www.kaggle.com/learn/python',
      courseTitle: 'Kaggle Python Course (Free)',
      youtubeQuery: 'Python programming full course for beginners',
      githubQuery: 'python beginner data projects',
    }),
  },

  pandas: {
    skill: 'Pandas',
    introduction:
      'Pandas provides DataFrames for inspecting, cleaning, merging, and aggregating tabular datasets in Python.',
    objectives: [
      'Load CSV/JSON files and inspect missing values, dtypes, and duplicates',
      'Filter, group, and aggregate tabular data with groupby()',
      'Export clean datasets without mutating raw source files',
    ],
    topics: [
      {
        id: 'pandas-cleaning-groupby',
        title: 'DataFrame Inspection, Cleaning & GroupBy',
        estimatedMinutes: 45,
        explanation: [
          'Start every analysis by checking df.info(), df.isna().sum(), and df.duplicated().sum() to catch data quality issues early.',
          'Use .loc[] for explicit label-based indexing to avoid SettingWithCopyWarning.',
        ],
        concepts: [
          { term: 'DataFrame', definition: 'A 2D labeled tabular data structure with columns of potentially different types.' },
          { term: 'GroupBy', definition: 'Splitting data into groups, applying an aggregation (mean, count), and combining results.' },
        ],
        codeExample: {
          title: 'Cleaning & Grouping Placement Data',
          language: 'python',
          code: `import pandas as pd

df = pd.read_csv("ml/dataset/Placement_Data_Full_Class.csv")
df = df.drop_duplicates().copy()

summary = (
    df.groupby("degree_t", as_index=False)["degree_p"]
    .agg(count="count", avg_degree_pct="mean")
)
print(summary)`,
          notes: 'Chaining .copy() after filtering guarantees you are working on an independent DataFrame.',
        },
        stepByStepGuidance: [
          'Inspect shape, null counts, and duplicate rows on a real CSV.',
          'Compute grouped averages and export a clean summary table.',
        ],
        keyTakeaways: [
          'Always audit duplicates and missing values before training models or building charts.',
        ],
      },
    ],
    exercises: [
      'Load a CSV dataset, drop duplicates, impute missing numeric values, and compute group summaries.',
    ],
    miniProjects: [
      {
        title: 'Exploratory Placement Dataset Report',
        description: 'Write a Pandas script generating clean JSON summary statistics from raw student records.',
        deliverables: ['Null & duplicate audit', 'GroupBy aggregations', 'Clean CSV export'],
      },
    ],
    keyTakeaways: [
      'Data quality determines model and dashboard quality.',
    ],
    resources: makeResources({
      skill: 'Pandas',
      officialUrl: 'https://pandas.pydata.org/docs/user_guide/10min.html',
      officialTitle: '10 Minutes to Pandas (Official Docs)',
      tutorialUrl: 'https://www.w3schools.com/python/pandas/default.asp',
      tutorialTitle: 'W3Schools Pandas Tutorial',
      courseUrl: 'https://www.kaggle.com/learn/pandas',
      courseTitle: 'Kaggle Pandas Course (Free)',
      youtubeQuery: 'Pandas Python data analysis tutorial',
      githubQuery: 'pandas exploratory data analysis examples',
    }),
  },

  numpy: {
    skill: 'NumPy',
    introduction:
      'NumPy provides fast, vectorized multi-dimensional arrays and mathematical operations that power Pandas, Scikit-Learn, and deep learning frameworks.',
    objectives: [
      'Create and reshape typed arrays (np.float32) for ML inference',
      'Use vectorized arithmetic and broadcasting instead of Python loops',
      'Compute summary statistics, norms, and matrix operations',
    ],
    topics: [
      {
        id: 'numpy-vectorization',
        title: 'Vectorized Arrays, Shapes & Broadcasting',
        estimatedMinutes: 35,
        explanation: [
          'Vectorized NumPy operations run in compiled C loops, making them orders of magnitude faster than Python for-loops.',
          'Always verify array shapes (arr.shape) and dtypes (np.float32) when preparing feature vectors for ONNX or ML models.',
        ],
        concepts: [
          { term: 'Broadcasting', definition: 'NumPy’s rules for performing element-wise operations on arrays of compatible shapes.' },
          { term: 'dtype', definition: 'The fixed data type of every element in an ndarray (e.g., float32, int64).' },
        ],
        codeExample: {
          title: 'Standardizing a Feature Vector',
          language: 'python',
          code: `import numpy as np

features = np.array([[80.0, 78.0, 75.0]], dtype=np.float32)
means = np.array([67.17, 66.40, 66.22], dtype=np.float32)
scales = np.array([10.50, 10.20, 7.30], dtype=np.float32)

standardized = (features - means) / scales
print(standardized.shape, standardized.dtype)`,
          notes: 'Matching float32 precision ensures parity between Python and browser ONNX inference.',
        },
        stepByStepGuidance: [
          'Standardize a 2D matrix using broadcasting.',
          'Verify shape (1, N) and dtype float32.',
        ],
        keyTakeaways: [
          'Avoid element-by-element Python loops on numerical arrays.',
        ],
      },
    ],
    exercises: [
      'Implement z-score standardization and cosine similarity using pure NumPy.',
    ],
    miniProjects: [
      {
        title: 'Numerical Feature Preprocessor',
        description: 'Build a NumPy module that standardizes numeric features and validates shapes.',
        deliverables: ['Vectorized scaler', 'Shape assertions', 'float32 output'],
      },
    ],
    keyTakeaways: [
      'Understanding shapes and dtypes prevents subtle ML bugs.',
    ],
    resources: makeResources({
      skill: 'NumPy',
      officialUrl: 'https://numpy.org/doc/stable/user/quickstart.html',
      officialTitle: 'NumPy Quickstart Guide',
      tutorialUrl: 'https://www.w3schools.com/python/numpy/default.asp',
      tutorialTitle: 'W3Schools NumPy Tutorial',
      youtubeQuery: 'NumPy Python tutorial broadcasting shapes',
      githubQuery: 'numpy vectorization exercises',
    }),
  },

  scikitlearn: {
    skill: 'Scikit-Learn',
    introduction:
      'Scikit-Learn is Python’s standard library for classical machine learning, offering preprocessing transformers, pipelines, cross-validation, and evaluation metrics.',
    objectives: [
      'Prevent data leakage by wrapping preprocessing inside Pipeline and ColumnTransformer',
      'Evaluate classifiers using 5-fold cross-validation, F1, precision/recall, and ROC-AUC',
      'Compare baseline models (Logistic Regression) against tree ensembles (Random Forest)',
    ],
    topics: [
      {
        id: 'sklearn-pipelines-cv',
        title: 'Leakage-Free Pipelines & Model Evaluation',
        estimatedMinutes: 50,
        explanation: [
          'Fitting a StandardScaler on the full dataset before train_test_split leaks test distribution statistics into training. Always fit transformers inside a Scikit-Learn Pipeline.',
          'Compare multiple models using stratified cross-validation and inspect confusion matrices rather than relying on accuracy alone.',
        ],
        concepts: [
          { term: 'Data Leakage', definition: 'When information from the test set influences training preprocessing or feature selection.' },
          { term: 'ROC-AUC', definition: 'Threshold-independent metric measuring how well a classifier ranks positive examples above negative ones.' },
        ],
        codeExample: {
          title: 'ColumnTransformer + RandomForest Pipeline',
          language: 'python',
          code: `from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), ["ssc_p", "hsc_p", "degree_p"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["hsc_s", "degree_t"]),
])

model = Pipeline([
    ("prep", preprocessor),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42)),
])`,
          notes: 'Pipeline guarantees test data is transformed using only training-fold statistics.',
        },
        stepByStepGuidance: [
          'Split data with train_test_split(..., stratify=y).',
          'Run cross_validate with accuracy, f1, and roc_auc.',
        ],
        keyTakeaways: [
          'Always use Pipeline + ColumnTransformer to prevent data leakage.',
        ],
      },
    ],
    exercises: [
      'Train LogisticRegression and RandomForestClassifier on a binary classification dataset and compare ROC-AUC.',
    ],
    miniProjects: [
      {
        title: 'Reproducible Classifier Benchmark',
        description: 'Build a Python training script outputting 5-fold CV metrics and holdout confusion matrices.',
        deliverables: ['ColumnTransformer pipeline', 'CV comparison JSON', 'Confusion matrix report'],
      },
    ],
    keyTakeaways: [
      'Rigorous evaluation and leakage prevention matter more than complex hyperparameter tuning.',
    ],
    resources: makeResources({
      skill: 'Scikit-Learn',
      officialUrl: 'https://scikit-learn.org/stable/getting_started.html',
      officialTitle: 'Scikit-Learn Getting Started',
      tutorialUrl: 'https://scikit-learn.org/stable/modules/compose.html',
      tutorialTitle: 'Pipelines and Composite Estimators',
      courseUrl: 'https://www.kaggle.com/learn/intro-to-machine-learning',
      courseTitle: 'Kaggle Intro to Machine Learning (Free)',
      youtubeQuery: 'Scikit-Learn Pipeline ColumnTransformer tutorial',
      githubQuery: 'scikit-learn pipeline classification example',
    }),
  },

  onnx: {
    skill: 'ONNX',
    introduction:
      'Open Neural Network Exchange (ONNX) is a portable model format allowing models trained in Python to run deterministically in Node.js or directly in the browser via ONNX Runtime Web.',
    objectives: [
      'Export Scikit-Learn classifiers to ONNX using skl2onnx',
      'Validate numerical parity between Python predictions and ONNX Runtime outputs',
      'Run browser-side WebAssembly inference cleanly with onnxruntime-web',
    ],
    topics: [
      {
        id: 'onnx-export-parity',
        title: 'Exporting Models & Verifying Numerical Parity',
        estimatedMinutes: 40,
        explanation: [
          'When exporting a model to ONNX, your JavaScript/TypeScript preprocessing must reproduce the exact float32 feature order, standardization means/scales, and one-hot encoding used in Python.',
          'Always run an automated parity test comparing Python probabilities against ONNX Runtime outputs within 1e-4 tolerance.',
        ],
        concepts: [
          { term: 'ONNX Runtime Web', definition: 'WebAssembly/WebGL runtime executing .onnx models directly in the browser.' },
          { term: 'Feature Schema Parity', definition: 'Guaranteeing identical preprocessing order and scaling between training and inference.' },
        ],
        codeExample: {
          title: 'Running ONNX Inference in TypeScript',
          language: 'typescript',
          code: `import * as ort from 'onnxruntime-web';

const session = await ort.InferenceSession.create('/models/employability_model.onnx');
const tensor = new ort.Tensor('float32', featureVector, [1, 15]);
const results = await session.run({ float_input: tensor });`,
          notes: 'Input tensor name (float_input) and shape ([1, 15]) must match the exported ONNX graph.',
        },
        stepByStepGuidance: [
          'Export a trained classifier with zipmap=False for clean probability tensors.',
          'Verify parity across at least 10 test samples.',
        ],
        keyTakeaways: [
          'ONNX removes Python runtime dependencies from your web deployment.',
        ],
      },
    ],
    exercises: [
      'Verify ONNX model input/output tensor names and run inference on a sample feature vector.',
    ],
    miniProjects: [
      {
        title: 'Zero-Server-ML Browser Predictor',
        description: 'Load an exported ONNX model in React and compare outputs against saved Python validation JSON.',
        deliverables: ['Float32 encoder', 'ONNX Runtime loader', 'Parity test'],
      },
    ],
    keyTakeaways: [
      'Exact preprocessing parity is the key to trustworthy client-side ML.',
    ],
    resources: makeResources({
      skill: 'ONNX',
      officialUrl: 'https://onnxruntime.ai/docs/get-started/with-javascript/web.html',
      officialTitle: 'ONNX Runtime Web Documentation',
      tutorialUrl: 'https://onnx.ai/sklearn-onnx/',
      tutorialTitle: 'sklearn-onnx Export Guide',
      youtubeQuery: 'ONNX Runtime Web JavaScript tutorial',
      githubQuery: 'onnxruntime-web react example',
    }),
  },

  linux: {
    skill: 'Linux',
    introduction:
      'Linux powers the vast majority of cloud servers, containers, and CI/CD runners. Comfort in the shell makes debugging deployments and automating tasks fast.',
    objectives: [
      'Navigate directories, inspect logs (grep, tail, less), and manage processes',
      'Understand file permissions (chmod, chown) and environment variables',
      'Write safe Bash scripts for build and health-check automation',
    ],
    topics: [
      {
        id: 'linux-shell-permissions',
        title: 'Shell Navigation, Pipes & File Permissions',
        estimatedMinutes: 40,
        explanation: [
          'Unix tools follow a simple philosophy: small commands do one thing well and compose with pipes (|). Combine grep, sort, and wc to inspect server logs in seconds.',
          'File permissions use r (4), w (2), x (1) for owner, group, and others (for example, chmod 755 script.sh).',
        ],
        concepts: [
          { term: 'Standard Streams', definition: 'stdin (0), stdout (1), and stderr (2) used for piping and redirecting command output.' },
          { term: 'Process Signals', definition: 'SIGTERM (graceful shutdown) and SIGKILL (immediate termination) sent to running services.' },
        ],
        codeExample: {
          title: 'Inspecting Ports & Logs in Bash',
          language: 'bash',
          code: `#!/usr/bin/env bash
set -euo pipefail

echo "Checking Node.js processes..."
ps aux | grep node || true
tail -n 50 server.log | grep -i "error" || echo "No recent errors"`,
          notes: 'set -euo pipefail ensures scripts fail fast on unexpected errors.',
        },
        stepByStepGuidance: [
          'Practice chaining ls, grep, and wc -l with pipes.',
          'Inspect permissions with ls -la and test chmod on a local script.',
        ],
        keyTakeaways: [
          'Use set -euo pipefail at the top of Bash scripts.',
        ],
      },
    ],
    exercises: [
      'Write a Bash script that checks if required commands (node, git) exist and reports their versions.',
    ],
    miniProjects: [
      {
        title: 'Server Health & Log Audit Script',
        description: 'Create a Bash script that checks disk space, listening ports, and recent error log entries.',
        deliverables: ['Executable .sh script', 'Proper exit codes', 'Clear output summary'],
      },
    ],
    keyTakeaways: [
      'Linux CLI fluency pays off across backend, cloud, and DevOps roles.',
    ],
    resources: makeResources({
      skill: 'Linux',
      officialUrl: 'https://ubuntu.com/tutorials/command-line-for-beginners',
      officialTitle: 'Ubuntu Command Line for Beginners',
      tutorialUrl: 'https://linuxjourney.com/',
      tutorialTitle: 'Linux Journey Interactive Guide',
      youtubeQuery: 'Linux command line crash course bash scripting',
      githubQuery: 'bash scripting examples linux',
    }),
  },

  networking: {
    skill: 'Networking',
    introduction:
      'Every web request travels over DNS, TCP/IP, TLS, and HTTP. Understanding these layers helps you debug CORS errors, proxy routing, latency, and security headers.',
    objectives: [
      'Trace a browser request from DNS lookup through TCP/TLS handshake to HTTP response',
      'Inspect HTTP headers, cookies, caching directives, and CORS policies',
      'Understand ports, localhost vs 0.0.0.0, and reverse proxies',
    ],
    topics: [
      {
        id: 'networking-http-tls',
        title: 'DNS, TCP/TLS, HTTP Headers & CORS',
        estimatedMinutes: 45,
        explanation: [
          'Binding a server to 0.0.0.0 listens on all network interfaces, while clients connect via localhost (127.0.0.1) or a domain name.',
          'CORS (Cross-Origin Resource Sharing) is a browser security policy controlling which origins may read responses from an API.',
        ],
        concepts: [
          { term: 'TLS Handshake', definition: 'Cryptographic negotiation establishing encrypted HTTPS communication and verifying server identity.' },
          { term: 'Reverse Proxy', definition: 'A server (like Nginx or Vercel Edge) forwarding client requests to backend services.' },
        ],
        codeExample: {
          title: 'Inspecting HTTP Headers with curl',
          language: 'bash',
          code: `curl -i http://localhost:3000/api/health
# Check DNS resolution and TLS certificate details:
curl -Iv https://example.com 2>&1 | head -n 25`,
          notes: 'curl -i prints response headers alongside the JSON body for quick debugging.',
        },
        stepByStepGuidance: [
          'Open browser DevTools Network tab and inspect request/response headers on an API call.',
          'Compare HTTP status codes and Set-Cookie flags (HttpOnly, SameSite).',
        ],
        keyTakeaways: [
          'Network DevTools and curl are your fastest tools for diagnosing API issues.',
        ],
      },
    ],
    exercises: [
      'Use curl -i and browser DevTools to inspect headers, status codes, and response timing.',
    ],
    miniProjects: [
      {
        title: 'HTTP & Security Header Audit',
        description: 'Document the request lifecycle and security headers for a local full-stack application.',
        deliverables: ['curl inspection log', 'Cookie flag checklist', 'CORS explanation'],
      },
    ],
    keyTakeaways: [
      'Understanding HTTP and DNS removes the mystery from deployment and auth bugs.',
    ],
    resources: makeResources({
      skill: 'Networking',
      officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
      officialTitle: 'MDN Overview of HTTP',
      tutorialUrl: 'https://howhttps.works/',
      tutorialTitle: 'How HTTPS Works',
      youtubeQuery: 'HTTP DNS TLS networking fundamentals for developers',
      githubQuery: 'networking fundamentals web developers',
    }),
  },

  cicd: {
    skill: 'CI/CD',
    introduction:
      'Continuous Integration and Continuous Deployment (CI/CD) automate linting, type-checking, testing, and production builds on every push or pull request.',
    objectives: [
      'Write a GitHub Actions workflow running install, lint, test, and build steps',
      'Protect main branches by gating merges on passing CI checks',
      'Manage deployment secrets safely without exposing them in logs',
    ],
    topics: [
      {
        id: 'cicd-github-actions',
        title: 'GitHub Actions Workflows & Build Gates',
        estimatedMinutes: 35,
        explanation: [
          'A CI pipeline runs in a fresh virtual machine on every pull request, catching missing dependencies, TypeScript errors, or failing tests before code is merged.',
          'Always use npm ci instead of npm install in CI for deterministic, lockfile-exact installs.',
        ],
        concepts: [
          { term: 'Continuous Integration', definition: 'Automatically verifying code changes with lint, tests, and builds on every commit.' },
          { term: 'npm ci', definition: 'Clean install strictly following package-lock.json.' },
        ],
        codeExample: {
          title: 'GitHub Actions Verification Workflow',
          language: 'yaml',
          code: `name: Verify CareerIQ
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`,
          notes: 'Caching npm speeds up repeated CI runs significantly.',
        },
        stepByStepGuidance: [
          'Create .github/workflows/ci.yml in a repository.',
          'Verify that lint, test, and build all pass cleanly on a fresh runner.',
        ],
        keyTakeaways: [
          'Automated CI gates catch broken builds before users ever see them.',
        ],
      },
    ],
    exercises: [
      'Write a GitHub Actions YAML workflow running lint, test, and build.',
    ],
    miniProjects: [
      {
        title: 'Automated PR Quality Gate',
        description: 'Configure a GitHub Actions workflow that runs TypeScript checks, Vitest, and Vite build.',
        deliverables: ['.github/workflows/ci.yml', 'Green workflow badge'],
      },
    ],
    keyTakeaways: [
      'If a check isn’t automated in CI, it will eventually be skipped.',
    ],
    resources: makeResources({
      skill: 'CI/CD',
      officialUrl: 'https://docs.github.com/en/actions/quickstart',
      officialTitle: 'GitHub Actions Quickstart',
      tutorialUrl: 'https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs',
      tutorialTitle: 'Building and Testing Node.js in GitHub Actions',
      youtubeQuery: 'GitHub Actions CI CD tutorial Node.js',
      githubQuery: 'github actions nodejs ci workflow',
    }),
  },

  authentication: {
    skill: 'Authentication',
    introduction:
      'Authentication verifies who a user is, while authorization (RBAC) controls what they are permitted to do. Secure auth relies on salted password hashing, signed tokens, and server-side checks.',
    objectives: [
      'Hash passwords securely using bcrypt or Argon2 (never plaintext or fast hashes)',
      'Issue signed JWTs stored in HttpOnly, SameSite cookies',
      'Enforce role-based access control (RBAC) on every protected server route',
    ],
    topics: [
      {
        id: 'auth-hashing-cookies',
        title: 'Password Hashing, HttpOnly Cookies & Server RBAC',
        estimatedMinutes: 45,
        explanation: [
          'Never store plaintext passwords or reversible encryption. Use bcrypt with a cost factor of 10–12.',
          'Storing JWTs in HttpOnly cookies prevents client-side JavaScript (and XSS scripts) from reading the session token, while server-side middleware verifies role claims on every admin request.',
        ],
        concepts: [
          { term: 'HttpOnly Cookie', definition: 'A cookie inaccessible to document.cookie in JavaScript, mitigating token theft via XSS.' },
          { term: 'RBAC', definition: 'Role-Based Access Control restricting endpoints (e.g. /api/admin/*) to verified roles on the server.' },
        ],
        codeExample: {
          title: 'Server-Side Role Guard Middleware',
          language: 'typescript',
          code: `export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }
  next();
}`,
          notes: 'Never trust role flags sent in the request body; always read role from the verified server session.',
        },
        stepByStepGuidance: [
          'Hash passwords on registration with bcrypt.hash(password, 10).',
          'Write integration tests confirming a student token gets 403 on admin routes.',
        ],
        keyTakeaways: [
          'UI hiding is convenience; server-side middleware is security.',
        ],
      },
    ],
    exercises: [
      'Implement register, login, logout, and a role-guarded route with integration tests.',
    ],
    miniProjects: [
      {
        title: 'Cookie-Based JWT Auth Service',
        description: 'Build an Express auth router with bcrypt hashing, HttpOnly cookies, and RBAC tests.',
        deliverables: ['Auth middleware', 'Password hashing', '401/403 integration tests'],
      },
    ],
    keyTakeaways: [
      'Always verify identity and permissions on the server for every request.',
    ],
    resources: makeResources({
      skill: 'Authentication',
      officialUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
      officialTitle: 'OWASP Authentication Cheat Sheet',
      tutorialUrl: 'https://jwt.io/introduction',
      tutorialTitle: 'JSON Web Tokens Introduction',
      youtubeQuery: 'JWT HttpOnly cookie authentication Node.js Express',
      githubQuery: 'express jwt httponly cookie auth',
    }),
  },

  datastructures: {
    skill: 'Data Structures',
    introduction:
      'Data structures organize information in memory so lookups, insertions, traversals, and updates stay fast as input sizes scale.',
    objectives: [
      'Choose between Arrays, Hash Maps/Sets, Stacks, Queues, Trees, Graphs, and Heaps',
      'Analyze Big-O time and space complexity for common operations',
      'Apply the right structure to eliminate nested O(n²) loops',
    ],
    topics: [
      {
        id: 'ds-maps-trees-graphs',
        title: 'Hash Maps, Stacks/Queues, Trees & Graphs',
        estimatedMinutes: 55,
        explanation: [
          'Hash maps and sets provide O(1) average-case lookups, turning O(n²) pair-finding or deduplication problems into O(n).',
          'Trees model hierarchical data (DOM, file systems, binary search trees), while graphs model arbitrary networks (prerequisites, routes, social connections).',
        ],
        concepts: [
          { term: 'Hash Map', definition: 'Key-value store offering O(1) average lookup, insert, and delete.' },
          { term: 'Adjacency List', definition: 'Space-efficient graph representation mapping each node to its list of neighbors.' },
        ],
        codeExample: {
          title: 'O(n) Two-Sum & Graph BFS',
          language: 'typescript',
          code: `function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return null;
}`,
          notes: 'Using a Map reduces lookup from O(n) scan to O(1), giving O(n) total time.',
        },
        stepByStepGuidance: [
          'Solve 5 hash map/set problems focusing on frequency counting and complements.',
          'Implement BFS (Queue) and DFS (Recursion/Stack) on an adjacency list.',
        ],
        keyTakeaways: [
          'Always ask: "Can a Hash Map or Set replace this inner loop?"',
        ],
      },
    ],
    exercises: [
      'Implement a Queue, Min-Heap, and Graph BFS traversal with unit tests.',
    ],
    miniProjects: [
      {
        title: 'Skill Prerequisite Graph Explorer',
        description: 'Model skills as a directed graph and compute valid study order using topological sort.',
        deliverables: ['Adjacency list', 'BFS/DFS traversal', 'Cycle detection'],
      },
    ],
    keyTakeaways: [
      'Picking the right data structure often solves half the algorithm problem.',
    ],
    resources: makeResources({
      skill: 'Data Structures',
      officialUrl: 'https://cp-algorithms.com/',
      officialTitle: 'CP-Algorithms Reference',
      tutorialUrl: 'https://visualgo.net/en',
      tutorialTitle: 'VisuAlgo Interactive Visualizations',
      courseUrl: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
      courseTitle: 'freeCodeCamp Algorithms & Data Structures',
      youtubeQuery: 'Data Structures and Algorithms full course',
      githubQuery: 'data structures algorithms typescript python',
    }),
  },

  algorithms: {
    skill: 'Algorithms',
    introduction:
      'Algorithms provide systematic strategies—two pointers, sliding window, binary search, recursion, greedy, and dynamic programming—for solving unfamiliar problems.',
    objectives: [
      'Recognize problem patterns (Sliding Window, Two Pointers, Binary Search, BFS/DFS, DP)',
      'Prove time and space complexity using Big-O notation',
      'Test edge cases systematically (empty input, single element, duplicates)',
    ],
    topics: [
      {
        id: 'algo-patterns-dp',
        title: 'Sliding Window, Binary Search & Dynamic Programming',
        estimatedMinutes: 55,
        explanation: [
          'Sliding window maintains a dynamic subarray range in O(n) instead of recomputing sums from scratch. Binary search halves the search space on monotonic predicates in O(log n).',
          'Dynamic programming breaks overlapping subproblems into cached states (top-down memoization or bottom-up tabulation).',
        ],
        concepts: [
          { term: 'Monotonic Predicate', definition: 'A boolean condition that flips from false to true once, enabling binary search on answers.' },
          { term: 'Memoization', definition: 'Caching recursive function results keyed by subproblem parameters.' },
        ],
        codeExample: {
          title: 'Binary Search Template',
          language: 'typescript',
          code: `function binarySearch(sorted: number[], target: number): number {
  let left = 0;
  let right = sorted.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
          notes: 'left + Math.floor((right - left) / 2) avoids integer overflow in typed languages.',
        },
        stepByStepGuidance: [
          'Practice 3 sliding-window problems and 3 binary-search problems.',
          'Write brute-force solutions first, then optimize with memoization.',
        ],
        keyTakeaways: [
          'State your brute-force complexity before optimizing.',
        ],
      },
    ],
    exercises: [
      'Implement binary search, merge sort, and 0/1 knapsack with unit tests.',
    ],
    miniProjects: [
      {
        title: 'Benchmarked Algorithm Toolkit',
        description: 'Implement core searching, sorting, and DP functions with Big-O notes and Vitest/pytest checks.',
        deliverables: ['Pattern implementations', 'Edge-case unit tests', 'Complexity notes'],
      },
    ],
    keyTakeaways: [
      'Pattern recognition comes from deliberate, spaced practice.',
    ],
    resources: makeResources({
      skill: 'Algorithms',
      officialUrl: 'https://cp-algorithms.com/',
      officialTitle: 'CP-Algorithms Reference',
      tutorialUrl: 'https://neetcode.io/roadmap',
      tutorialTitle: 'NeetCode Algorithm Roadmap',
      youtubeQuery: 'Algorithms sliding window binary search dynamic programming',
      githubQuery: 'algorithms patterns typescript python',
    }),
  },

  oop: {
    skill: 'OOP',
    introduction:
      'Object-Oriented Programming (OOP) organizes complex software around clear interfaces, encapsulation, composition, and SOLID design principles.',
    objectives: [
      'Apply encapsulation, abstraction, inheritance, and polymorphism appropriately',
      'Prefer composition over deep inheritance hierarchies',
      'Use SOLID principles to keep modules testable and extensible',
    ],
    topics: [
      {
        id: 'oop-solid-composition',
        title: 'SOLID Principles & Composition over Inheritance',
        estimatedMinutes: 40,
        explanation: [
          'Encapsulation hides internal state behind a minimal public interface. Dependency injection passes collaborators (such as a repository or logger) into a class so it can be tested without real databases.',
          'Prefer composing small interfaces rather than building brittle multi-level class hierarchies.',
        ],
        concepts: [
          { term: 'Single Responsibility', definition: 'A class or module should have one clear reason to change.' },
          { term: 'Dependency Inversion', definition: 'Depend on abstractions (interfaces) rather than concrete implementations.' },
        ],
        codeExample: {
          title: 'Interface-Driven Service Design',
          language: 'typescript',
          code: `interface ProgressStore {
  saveTopic(taskId: string, topicId: string): Promise<void>;
}

class LearningTracker {
  constructor(private readonly store: ProgressStore) {}

  async completeTopic(taskId: string, topicId: string): Promise<void> {
    if (!taskId || !topicId) throw new Error('Invalid IDs');
    await this.store.saveTopic(taskId, topicId);
  }
}`,
          notes: 'Passing ProgressStore via constructor makes LearningTracker trivial to unit test.',
        },
        stepByStepGuidance: [
          'Refactor a monolithic function into focused classes/interfaces.',
          'Inject dependencies via constructor parameters.',
        ],
        keyTakeaways: [
          'Keep interfaces small and favor composition over deep inheritance.',
        ],
      },
    ],
    exercises: [
      'Design a NotificationService supporting Email and In-App channels via a shared interface.',
    ],
    miniProjects: [
      {
        title: 'Modular Library Inventory Engine',
        description: 'Build an OOP domain model with typed interfaces and unit-tested business rules.',
        deliverables: ['Clean interfaces', 'Unit tests', 'Zero circular dependencies'],
      },
    ],
    keyTakeaways: [
      'Good OOP makes code easier to extend without rewriting existing callers.',
    ],
    resources: makeResources({
      skill: 'OOP',
      officialUrl: 'https://refactoring.guru/design-patterns',
      officialTitle: 'Refactoring.Guru Design Patterns',
      tutorialUrl: 'https://www.typescriptlang.org/docs/handbook/2/classes.html',
      tutorialTitle: 'TypeScript Classes & Interfaces',
      youtubeQuery: 'SOLID principles object oriented design tutorial',
      githubQuery: 'solid principles design patterns examples',
    }),
  },

  datavisualization: {
    skill: 'Data Visualization',
    introduction:
      'Data visualization turns raw numbers into clear, honest charts that reveal trends, distributions, and outliers at a glance.',
    objectives: [
      'Select the right chart type (bar, line, scatter, histogram) for each question',
      'Avoid misleading truncated axes, 3D clutter, and illegible labels',
      'Build responsive charts in React (Recharts) or Python (Matplotlib/Seaborn)',
    ],
    topics: [
      {
        id: 'dataviz-charts-ethics',
        title: 'Chart Selection & Visual Clarity',
        estimatedMinutes: 35,
        explanation: [
          'Use bar charts for categorical comparisons, line charts for time series, histograms for distributions, and scatter plots for relationships between two continuous variables.',
          'Always start bar chart value axes at zero so bar lengths remain proportional to values.',
        ],
        concepts: [
          { term: 'Data-Ink Ratio', definition: 'Maximizing the share of ink devoted to actual data rather than decorative gridlines.' },
          { term: 'Accessible Color', definition: 'Choosing high-contrast, colorblind-safe palettes paired with direct labels or tooltips.' },
        ],
        codeExample: {
          title: 'Responsive Bar Chart Pattern',
          language: 'tsx',
          code: `<ResponsiveContainer width="100%" height={260}>
  <BarChart data={roleCoverage}>
    <XAxis dataKey="role" tick={{ fontSize: 12 }} />
    <YAxis domain={[0, 100]} unit="%" />
    <Tooltip />
    <Bar dataKey="coverage" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>`,
          notes: 'Setting domain={[0, 100]} keeps percentage comparisons honest.',
        },
        stepByStepGuidance: [
          'Pair every chart with a clear title stating the key metric.',
          'Test chart responsiveness on a 375px mobile viewport.',
        ],
        keyTakeaways: [
          'Clarity beats decoration in every analytical chart.',
        ],
      },
    ],
    exercises: [
      'Build a comparison bar chart and a trend line chart from placement summary data.',
    ],
    miniProjects: [
      {
        title: 'Cohort Skills & Readiness Visual Report',
        description: 'Create 3 complementary charts communicating skill gaps, score distributions, and progress.',
        deliverables: ['Responsive charts', 'Zero-baseline bar axes', 'Clear legends & tooltips'],
      },
    ],
    keyTakeaways: [
      'Choose chart types based on the relationship you want the reader to see.',
    ],
    resources: makeResources({
      skill: 'Data Visualization',
      officialUrl: 'https://recharts.org/en-US/guide',
      officialTitle: 'Recharts Official Guide',
      tutorialUrl: 'https://www.data-to-viz.com/',
      tutorialTitle: 'From Data to Viz (Chart Selection Guide)',
      courseUrl: 'https://www.kaggle.com/learn/data-visualization',
      courseTitle: 'Kaggle Data Visualization Course (Free)',
      youtubeQuery: 'Data visualization best practices charts tutorial',
      githubQuery: 'recharts dashboard examples react',
    }),
  },

  statistics: {
    skill: 'Statistics',
    introduction:
      'Statistics provides the mathematical foundation for summarizing data, testing hypotheses, and evaluating predictive models honestly.',
    objectives: [
      'Interpret mean, median, standard deviation, and percentiles',
      'Distinguish correlation from causation and avoid sampling bias',
      'Evaluate classifiers with precision, recall, F1, and confusion matrices',
    ],
    topics: [
      {
        id: 'stats-metrics-distributions',
        title: 'Distributions, Hypothesis Testing & Classification Metrics',
        estimatedMinutes: 45,
        explanation: [
          'When data is skewed by outliers, median and IQR describe the center and spread far better than mean and standard deviation.',
          'Accuracy can mislead on imbalanced datasets. Precision measures false-positive control, while Recall measures how many true positives were caught.',
        ],
        concepts: [
          { term: 'Precision & Recall', definition: 'Precision = TP/(TP+FP); Recall = TP/(TP+FN).' },
          { term: 'Confidence Interval', definition: 'A range of plausible values for an unknown population parameter.' },
        ],
        codeExample: {
          title: 'Computing Precision, Recall & F1 in Python',
          language: 'python',
          code: `tp, fp, fn = 38, 4, 6
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * (precision * recall) / (precision + recall)
print(f"Precision={precision:.3f}, Recall={recall:.3f}, F1={f1:.3f}")`,
          notes: 'Inspecting FP and FN counts reveals the exact trade-offs your model makes.',
        },
        stepByStepGuidance: [
          'Compute mean vs median on a skewed salary or score column.',
          'Calculate precision, recall, and F1 from a 2x2 confusion matrix.',
        ],
        keyTakeaways: [
          'Always report class balance alongside accuracy.',
        ],
      },
    ],
    exercises: [
      'Compute descriptive statistics and a confusion matrix breakdown on a sample dataset.',
    ],
    miniProjects: [
      {
        title: 'Statistical Model Evaluation Brief',
        description: 'Write a short analytical report comparing two classifiers using F1, ROC-AUC, and error analysis.',
        deliverables: ['Descriptive stats table', 'Confusion matrix math', 'Limitation notes'],
      },
    ],
    keyTakeaways: [
      'Statistical literacy prevents overclaiming results from small or biased datasets.',
    ],
    resources: makeResources({
      skill: 'Statistics',
      officialUrl: 'https://www.khanacademy.org/math/statistics-probability',
      officialTitle: 'Khan Academy Statistics & Probability',
      tutorialUrl: 'https://seeing-theory.brown.edu/',
      tutorialTitle: 'Seeing Theory: Visual Probability & Statistics',
      youtubeQuery: 'Statistics for data science precision recall ROC AUC',
      githubQuery: 'statistics data science python notebooks',
    }),
  },

  excel: {
    skill: 'Excel',
    introduction:
      'Spreadsheets remain the fastest tool for ad-hoc data auditing, pivot summaries, and stakeholder reporting in analyst workflows.',
    objectives: [
      'Clean text and dates with TRIM, CLEAN, and text functions',
      'Join tables with XLOOKUP/INDEX-MATCH and summarize with PivotTables',
      'Build readable summary sheets with conditional formatting',
    ],
    topics: [
      {
        id: 'excel-lookups-pivots',
        title: 'XLOOKUP, Conditional Aggregation & PivotTables',
        estimatedMinutes: 35,
        explanation: [
          'Use COUNTIFS and SUMIFS for multi-criteria KPIs, and XLOOKUP (or INDEX/MATCH) instead of brittle VLOOKUP column numbers.',
          'PivotTables aggregate thousands of rows into clean cross-tabulations without writing complex array formulas.',
        ],
        concepts: [
          { term: 'Absolute Reference ($A$1)', definition: 'Locks cell coordinates when dragging formulas across rows or columns.' },
          { term: 'PivotTable', definition: 'Interactive summary table grouping and aggregating tabular records.' },
        ],
        codeExample: {
          title: 'Common Analyst Formulas',
          language: 'text',
          code: `=XLOOKUP(A2, Roles!$A$2:$A$12, Roles!$B$2:$B$12, "Not Found")
=AVERAGEIFS(Scores!C:C, Scores!B:B, "Sci&Tech", Scores!D:D, "Placed")
=IFERROR(C2/D2, 0)`,
          notes: 'Always wrap division in IFERROR to keep dashboards free of #DIV/0! errors.',
        },
        stepByStepGuidance: [
          'Convert raw data ranges into an Excel Table (Ctrl+T) so formulas auto-expand.',
          'Build a PivotTable comparing average CGPA by placement status.',
        ],
        keyTakeaways: [
          'Structure raw data as tidy tables with one header row and no merged cells.',
        ],
      },
    ],
    exercises: [
      'Create a PivotTable and XLOOKUP summary sheet from a placement CSV.',
    ],
    miniProjects: [
      {
        title: 'Cohort Readiness Workbook',
        description: 'Design a 2-tab spreadsheet separating raw data from a clean KPI summary dashboard.',
        deliverables: ['Tidy data tab', 'PivotTable summary', 'XLOOKUP & SUMIFS formulas'],
      },
    ],
    keyTakeaways: [
      'Clean raw data layout makes spreadsheet formulas simple and reliable.',
    ],
    resources: makeResources({
      skill: 'Excel',
      officialUrl: 'https://support.microsoft.com/en-us/excel',
      officialTitle: 'Microsoft Excel Official Help & Learning',
      tutorialUrl: 'https://www.w3schools.com/excel/',
      tutorialTitle: 'W3Schools Excel Tutorial',
      youtubeQuery: 'Excel for data analysts PivotTable XLOOKUP tutorial',
      githubQuery: 'excel data analysis templates',
    }),
  },

  cloudbasics: {
    skill: 'Cloud Basics',
    introduction:
      'Cloud platforms like Vercel, AWS, and GCP let you deploy web apps, serverless functions, and managed databases globally without maintaining physical servers.',
    objectives: [
      'Configure environment variables, build commands, and SPA/API rewrites',
      'Understand serverless functions vs persistent servers',
      'Apply least-privilege access and health check monitoring',
    ],
    topics: [
      {
        id: 'cloud-serverless-env',
        title: 'Serverless Deployments, Environment Variables & Health Checks',
        estimatedMinutes: 35,
        explanation: [
          'Never commit .env files. Store secrets like MONGODB_URI and AUTH_SECRET in your cloud provider’s encrypted environment variable settings.',
          'Serverless functions scale automatically to zero when idle, so database connections must be cached across invocations.',
        ],
        concepts: [
          { term: 'Environment Separation', definition: 'Using distinct secrets and databases for local development, preview, and production.' },
          { term: 'Health Endpoint', definition: 'A lightweight /api/health route verifying service availability.' },
        ],
        codeExample: {
          title: 'Vercel SPA + API Rewrite Config',
          language: 'json',
          code: `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/((?!ort/|models/|assets/).*)", "destination": "/index.html" }
  ]
}`,
          notes: 'Static assets and API routes are excluded from the SPA fallback rewrite.',
        },
        stepByStepGuidance: [
          'Verify your production build runs cleanly with npm run build.',
          'Confirm /api/health returns 200 OK after deployment.',
        ],
        keyTakeaways: [
          'Keep configuration in environment variables and verify health checks post-deploy.',
        ],
      },
    ],
    exercises: [
      'Audit a project’s .env.example and deployment configuration for missing variables.',
    ],
    miniProjects: [
      {
        title: 'Production Deployment Checklist & Runbook',
        description: 'Document build commands, required env vars, and rollback steps for a full-stack app.',
        deliverables: ['vercel.json review', 'Env var checklist', 'Health check verification'],
      },
    ],
    keyTakeaways: [
      'Repeatable builds and environment parity make cloud deployments boring—in the best way.',
    ],
    resources: makeResources({
      skill: 'Cloud Basics',
      officialUrl: 'https://vercel.com/docs',
      officialTitle: 'Vercel Official Documentation',
      tutorialUrl: 'https://docs.aws.amazon.com/gettingstarted/',
      tutorialTitle: 'AWS Getting Started Resource Center',
      youtubeQuery: 'Cloud computing basics serverless deployment tutorial',
      githubQuery: 'vercel express react deployment template',
    }),
  },
};

// Map aliases and additional skills cleanly so every roadmap task gets tailored content
const SKILL_ALIASES: Record<string, string> = {
  accessibility: 'html',
  statemanagement: 'react',
  websecurity: 'authentication',
  owasptop10: 'authentication',
  cryptography: 'authentication',
  scripting: 'linux',
  bugtracking: 'testing',
  playwright: 'testing',
  vitest: 'testing',
  pytest: 'testing',
  aws: 'cloudbasics',
  gcp: 'cloudbasics',
  terraform: 'cloudbasics',
  iam: 'cloudbasics',
  kubernetes: 'docker',
  monitoring: 'cloudbasics',
  redis: 'database',
  graphql: 'apis',
  powerbi: 'datavisualization',
  tableau: 'datavisualization',
  datacleaning: 'pandas',
  featureengineering: 'scikitlearn',
  jupyter: 'python',
  pytorch: 'scikitlearn',
  systemdesign: 'apis',
  java: 'oop',
  'c++': 'datastructures',
  cpp: 'datastructures',
};

function buildFallbackResources(skill: string): LearningResource[] {
  return makeResources({
    skill,
    officialUrl: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skill)}`,
    officialTitle: `MDN & Web Reference: ${skill}`,
    tutorialUrl: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(skill)}`,
    tutorialTitle: `freeCodeCamp Guides: ${skill}`,
    youtubeQuery: `${skill} full tutorial for beginners`,
    githubQuery: `${skill} learning projects examples`,
  });
}

export function getLearningGuideForTask(
  task: RoadmapTask,
  targetRole: string
): SkillLearningGuide {
  const rawKey = normalizeSkillKey(task.skill);
  const resolvedKey = GUIDE_CATALOG[rawKey]
    ? rawKey
    : SKILL_ALIASES[rawKey] && GUIDE_CATALOG[SKILL_ALIASES[rawKey]]
      ? SKILL_ALIASES[rawKey]
      : null;

  if (resolvedKey && !task.taskId.startsWith('custom-') && !task.taskId.includes('-adv-')) {
    const base = GUIDE_CATALOG[resolvedKey];
    // If matched via alias (e.g., Accessibility -> html), customize title/intro gently while keeping rich topics
    if (resolvedKey !== rawKey) {
      return {
        ...base,
        skill: task.skill,
        introduction: `${task.objective} This guide connects ${task.skill} directly to your ${targetRole} pathway.`,
        objectives: [task.objective, ...base.objectives.slice(0, 2)],
        resources: [
          ...buildFallbackResources(task.skill).slice(0, 2),
          ...base.resources.slice(2),
        ],
      };
    }
    return base;
  }

  // Dynamic structured guide for role capstones and student-added custom tasks
  const cleanSkill = task.skill.trim();
  const slug = normalizeSkillKey(cleanSkill) || 'custom-module';

  return {
    skill: cleanSkill,
    introduction: `${task.objective} Mastering ${cleanSkill} strengthens your readiness for ${targetRole} roles through structured reading, independent practice, and portfolio building.`,
    objectives: [
      task.objective,
      `Complete the core practice activity: ${task.practiceActivity}`,
      `Deliver a portfolio-ready artifact: ${task.projectSuggestion}`,
    ],
    topics: [
      {
        id: `${slug}-foundations`,
        title: `Core Concepts & Mental Models of ${cleanSkill}`,
        estimatedMinutes: Math.max(25, Math.round((task.estimatedHours * 60) / 3)),
        explanation: [
          `Start by understanding what problem ${cleanSkill} solves in a modern ${targetRole} workflow and how it interacts with surrounding tools in your stack.`,
          `Focus on official documentation and core terminology before jumping into advanced patterns or optimizations.`,
        ],
        concepts: [
          {
            term: `${cleanSkill} Core Objective`,
            definition: task.objective,
          },
          {
            term: 'Role Context',
            definition: `Applying ${cleanSkill} reliably within ${targetRole} engineering or analytical workflows.`,
          },
        ],
        stepByStepGuidance: [
          `Read the official documentation overview for ${cleanSkill}.`,
          'Write down 3–5 core terms and how they relate to your current project.',
          'Set up a minimal local sandbox or scratch file to test basic examples.',
        ],
        keyTakeaways: [
          `Focus on fundamentals and practical usage of ${cleanSkill} rather than memorizing syntax.`,
        ],
      },
      {
        id: `${slug}-hands-on-practice`,
        title: `Hands-On Practice & Implementation`,
        estimatedMinutes: Math.max(30, Math.round((task.estimatedHours * 60) / 3)),
        explanation: [
          `Passive reading is not enough—apply ${cleanSkill} directly to a realistic exercise: ${task.practiceActivity}`,
          'Test edge cases, read error messages carefully, and verify your output step by step.',
        ],
        concepts: [
          {
            term: 'Practice Target',
            definition: task.practiceActivity,
          },
        ],
        stepByStepGuidance: [
          'Break the practice activity into 3 small milestones.',
          'Implement the simplest working version first, then add validation and error handling.',
          'Verify your work manually or with automated checks.',
        ],
        keyTakeaways: [
          'Small, verifiable increments build confidence faster than large rewrites.',
        ],
      },
      {
        id: `${slug}-project-synthesis`,
        title: `Project Integration & Portfolio Delivery`,
        estimatedMinutes: Math.max(30, Math.round((task.estimatedHours * 60) / 3)),
        explanation: [
          `Synthesize what you learned by building or upgrading a real deliverable: ${task.projectSuggestion}`,
          'Document your architecture choices, setup steps, and lessons learned in a concise README.',
        ],
        concepts: [
          {
            term: 'Deliverable',
            definition: task.projectSuggestion,
          },
        ],
        stepByStepGuidance: [
          `Scope a clean deliverable around: ${task.projectSuggestion}`,
          'Commit your work to Git with clear messages and a brief README.',
          'Mark this topic completed once your deliverable works end-to-end.',
        ],
        keyTakeaways: [
          `A working, documented project proves ${cleanSkill} readiness to technical interviewers.`,
        ],
      },
    ],
    exercises: [
      task.practiceActivity,
      `Write a short summary explaining when to use ${cleanSkill} and common pitfalls to avoid.`,
    ],
    miniProjects: [
      {
        title: `${cleanSkill} Portfolio Deliverable`,
        description: task.projectSuggestion,
        deliverables: [
          'Working implementation',
          'Clean code & error handling',
          'Short README documenting usage',
        ],
      },
    ],
    keyTakeaways: [
      task.objective,
      `Complete independent practice (${task.estimatedHours} hrs estimated) and document your project.`,
    ],
    resources: buildFallbackResources(cleanSkill),
  };
}
