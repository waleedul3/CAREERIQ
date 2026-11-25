import { describe, expect, it } from 'vitest';
import {
  analyzeSkillGap,
  generateDeterministicRoadmap,
  recommendCareers,
} from '../../src/lib/careerRoles.ts';
import { getLearningGuideForTask } from '../../src/lib/learningGuides.ts';
import {
  buildExplanationAndGuidance,
  classifyReadinessCategory,
  encodeFeaturesToFloat32,
  PREPROCESSING_SPEC,
} from '../../src/lib/mlPreprocessing.ts';
import { analyzeResumeText } from '../../src/lib/resumeAnalyzer.ts';
import {
  assessmentSubmitSchema,
  profileUpdateSchema,
  registerSchema,
} from '../../src/lib/validation.ts';

describe('ML Feature Preprocessing', () => {
  it('encodes supported model features into exact 15-element Float32Array matching training schema', () => {
    const vec = encodeFeaturesToFloat32({
      ssc_p: 67.16959302325581,
      hsc_p: 66.3961046511628,
      degree_p: 66.21982558139534,
      etest_p: 72.61459302325582,
      mba_p: 62.27529069767441,
      hsc_s: 'Science',
      degree_t: 'Sci&Tech',
      workex: 'Yes',
      specialisation: 'Mkt&Fin',
    });

    expect(vec).toBeInstanceOf(Float32Array);
    expect(vec.length).toBe(PREPROCESSING_SPEC.inputVectorLength);
    // Numeric values equal to training means should standardize to ~0
    for (let i = 0; i < 5; i++) {
      expect(Math.abs(vec[i])).toBeLessThan(1e-5);
    }
    // One-hot positions: hsc_s=[Arts(5), Commerce(6), Science(7)]
    expect(vec[5]).toBe(0);
    expect(vec[6]).toBe(0);
    expect(vec[7]).toBe(1);
    // degree_t=[Comm&Mgmt(8), Others(9), Sci&Tech(10)]
    expect(vec[10]).toBe(1);
    // workex=[No(11), Yes(12)]
    expect(vec[11]).toBe(0);
    expect(vec[12]).toBe(1);
    // specialisation=[Mkt&Fin(13), Mkt&HR(14)]
    expect(vec[13]).toBe(1);
    expect(vec[14]).toBe(0);
  });

  it('classifies readiness categories accurately across probability thresholds', () => {
    expect(classifyReadinessCategory(0.82)).toBe('High Readiness');
    expect(classifyReadinessCategory(0.55)).toBe('Moderate Readiness');
    expect(classifyReadinessCategory(0.3)).toBe('Developing Readiness');
  });

  it('builds structured strengths, improvements, and bounded readiness score', () => {
    const out = buildExplanationAndGuidance(
      {
        academics: {
          sscPercentage: 82,
          hscPercentage: 80,
          hscStream: 'Science',
          degreePercentage: 78,
          degreeType: 'Sci&Tech',
          specializationTrack: 'Mkt&Fin',
          coreSpecializationPercentage: 74,
        },
        skills: {
          technicalSkills: ['React', 'Node.js', 'SQL', 'Git', 'TypeScript'],
          programmingLanguages: ['TypeScript', 'Python'],
          problemSolvingScore: 8,
          codingPracticeHours: 10,
        },
        experience: {
          projectsCount: 4,
          internshipsCount: 1,
          hasWorkExperience: true,
          certificationsCount: 2,
        },
        readiness: {
          aptitudeTestPercentage: 82,
          communicationRating: 8,
          interviewReadinessRating: 8,
          targetRole: 'Full Stack Developer',
          careerInterests: ['Full Stack Development'],
        },
        modelFeatures: {
          ssc_p: 82,
          hsc_p: 80,
          degree_p: 78,
          etest_p: 82,
          mba_p: 74,
          hsc_s: 'Science',
          degree_t: 'Sci&Tech',
          workex: 'Yes',
          specialisation: 'Mkt&Fin',
        },
      },
      0.85
    );

    expect(out.topFactors.length).toBe(6);
    expect(out.readinessScore).toBeGreaterThanOrEqual(70);
    expect(out.readinessScore).toBeLessThanOrEqual(99);
    expect(out.strengths.length).toBeGreaterThan(0);
  });
});

