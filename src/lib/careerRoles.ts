import type { CareerRoleDefinition, RoadmapTask } from '../types/index.ts';

export const CAREER_ROLES: CareerRoleDefinition[] = [
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    category: 'Software Engineering',
    description:
      'Designs and ships end-to-end web applications spanning responsive UIs, REST/GraphQL APIs, authentication, and databases.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'APIs', 'Database', 'Git'],
    preferredSkills: ['TypeScript', 'Next.js', 'Docker', 'Testing', 'Tailwind CSS'],
    beginnerRoadmap: [
      'Master semantic HTML, CSS Grid/Flexbox, and modern JavaScript (ES2023+)',
      'Build interactive component trees with React hooks and TypeScript',
      'Learn Git branching, pull requests, and clean commit workflows',
    ],
    intermediateRoadmap: [
      'Create REST APIs with Express or Next.js Route Handlers and Zod validation',
      'Model relational or document schemas (MongoDB / PostgreSQL) with indexing',
      'Implement JWT/session authentication and role-based access control',
    ],
    advancedRoadmap: [
      'Write automated unit and integration tests for API routes and UI flows',
      'Containerize services with Docker and configure CI/CD deployment pipelines',
    ],
    suggestedProjects: [
      'Multi-role SaaS analytics dashboard with database persistence',
      'Issue tracker or booking platform with authentication and automated tests',
    ],
    learningObjectives: [
      'Connect frontend state cleanly to validated backend endpoints',
      'Debug full-stack network, database, and deployment bottlenecks',
    ],
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Software Engineering',
    description:
      'Builds accessible, responsive, high-performance user interfaces and design systems for modern web applications.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Git'],
    preferredSkills: ['Next.js', 'Accessibility', 'Testing', 'State Management', 'APIs'],
    beginnerRoadmap: [
      'Build responsive multi-breakpoint layouts using Flexbox and CSS Grid',
      'Master TypeScript interfaces, generics, and asynchronous fetch patterns',
    ],
    intermediateRoadmap: [
      'Build accessible forms, modals, and data visualizations in React',
      'Audit WCAG AA contrast, keyboard navigation, and Core Web Vitals',
    ],
    advancedRoadmap: [
      'Write component & end-to-end tests with Vitest and Playwright',
    ],
    suggestedProjects: [
      'Accessible design system component library with interactive docs',
      'Interactive analytics portal with client-side filtering and charts',
    ],
    learningObjectives: [
      'Translate product specifications into accessible, responsive components',
    ],
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    category: 'Software Engineering',
    description:
      'Architects scalable APIs, business logic, data storage layers, caching, and authentication systems.',
    requiredSkills: ['Node.js', 'APIs', 'Database', 'SQL', 'Authentication', 'Git'],
    preferredSkills: ['TypeScript', 'Python', 'MongoDB', 'Docker', 'Redis', 'Testing'],
    beginnerRoadmap: [
      'Design RESTful resource endpoints with proper HTTP status codes',
      'Master SQL joins/indexes and NoSQL document modeling',
    ],
    intermediateRoadmap: [
      'Implement password hashing, session security, and rate limiting',
      'Add schema validation and structured error handling',
    ],
    advancedRoadmap: [
      'Optimize slow queries and implement background job queues',
    ],
    suggestedProjects: [
      'Role-based REST API with rate limiting, validation, and integration tests',
    ],
    learningObjectives: [
      'Maintain data integrity, security, and predictable API latency under load',
    ],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Software Engineering',
    description:
      'Applies data structures, algorithms, object-oriented design, and systems fundamentals to build reliable software.',
    requiredSkills: ['Data Structures', 'Algorithms', 'OOP', 'Git', 'APIs', 'Database'],
    preferredSkills: ['Java', 'Python', 'C++', 'TypeScript', 'Testing', 'System Design'],
    beginnerRoadmap: [
      'Practice arrays, trees, graphs, hashing, and dynamic programming weekly',
      'Write modular, well-typed code with unit test coverage',
    ],
    intermediateRoadmap: [
      'Study OS concurrency, networking fundamentals, and database ACID properties',
      'Design clean service interfaces and handle edge-case failures gracefully',
    ],
    advancedRoadmap: [
      'Practice low-level and high-level system design trade-offs',
    ],
    suggestedProjects: [
      'CLI or web-based developer tool backed by clean algorithms and unit tests',
    ],
    learningObjectives: [
      'Solve unfamiliar algorithmic and architectural problems systematically',
    ],
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Data & Analytics',
    description:
      'Transforms raw institutional and business datasets into actionable KPIs, dashboards, and statistical insights.',
    requiredSkills: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Statistics', 'Pandas'],
    preferredSkills: ['Power BI', 'Tableau', 'NumPy', 'Data Cleaning', 'Git'],
    beginnerRoadmap: [
      'Write complex SQL aggregations, CTEs, and window functions',
      'Clean and explore tabular datasets using Pandas and descriptive statistics',
    ],
    intermediateRoadmap: [
      'Design clear executive dashboards avoiding misleading scales or clutter',
      'Communicate findings with concise business-focused narratives',
    ],
    advancedRoadmap: [
      'Automate recurring ETL reporting pipelines with reproducible scripts',
    ],
    suggestedProjects: [
      'University placement & skills trend exploratory notebook and interactive dashboard',
    ],
    learningObjectives: [
      'Convert messy raw records into trustworthy, decision-ready metrics',
    ],
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    category: 'Data & Analytics',
    description:
      'Formulates predictive modeling problems, runs rigorous experiments, and evaluates statistical and ML solutions.',
    requiredSkills: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'Statistics', 'SQL'],
    preferredSkills: ['Data Visualization', 'Feature Engineering', 'Jupyter', 'Git'],
    beginnerRoadmap: [
      'Master exploratory analysis, hypothesis testing, and probability distributions',
      'Prevent data leakage with strict train/test splits and cross-validation',
    ],
    intermediateRoadmap: [
      'Compare linear baselines against tree ensembles using ROC-AUC, F1, and precision/recall',
      'Interpret feature importance carefully without conflating correlation and causation',
    ],
    advancedRoadmap: [
      'Package trained models for reproducible deployment (e.g., ONNX)',
    ],
    suggestedProjects: [
      'End-to-end binary classification study with CV, confusion matrices, and model cards',
    ],
    learningObjectives: [
      'Build academically defensible, reproducible predictive models',
    ],
  },
  {
    id: 'machine-learning-engineer',
    name: 'Machine Learning Engineer',
    category: 'AI & ML Systems',
    description:
      'Bridges trained ML models and production software through reproducible pipelines, ONNX export, and low-latency serving.',
    requiredSkills: ['Python', 'Scikit-Learn', 'NumPy', 'Pandas', 'ONNX', 'APIs', 'Git'],
    preferredSkills: ['TypeScript', 'Docker', 'Testing', 'PyTorch', 'Feature Engineering'],
    beginnerRoadmap: [
      'Build modular scikit-learn preprocessing and training pipelines',
      'Track evaluation metrics and dataset provenance systematically',
    ],
    intermediateRoadmap: [
      'Export models to ONNX and validate numerical parity against Python baselines',
      'Integrate ONNX Runtime inference cleanly into web applications',
    ],
    advancedRoadmap: [
      'Add automated regression tests checking schema & output tolerances',
    ],
    suggestedProjects: [
      'Browser-side ONNX inference application with reproducible Python training pipeline',
    ],
    learningObjectives: [
      'Guarantee identical feature preprocessing between offline training and live inference',
    ],
  },
  {
    id: 'cloud-engineer',
    name: 'Cloud Engineer',
    category: 'Cloud & Infrastructure',
    description:
      'Provisions, secures, and monitors cloud compute, managed databases, networking, and serverless architectures.',
    requiredSkills: ['Linux', 'Networking', 'Cloud Basics', 'Docker', 'Database', 'Git'],
    preferredSkills: ['AWS', 'GCP', 'Terraform', 'IAM', 'CI/CD'],
    beginnerRoadmap: [
      'Master Linux shell, DNS, HTTP/TLS, and subnetting fundamentals',
      'Containerize a web service and database stack locally',
    ],
    intermediateRoadmap: [
      'Configure least-privilege IAM roles, secrets management, and managed DB access',
      'Deploy serverless and containerized workloads with health checks',
    ],
    advancedRoadmap: [
      'Codify infrastructure declaratively with Terraform or IaC templates',
    ],
    suggestedProjects: [
      'Containerized full-stack deployment guide with environment isolation and monitoring',
    ],
    learningObjectives: [
      'Operate reliable, cost-aware cloud deployments with minimal attack surface',
    ],
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'Cloud & Infrastructure',
    description:
      'Automates build pipelines, testing gates, container orchestration, and observability for engineering teams.',
    requiredSkills: ['Linux', 'Git', 'Docker', 'CI/CD', 'Scripting', 'Networking'],
    preferredSkills: ['Kubernetes', 'Terraform', 'Monitoring', 'Python', 'Cloud Basics'],
    beginnerRoadmap: [
      'Write reliable Bash/Python automation scripts and multi-stage Dockerfiles',
      'Create GitHub Actions workflows for lint, type-check, and automated tests',
    ],
    intermediateRoadmap: [
      'Configure environment promotion, rollback checks, and log aggregation',
    ],
    advancedRoadmap: [
      'Practice zero-downtime deployment patterns and SLO alerting',
    ],
    suggestedProjects: [
      'Automated CI/CD pipeline enforcing unit tests, linting, and production build gates',
    ],
    learningObjectives: [
      'Eliminate manual deployment friction while keeping releases verifiable',
    ],
  },
  {
    id: 'qa-engineer',
    name: 'QA Engineer',
    category: 'Quality & Reliability',
    description:
      'Designs test strategies, automated regression suites, and API contract checks to guarantee software quality.',
    requiredSkills: ['Testing', 'JavaScript', 'APIs', 'SQL', 'Git', 'Bug Tracking'],
    preferredSkills: ['Playwright', 'Vitest', 'TypeScript', 'Python', 'CI/CD'],
    beginnerRoadmap: [
      'Write clear boundary-case test plans and reproducible bug reports',
      'Automate unit tests for core validation and business rules',
    ],
    intermediateRoadmap: [
      'Build API integration tests and Playwright end-to-end user journeys',
    ],
    advancedRoadmap: [
      'Gate pull requests with automated regression suites in CI',
    ],
    suggestedProjects: [
      'Full E2E + API test harness covering auth, CRUD, and error states',
    ],
    learningObjectives: [
      'Catch regressions early through systematic automated verification',
    ],
  },
  {
    id: 'cybersecurity-analyst',
    name: 'Cybersecurity Analyst',
    category: 'Security',
    description:
      'Assesses application vulnerabilities, enforces secure authentication/authorization, and monitors security posture.',
    requiredSkills: ['Networking', 'Linux', 'Web Security', 'Authentication', 'SQL'],
    preferredSkills: ['Python', 'OWASP Top 10', 'Cryptography', 'Git', 'APIs'],
    beginnerRoadmap: [
      'Study OWASP Top 10 risks: injection, broken access control, XSS, and SSRF',
      'Practice inspecting HTTP headers, TLS, and session cookie flags',
    ],
    intermediateRoadmap: [
      'Audit API routes for server-side authorization and input validation gaps',
      'Write Python scripts to parse logs and flag anomalous patterns',
    ],
    advancedRoadmap: [
      'Perform threat modeling and automated dependency vulnerability audits',
    ],
    suggestedProjects: [
      'Security audit report and remediation PR for a full-stack web application',
    ],
    learningObjectives: [
      'Identify and remediate high-impact security flaws before production release',
    ],
  },
];

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9+#.]/g, '');
}

