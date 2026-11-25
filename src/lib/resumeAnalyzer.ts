import { CAREER_ROLES } from './careerRoles.ts';

export interface ResumeAnalysisOutput {
  overallScore: number;
  sectionScores: {
    contactInfo: number;
    education: number;
    skills: number;
    projects: number;
    experience: number;
    certifications: number;
    formattingSignals: number;
  };
  detectedSections: string[];
  matchedSkills: string[];
  missingRoleSkills: string[];
  atsSignals: string[];
  recommendations: string[];
  wordCount: number;
  scoringMethodNote: string;
}

const KNOWN_TECH_KEYWORDS = Array.from(
  new Set(
    CAREER_ROLES.flatMap((r) => [...r.requiredSkills, ...r.preferredSkills]).concat([
      'C',
      'C++',
      'Java',
      'Python',
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Express',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'SQL',
      'Git',
      'Docker',
      'Kubernetes',
      'AWS',
      'Linux',
      'Tailwind CSS',
      'HTML',
      'CSS',
      'REST',
      'Pandas',
      'NumPy',
      'Scikit-Learn',
      'ONNX',
      'Vitest',
      'Playwright',
    ])
  )
);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function analyzeResumeText(rawText: string, targetRoleName: string): ResumeAnalysisOutput {
  const text = rawText.replace(/\r\n/g, '\n').trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const role =
    CAREER_ROLES.find(
      (r) =>
        r.name.toLowerCase() === targetRoleName.trim().toLowerCase() ||
        r.id === targetRoleName.trim().toLowerCase()
    ) || CAREER_ROLES[0];

  // 1. Contact Information (max 15)
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s\-()]{8,15}\d)/.test(text);
  const hasProfileLink = /(github\.com|linkedin\.com|portfolio)/i.test(text);
  const contactInfo = (hasEmail ? 6 : 0) + (hasPhone ? 5 : 0) + (hasProfileLink ? 4 : 0);

  // 2. Education (max 15)
  const hasEducationHeader = /\b(education|academic|qualification|b\.tech|b\.e\.|bachelor|university|college)\b/i.test(text);
  const hasGradeSignal = /\b(cgpa|gpa|percentage|%|grade|sgpa)\b/i.test(text);
  const education = (hasEducationHeader ? 10 : 0) + (hasGradeSignal ? 5 : 0);

  // 3. Skills & Target Role Keyword Overlap (max 25)
  const matchedSkills = KNOWN_TECH_KEYWORDS.filter((kw) => {
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${escapeRegExp(kw.toLowerCase())}([^a-z0-9+#.]|$)`, 'i');
    return pattern.test(lower);
  });
  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));
  const roleRequiredMatched = role.requiredSkills.filter((s) => matchedSet.has(s.toLowerCase()));
  const missingRoleSkills = role.requiredSkills.filter((s) => !matchedSet.has(s.toLowerCase()));

  const roleOverlapRatio =
    role.requiredSkills.length > 0 ? roleRequiredMatched.length / role.requiredSkills.length : 0;
  const skills = Math.min(
    25,
    Math.round(roleOverlapRatio * 18 + Math.min(7, matchedSkills.length * 0.8))
  );

  // 4. Projects (max 15)
  const hasProjectsSection = /\b(projects?|capstone|built|developed|implemented|architected)\b/i.test(text);
  const hasMetricsOrOutcomes = /\b(\d+%|\d+x|reduced|improved|accuracy|latency|users|deployed)\b/i.test(text);
  const projects = (hasProjectsSection ? 9 : 0) + (hasMetricsOrOutcomes ? 6 : 0);

  // 5. Experience / Internships (max 15)
  const hasExperienceSection = /\b(experience|internship|intern|employment|work history|trainee)\b/i.test(text);
  const hasActionVerbs = /\b(designed|engineered|built|automated|collaborated|tested|optimized|maintained)\b/i.test(text);
  const experience = (hasExperienceSection ? 10 : 0) + (hasActionVerbs ? 5 : 0);

  // 6. Certifications (max 5)
  const hasCerts = /\b(certifications?|certified|certificate|coursera|udemy|aws|azure|nptel)\b/i.test(text);
  const certifications = hasCerts ? 5 : 0;

  // 7. Basic ATS-oriented formatting signals (max 10)
  const lineCount = text.split('\n').filter((l) => l.trim().length > 0).length;
  const reasonableLength = wordCount >= 180 && wordCount <= 1100;
  const structuredLines = lineCount >= 12;
  const formattingSignals =
    (reasonableLength ? 6 : wordCount >= 100 ? 3 : 1) + (structuredLines ? 4 : 1);

  const overallScore = Math.min(
    100,
    contactInfo + education + skills + projects + experience + certifications + formattingSignals
  );

  const detectedSections: string[] = [];
  if (contactInfo >= 6) detectedSections.push('Contact Information');
  if (hasEducationHeader) detectedSections.push('Education');
  if (/\b(skills|technologies|tech stack|tools)\b/i.test(text) || matchedSkills.length >= 3) {
    detectedSections.push('Technical Skills');
  }
  if (hasProjectsSection) detectedSections.push('Projects');
  if (hasExperienceSection) detectedSections.push('Experience / Internships');
  if (hasCerts) detectedSections.push('Certifications');

  const atsSignals: string[] = [];
  atsSignals.push(
    reasonableLength
      ? `Word count (${wordCount} words) fits standard 1–2 page student resume expectations.`
      : `Word count (${wordCount} words) is ${wordCount < 180 ? 'brief — expand project details' : 'dense — consider tightening to 1–2 pages'}.`
  );
  atsSignals.push(
    hasProfileLink
      ? 'Includes clickable professional link signal (GitHub/LinkedIn/Portfolio).'
      : 'No GitHub or LinkedIn reference detected.'
  );
  atsSignals.push(
    hasMetricsOrOutcomes
      ? 'Contains quantifiable outcomes or action impact terms.'
      : 'Add measurable outcomes (percentages, counts, latency, test coverage) to project bullets.'
  );

  const recommendations: string[] = [];
  if (!hasEmail || !hasPhone) {
    recommendations.push('Include both a professional email address and reachable phone number in the header.');
  }
  if (!hasProfileLink) {
    recommendations.push('Add your GitHub and LinkedIn URLs so recruiters can verify project repositories.');
  }
  if (missingRoleSkills.length > 0) {
    recommendations.push(
      `For ${role.name}, incorporate missing target skills you have practiced: ${missingRoleSkills.slice(0, 5).join(', ')}.`
    );
  }
  if (!hasMetricsOrOutcomes) {
    recommendations.push('Quantify project bullets (e.g., dataset size, API latency, test coverage, or user impact).');
  }
  if (!hasExperienceSection) {
    recommendations.push('Highlight internships, research assistantships, open-source PRs, or practical lab leadership.');
  }
  if (!hasCerts) {
    recommendations.push('List relevant verified certifications or coursework milestones if space permits.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Resume structure and target-role keyword coverage look well balanced; keep tailoring bullets per job description.');
  }

  return {
    overallScore,
    sectionScores: {
      contactInfo,
      education,
      skills,
      projects,
      experience,
      certifications,
      formattingSignals,
    },
    detectedSections,
    matchedSkills,
    missingRoleSkills,
    atsSignals,
    recommendations,
    wordCount,
    scoringMethodNote:
      'Deterministic rule-based rubric (Contact 15 + Education 15 + Role Skills 25 + Projects 15 + Experience 15 + Certifications 5 + Structure 10 = 100). Not an employer-specific ATS prediction.',
  };
}