describe('Skill Gap, Recommendations & Roadmap Engine', () => {
  it('computes accurate matched and missing skills for Full Stack Developer', () => {
    const report = analyzeSkillGap(['HTML', 'CSS', 'JavaScript', 'Git'], 'Full Stack Developer');
    expect(report.matchedRequired).toEqual(['HTML', 'CSS', 'JavaScript', 'Git']);
    expect(report.missingRequired).toEqual(['React', 'Node.js', 'APIs', 'Database']);
    expect(report.coveragePercent).toBeGreaterThan(0);
    expect(report.coveragePercent).toBeLessThan(100);
  });

  it('ranks relevant career roles higher based on skill and interest alignment', () => {
    const ranked = recommendCareers({
      skills: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL'],
      interests: ['Data Science', 'Machine Learning'],
      degreeType: 'Sci&Tech',
      cgpaPercent: 80,
      codingPracticeHours: 8,
      targetRole: 'Data Scientist',
    });

    expect(ranked.length).toBe(11);
    expect(['Data Scientist', 'Machine Learning Engineer', 'Data Analyst']).toContain(
      ranked[0].role.name
    );
  });

  it('preserves existing completed task status and generates skill-specific guidance', () => {
    const initial = generateDeterministicRoadmap('Full Stack Developer', ['HTML', 'CSS']);
    const reactTask = initial.tasks.find((t) => t.skill === 'React');
    const nodeTask = initial.tasks.find((t) => t.skill === 'Node.js');
    const dockerTask = initial.tasks.find((t) => t.skill === 'Docker');

    expect(reactTask?.objective.toLowerCase()).toContain('react');
    expect(nodeTask?.objective.toLowerCase()).toContain('node');
    expect(nodeTask?.practiceActivity.toLowerCase()).not.toContain('react hooks');
    expect(dockerTask?.objective.toLowerCase()).toContain('container');

    const firstTask = initial.tasks[0];
    const updatedTasks = initial.tasks.map((t) =>
      t.taskId === firstTask.taskId ? { ...t, status: 'Completed' as const } : t
    );

    const regenerated = generateDeterministicRoadmap(
      'Full Stack Developer',
      ['HTML', 'CSS'],
      updatedTasks,
      { [firstTask.taskId]: 'Completed' }
    );
    const preserved = regenerated.tasks.find((t) => t.taskId === firstTask.taskId);
    expect(preserved?.status).toBe('Completed');

    // Switch to another role and switch back using statusHistory
    const otherRole = generateDeterministicRoadmap(
      'Data Analyst',
      ['HTML', 'CSS'],
      regenerated.tasks,
      { [firstTask.taskId]: 'Completed' }
    );
    const switchedBack = generateDeterministicRoadmap(
      'Full Stack Developer',
      ['HTML', 'CSS'],
      otherRole.tasks,
      { [firstTask.taskId]: 'Completed' }
    );
    expect(switchedBack.tasks.find((t) => t.taskId === firstTask.taskId)?.status).toBe('Completed');
  });

  it('builds distinct text-based learning guides with external resources and zero quizzes', () => {
    const roadmap = generateDeterministicRoadmap('Full Stack Developer', ['HTML', 'CSS']);
    const reactTask = roadmap.tasks.find((t) => t.skill === 'React')!;
    const nodeTask = roadmap.tasks.find((t) => t.skill === 'Node.js')!;

    const reactGuide = getLearningGuideForTask(reactTask, 'Full Stack Developer');
    const nodeGuide = getLearningGuideForTask(nodeTask, 'Full Stack Developer');

    expect(reactGuide.skill).toBe('React');
    expect(nodeGuide.skill).toBe('Node.js');
    expect(reactGuide.topics.length).toBeGreaterThanOrEqual(2);
    expect(reactGuide.topics[0].title).not.toBe(nodeGuide.topics[0].title);
    expect(reactGuide.resources.some((r) => r.url === 'https://react.dev/learn')).toBe(true);
    expect(nodeGuide.resources.some((r) => r.url === 'https://nodejs.org/en/learn')).toBe(true);
    expect(reactGuide.resources.some((r) => r.category === 'YouTube')).toBe(true);
  });
});

describe('Resume Analyzer & Zod Validation', () => {
  it('scores structured student resume text transparently', () => {
    const sampleResume = `
      Aisha Khan
      aisha@university.edu | +91 9876543210 | github.com/aishakhan | linkedin.com/in/aishakhan
      EDUCATION
      B.Tech in Computer Science and Engineering, CGPA: 8.6
      TECHNICAL SKILLS
      HTML, CSS, JavaScript, TypeScript, React, Node.js, MongoDB, Git, APIs
      PROJECTS
      CareerIQ Analytics Platform - Built full-stack app serving 200 users and improved load latency by 35%.
      EXPERIENCE
      Software Engineering Intern - Designed REST APIs and automated unit tests.
      CERTIFICATIONS
      AWS Cloud Practitioner Certified
    `;

    const result = analyzeResumeText(sampleResume, 'Full Stack Developer');
    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.detectedSections).toContain('Education');
    expect(result.matchedSkills).toContain('React');
    expect(result.missingRoleSkills).not.toContain('React');
  });

  it('validates registration, profile, and assessment payloads strictly', () => {
    expect(
      registerSchema.safeParse({
        name: 'Aisha Khan',
        email: 'aisha@university.edu',
        password: 'Password123',
        confirmPassword: 'Mismatch123',
      }).success
    ).toBe(false);

    expect(
      profileUpdateSchema.safeParse({
        name: 'Aisha Khan',
        university: 'ABC University',
        degree: 'B.Tech',
        branch: 'CSE',
        semester: 7,
        cgpa: 8.4,
        sscPercentage: 85,
        hscPercentage: 82,
        hscStream: 'Science',
        degreeType: 'Sci&Tech',
        technicalSkills: ['React', 'Git'],
        programmingLanguages: ['TypeScript'],
        projects: [],
        internshipsCount: 1,
        hasWorkExperience: true,
        certifications: [],
        communicationLevel: 8,
        aptitudeScore: 80,
        codingPracticeHours: 10,
        careerInterests: ['Full Stack Development'],
        targetRole: 'Full Stack Developer',
      }).success
    ).toBe(true);

    expect(
      assessmentSubmitSchema.safeParse({
        academics: {
          sscPercentage: 150, // invalid > 100
        },
      }).success
    ).toBe(false);
  });
});