function skillsMatch(studentSet: Set<string>, targetSkill: string): boolean {
  const norm = normalizeToken(targetSkill);
  if (studentSet.has(norm)) return true;
  // Common synonym handling (transparent rule-based matching)
  const aliases: Record<string, string[]> = {
    apis: ['rest', 'restapi', 'restfulapis', 'graphql', 'express'],
    database: ['mongodb', 'postgresql', 'mysql', 'sql', 'mongoose', 'prisma'],
    nodejs: ['node', 'express'],
    testing: ['vitest', 'jest', 'playwright', 'pytest', 'cypress'],
    scikitlearn: ['sklearn', 'machinelearning'],
    datavisualization: ['recharts', 'matplotlib', 'seaborn', 'tableau', 'powerbi'],
    websecurity: ['owasp', 'cybersecurity', 'security'],
    cloudbasics: ['aws', 'gcp', 'azure', 'vercel'],
  };
  const candidates = aliases[norm] || [];
  return candidates.some((alias) => studentSet.has(alias));
}

export interface SkillGapReport {
  role: CareerRoleDefinition;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
  coveragePercent: number;
  prioritizedGaps: Array<{
    skill: string;
    priority: 'High' | 'Medium';
    category: 'Required' | 'Preferred';
    recommendedActivity: string;
  }>;
}

export function analyzeSkillGap(studentSkills: string[], roleNameOrId: string): SkillGapReport {
  const role =
    CAREER_ROLES.find(
      (r) =>
        r.id === roleNameOrId ||
        r.name.toLowerCase() === roleNameOrId.trim().toLowerCase()
    ) || CAREER_ROLES[0];

  const skillSet = new Set(studentSkills.map(normalizeToken).filter(Boolean));

  const matchedRequired = role.requiredSkills.filter((s) => skillsMatch(skillSet, s));
  const missingRequired = role.requiredSkills.filter((s) => !skillsMatch(skillSet, s));
  const matchedPreferred = role.preferredSkills.filter((s) => skillsMatch(skillSet, s));
  const missingPreferred = role.preferredSkills.filter((s) => !skillsMatch(skillSet, s));

  const totalWeighted = role.requiredSkills.length * 2 + role.preferredSkills.length;
  const matchedWeighted = matchedRequired.length * 2 + matchedPreferred.length;
  const coveragePercent =
    totalWeighted > 0 ? Math.round((matchedWeighted / totalWeighted) * 100) : 0;

  const prioritizedGaps = [
    ...missingRequired.map((skill) => ({
      skill,
      priority: 'High' as const,
      category: 'Required' as const,
      recommendedActivity: `Complete foundational exercises and build a small deliverable applying ${skill} within a ${role.name} workflow.`,
    })),
    ...missingPreferred.map((skill) => ({
      skill,
      priority: 'Medium' as const,
      category: 'Preferred' as const,
      recommendedActivity: `Strengthen competitiveness for ${role.name} interviews by adding ${skill} to an existing project.`,
    })),
  ];

  return {
    role,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    coveragePercent,
    prioritizedGaps,
  };
}

export interface CareerRecommendationItem {
  role: CareerRoleDefinition;
  overallFitScore: number;
  skillMatchScore: number;
  interestMatchScore: number;
  academicAlignmentScore: number;
  matchedSkills: string[];
  missingCoreSkills: string[];
  explanation: string;
}

export function recommendCareers(params: {
  skills: string[];
  interests: string[];
  degreeType: 'Sci&Tech' | 'Comm&Mgmt' | 'Others';
  cgpaPercent: number;
  codingPracticeHours: number;
  targetRole?: string;
}): CareerRecommendationItem[] {
  const skillSet = new Set(params.skills.map(normalizeToken).filter(Boolean));
  const interestText = params.interests.join(' ').toLowerCase();

  const ranked = CAREER_ROLES.map((role) => {
    const reqMatched = role.requiredSkills.filter((s) => skillsMatch(skillSet, s));
    const prefMatched = role.preferredSkills.filter((s) => skillsMatch(skillSet, s));
    const missingCoreSkills = role.requiredSkills.filter((s) => !skillsMatch(skillSet, s));

    const skillMatchRatio =
      (reqMatched.length * 2 + prefMatched.length) /
      Math.max(1, role.requiredSkills.length * 2 + role.preferredSkills.length);
    const skillMatchScore = Math.round(skillMatchRatio * 100);

    // Transparent rule-based interest alignment
    const roleKeywords = [
      role.name.toLowerCase(),
      role.category.toLowerCase(),
      ...role.requiredSkills.map((s) => s.toLowerCase()),
    ];
    const interestHits = roleKeywords.filter(
      (kw) => kw.length > 2 && interestText.includes(kw)
    ).length;
    const isTarget =
      params.targetRole &&
      role.name.toLowerCase() === params.targetRole.trim().toLowerCase();
    const interestMatchScore = Math.min(
      100,
      (isTarget ? 55 : 15) + interestHits * 20
    );

    // Transparent rule-based academic & coding alignment
    let academicAlignmentScore = Math.min(100, Math.round(params.cgpaPercent * 0.75));
    if (params.degreeType === 'Sci&Tech' && role.category !== 'Data & Analytics') {
      academicAlignmentScore = Math.min(100, academicAlignmentScore + 18);
    }
    if (params.codingPracticeHours >= 8 && role.category === 'Software Engineering') {
      academicAlignmentScore = Math.min(100, academicAlignmentScore + 12);
    }

    const overallFitScore = Math.round(
      skillMatchScore * 0.55 +
        interestMatchScore * 0.25 +
        academicAlignmentScore * 0.2
    );

    const explanation = `Rule-based fit: ${reqMatched.length}/${role.requiredSkills.length} required skills matched (${skillMatchScore}% skill alignment)${
      isTarget ? ', matches your selected target role' : ''
    }${
      missingCoreSkills.length > 0
        ? `. Priority next skills: ${missingCoreSkills.slice(0, 3).join(', ')}.`
        : '. All required core skills are already present.'
    }`;

    return {
      role,
      overallFitScore,
      skillMatchScore,
      interestMatchScore,
      academicAlignmentScore,
      matchedSkills: [...reqMatched, ...prefMatched],
      missingCoreSkills,
      explanation,
    };
  });

  ranked.sort((a, b) => b.overallFitScore - a.overallFitScore);
  return ranked;
}

interface SkillGuidanceEntry {
  objective: string;
  practiceActivity: string;
  projectSuggestion: string;
  hours: number;
}

const SKILL_GUIDANCE_MAP: Record<string, SkillGuidanceEntry> = {
  html: {
    objective: 'Structure accessible, semantic web documents using modern HTML5 landmarks and forms.',
    practiceActivity: 'Build a multi-section profile and accessible form layout using semantic tags and ARIA labels.',
    projectSuggestion: 'Accessible personal engineering portfolio with validated contact and project forms.',
    hours: 6,
  },
  css: {
    objective: 'Create responsive, consistent layouts using Flexbox, CSS Grid, and design tokens.',
    practiceActivity: 'Implement a responsive 12-column dashboard grid and mobile drawer without layout overflow.',
    projectSuggestion: 'Responsive SaaS pricing and analytics landing page across 375px, 768px, and 1440px.',
    hours: 8,
  },
  javascript: {
    objective: 'Master asynchronous JavaScript, closures, array transforms, DOM events, and ES2023+ modules.',
    practiceActivity: 'Solve 10 async fetch/promise exercises and build a client-side filterable data table.',
    projectSuggestion: 'Interactive browser-based task planner or expense tracker with local state management.',
    hours: 10,
  },
  typescript: {
    objective: 'Enforce compile-time type safety across API contracts, component props, and utility functions.',
    practiceActivity: 'Convert a JavaScript API client and form state module to strict TypeScript interfaces and generics.',
    projectSuggestion: 'End-to-end type-safe full-stack app sharing Zod schemas between client and server.',
    hours: 8,
  },
  react: {
    objective: 'Build modular, stateful UI components with React hooks, controlled forms, and clean data fetching.',
    practiceActivity: 'Create a multi-step wizard form with client-side validation, loading skeletons, and error recovery.',
    projectSuggestion: 'Interactive analytics dashboard with live filters, charts, and protected client routes.',
    hours: 12,
  },
  nextjs: {
    objective: 'Architect server-rendered and API-backed React applications using App Router conventions.',
    practiceActivity: 'Build a dynamic route page paired with Route Handlers, server validation, and metadata.',
    projectSuggestion: 'Full-stack student portal with server-side session checks and SEO metadata.',
    hours: 10,
  },
  tailwindcss: {
    objective: 'Rapidly compose maintainable design systems and light/dark UI themes with Tailwind utilities.',
    practiceActivity: 'Implement a reusable card, table, and responsive navigation layout with light/dark theme tokens.',
    projectSuggestion: 'Responsive admin and student workspace UI with consistent spacing and contrast.',
    hours: 6,
  },
  nodejs: {
    objective: 'Build reliable server-side HTTP services, middleware, and async I/O workflows in Node.js.',
    practiceActivity: 'Create an Express/Node server with structured routing, error middleware, and environment config.',
    projectSuggestion: 'REST backend handling auth middleware, database queries, and validated file processing.',
    hours: 10,
  },
  apis: {
    objective: 'Design, validate, and consume RESTful JSON APIs with proper HTTP status codes and auth headers.',
    practiceActivity: 'Implement CRUD endpoints with Zod request validation, pagination, and integration tests.',
    projectSuggestion: 'API-backed issue tracker or readiness portal with documented OpenAPI/REST contracts.',
    hours: 10,
  },
  database: {
    objective: 'Model normalized or document schemas, write indexed queries, and handle persistence safely.',
    practiceActivity: 'Design Mongoose or SQL schemas with compound indexes, foreign references, and aggregation queries.',
    projectSuggestion: 'Multi-collection analytics backend with user-scoped queries and paginated rosters.',
    hours: 10,
  },
  mongodb: {
    objective: 'Design document schemas, compound indexes, and aggregation pipelines in MongoDB Atlas.',
    practiceActivity: 'Model referenced student profiles and assessment history collections with Mongoose validation.',
    projectSuggestion: 'MongoDB Atlas-backed analytics dashboard with role-scoped queries.',
    hours: 8,
  },
  sql: {
    objective: 'Write accurate relational queries using joins, CTEs, window functions, and schema constraints.',
    practiceActivity: 'Solve 15 analytical SQL queries covering aggregations, ranking, and multi-table joins.',
    projectSuggestion: 'Relational placement reporting database with summary views and indexed lookups.',
    hours: 10,
  },
  git: {
    objective: 'Manage clean version control workflows with feature branching, rebasing, and pull requests.',
    practiceActivity: 'Practice resolving merge conflicts, writing atomic commits, and reviewing PR diffs.',
    projectSuggestion: 'Maintain a clean, tagged GitHub repository with CI checks and documented releases.',
    hours: 6,
  },
  docker: {
    objective: 'Package applications and dependencies into reproducible multi-stage containers.',
    practiceActivity: 'Write a multi-stage Dockerfile and docker-compose setup for a web app and database.',
    projectSuggestion: 'Containerized full-stack service ready for portable cloud deployment.',
    hours: 8,
  },
  testing: {
    objective: 'Prevent regressions with unit tests, API integration checks, and end-to-end browser verification.',
    practiceActivity: 'Write Vitest unit suites for business rules and integration tests covering auth and CRUD.',
    projectSuggestion: 'Automated regression test suite gating pull requests in GitHub Actions.',
    hours: 8,
  },
  python: {
    objective: 'Write clean, modular Python scripts for data manipulation, automation, and backend services.',
    practiceActivity: 'Build data-cleaning scripts using pathlib, typing, comprehensions, and pytest checks.',
    projectSuggestion: 'Reproducible Python ETL and evaluation CLI with automated unit tests.',
    hours: 10,
  },
  pandas: {
    objective: 'Clean, merge, aggregate, and audit tabular datasets cleanly using Pandas DataFrames.',
    practiceActivity: 'Inspect a public CSV for duplicates, missing values, outliers, and group summaries.',
    projectSuggestion: 'Exploratory placement analytics pipeline producing clean summary JSON/CSVs.',
    hours: 8,
  },
  numpy: {
    objective: 'Perform vectorized numerical computation, matrix operations, and tensor shaping in NumPy.',
    practiceActivity: 'Implement standardization, distance metrics, and array broadcasting without Python loops.',
    projectSuggestion: 'Numerical preprocessing module ensuring float32 tensor parity for ML inference.',
    hours: 6,
  },
  scikitlearn: {
    objective: 'Build leakage-free ML pipelines with train/test splits, cross-validation, and model comparison.',
    practiceActivity: 'Train Logistic Regression and Random Forest inside ColumnTransformer pipelines and compare ROC-AUC.',
    projectSuggestion: 'End-to-end binary classifier benchmark with confusion matrices and saved evaluation metrics.',
    hours: 12,
  },
  onnx: {
    objective: 'Export trained ML models to ONNX and verify numerical parity across Python and browser runtimes.',
    practiceActivity: 'Convert a scikit-learn classifier with skl2onnx and assert <1e-4 probability delta in onnxruntime.',
    projectSuggestion: 'Zero-backend-ML web app executing ONNX Runtime Web inference in WebAssembly.',
    hours: 8,
  },
  linux: {
    objective: 'Navigate Linux filesystems, processes, permissions, networking tools, and shell scripting confidently.',
    practiceActivity: 'Automate log inspection, service health checks, and file permission audits via Bash.',
    projectSuggestion: 'Automated server bootstrap and health-check script for deployment environments.',
    hours: 8,
  },
  networking: {
    objective: 'Understand TCP/IP, DNS, HTTP/TLS, ports, proxies, and secure request routing.',
    practiceActivity: 'Inspect TLS handshakes, HTTP headers, CORS policies, and reverse-proxy routing locally.',
    projectSuggestion: 'Documented HTTPS reverse-proxy architecture with security header verification.',
    hours: 8,
  },
  cicd: {
    objective: 'Automate build, lint, test, and deployment gates using continuous integration pipelines.',
    practiceActivity: 'Configure a GitHub Actions workflow running type-checking, unit tests, and production builds.',
    projectSuggestion: 'CI-enforced repository blocking merges when lint, tests, or build checks fail.',
    hours: 6,
  },
  authentication: {
    objective: 'Implement secure password hashing, signed sessions, CSRF protections, and server-side RBAC.',
    practiceActivity: 'Build register/login/logout endpoints with bcrypt hashing, HttpOnly cookies, and role guards.',
    projectSuggestion: 'Multi-role auth service tested against unauthorized and cross-user access attempts.',
    hours: 10,
  },
  datastructures: {
    objective: 'Apply arrays, hash maps, trees, graphs, heaps, and complexity analysis to coding problems.',
    practiceActivity: 'Solve 15 timed medium problems covering graphs, trees, sliding window, and DP.',
    projectSuggestion: 'Benchmarked algorithm visualizer or route-finding library with unit tests.',
    hours: 14,
  },
  algorithms: {
    objective: 'Analyze time/space trade-offs and implement sorting, searching, greedy, and DP strategies.',
    practiceActivity: 'Implement and benchmark core graph traversal and dynamic programming solutions.',
    projectSuggestion: 'Problem-solving repository with documented complexity proofs and edge-case tests.',
    hours: 14,
  },
  oop: {
    objective: 'Structure maintainable software using encapsulation, interfaces, composition, and SOLID principles.',
    practiceActivity: 'Refactor a procedural module into clean typed services with clear interface boundaries.',
    projectSuggestion: 'Modular library management or inventory engine with unit-tested domain classes.',
    hours: 8,
  },
  datavisualization: {
    objective: 'Design accurate, uncluttered charts that communicate distributions and trends honestly.',
    practiceActivity: 'Build multi-series trend, bar, and distribution charts with clear axes and tooltips.',
    projectSuggestion: 'Interactive analytics dashboard turning raw cohort data into executive visuals.',
    hours: 8,
  },
  statistics: {
    objective: 'Apply probability, sampling, confidence intervals, and classification metrics accurately.',
    practiceActivity: 'Compute precision, recall, F1, ROC-AUC, and class-imbalance diagnostics on real data.',
    projectSuggestion: 'Statistical evaluation report distinguishing correlation from causation.',
    hours: 10,
  },
  excel: {
    objective: 'Clean, pivot, and summarize tabular datasets efficiently using spreadsheet formulas.',
    practiceActivity: 'Build pivot tables, XLOOKUP joins, and conditional formatting summaries on placement data.',
    projectSuggestion: 'Automated placement tracking workbook with KPI summary sheets.',
    hours: 6,
  },
  cloudbasics: {
    objective: 'Deploy and configure serverless functions, managed databases, and environment secrets securely.',
    practiceActivity: 'Configure Vercel/cloud environment variables, build commands, and MongoDB Atlas network rules.',
    projectSuggestion: 'Production-deployed full-stack web app with health monitoring and documented runbook.',
    hours: 8,
  },
  scripting: {
    objective: 'Automate repetitive build, cleanup, and environment checks with Bash or Python scripts.',
    practiceActivity: 'Write a repeatable setup and validation script checking dependencies and exit codes.',
    projectSuggestion: 'One-command project verification script running lint, tests, and build checks.',
    hours: 6,
  },
  bugtracking: {
    objective: 'Write reproducible defect reports with clear steps, expected/actual behavior, and severity.',
    practiceActivity: 'Audit an application workflow and log 5 structured bug reports with reproduction steps.',
    projectSuggestion: 'QA release checklist and defect triage board for a web application.',
    hours: 6,
  },
  websecurity: {
    objective: 'Identify and prevent OWASP Top 10 flaws including XSS, injection, SSRF, and broken access control.',
    practiceActivity: 'Audit API endpoints for input validation, secret exposure, and server-side RBAC enforcement.',
    projectSuggestion: 'Security hardening review and automated auth/access verification tests.',
    hours: 10,
  },
  accessibility: {
    objective: 'Meet WCAG AA contrast, keyboard navigation, focus management, and semantic ARIA standards.',
    practiceActivity: 'Audit interactive modals, forms, and tables using keyboard-only navigation and contrast checks.',
    projectSuggestion: 'WCAG AA compliant UI component kit with verified keyboard interactions.',
    hours: 6,
  },
  statemanagement: {
    objective: 'Manage client cache, form drafts, and global session state predictably without race conditions.',
    practiceActivity: 'Implement React context + optimistic updates with clean rollback on API failure.',
    projectSuggestion: 'Interactive workspace supporting optimistic edits and persistent server sync.',
    hours: 8,
  },
};

export function generateDeterministicRoadmap(
  roleNameOrId: string,
  studentSkills: string[],
  existingTasks: RoadmapTask[] = [],
  statusHistory: Record<string, RoadmapTask['status']> = {}
): { targetRole: string; tasks: RoadmapTask[] } {
  const gap = analyzeSkillGap(studentSkills, roleNameOrId);
  const statusByTaskId = new Map<string, RoadmapTask['status']>(
    Object.entries(statusHistory)
  );
  existingTasks.forEach((t) => {
    statusByTaskId.set(t.taskId, t.status);
  });

  const tasks: RoadmapTask[] = [];

  gap.missingRequired.forEach((skill, idx) => {
    const key = normalizeToken(skill);
    const taskId = `${gap.role.id}-req-${key}`;
    const guide = SKILL_GUIDANCE_MAP[key];

    tasks.push({
      taskId,
      skill,
      priority: 'High',
      objective:
        guide?.objective ||
        `Build core proficiency in ${skill} as a required foundation for ${gap.role.name} roles.`,
      practiceActivity:
        guide?.practiceActivity ||
        `Complete 3 structured hands-on exercises applying ${skill} in a ${gap.role.name} context.`,
      projectSuggestion:
        guide?.projectSuggestion ||
        gap.role.suggestedProjects[idx % gap.role.suggestedProjects.length] ||
        `Build a documented mini-project demonstrating ${skill}.`,
      estimatedHours: guide?.hours || 10,
      status: statusByTaskId.get(taskId) || 'Not Started',
    });
  });

  gap.missingPreferred.forEach((skill, idx) => {
    const key = normalizeToken(skill);
    const taskId = `${gap.role.id}-pref-${key}`;
    const guide = SKILL_GUIDANCE_MAP[key];

    tasks.push({
      taskId,
      skill,
      priority: 'Medium',
      objective:
        guide?.objective ||
        `Extend your ${gap.role.name} portfolio with industry-preferred ${skill} fluency.`,
      practiceActivity:
        guide?.practiceActivity ||
        `Implement a focused module, configuration, or test workflow using ${skill}.`,
      projectSuggestion:
        guide?.projectSuggestion ||
        gap.role.suggestedProjects[idx % gap.role.suggestedProjects.length] ||
        `Integrate ${skill} into an existing portfolio project.`,
      estimatedHours: guide?.hours || 6,
      status: statusByTaskId.get(taskId) || 'Not Started',
    });
  });

  // Always include role-specific advanced synthesis milestones
  gap.role.advancedRoadmap.forEach((step, idx) => {
    const taskId = `${gap.role.id}-adv-${idx + 1}`;
    tasks.push({
      taskId,
      skill: `${gap.role.name} Capstone ${idx + 1}`,
      priority: tasks.length === 0 ? 'High' : 'Foundation',
      objective: step,
      practiceActivity: `Review system architecture, add automated checks, and document engineering trade-offs for ${gap.role.name}.`,
      projectSuggestion: gap.role.suggestedProjects[idx % gap.role.suggestedProjects.length],
      estimatedHours: 12,
      status: statusByTaskId.get(taskId) || 'Not Started',
    });
  });

  // Preserve any user-created custom tasks on this roadmap
  existingTasks.forEach((t) => {
    if (t.taskId.startsWith('custom-') && !tasks.some((x) => x.taskId === t.taskId)) {
      tasks.push(t);
    }
  });

  return {
    targetRole: gap.role.name,
    tasks,
  };
}
