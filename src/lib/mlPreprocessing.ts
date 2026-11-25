import type { AssessmentSubmission, FeatureFactor, ModelFeatureInput } from '../types/index.ts';

// Exact preprocessing parameters exported from ml/evaluation/metrics.json (schemaVersion 1.0.0)
export const PREPROCESSING_SPEC = {
  schemaVersion: '1.0.0',
  numericFeatures: [
    { name: 'ssc_p', mean: 67.16959302325581, scale: 10.855730528135185 },
    { name: 'hsc_p', mean: 66.3961046511628, scale: 10.954723970421067 },
    { name: 'degree_p', mean: 66.21982558139534, scale: 7.314514200740468 },
    { name: 'etest_p', mean: 72.61459302325582, scale: 13.337766032636301 },
    { name: 'mba_p', mean: 62.27529069767441, scale: 5.971020171816458 },
  ] as const,
  categoricalFeatures: [
    { name: 'hsc_s', categories: ['Arts', 'Commerce', 'Science'] },
    { name: 'degree_t', categories: ['Comm&Mgmt', 'Others', 'Sci&Tech'] },
    { name: 'workex', categories: ['No', 'Yes'] },
    { name: 'specialisation', categories: ['Mkt&Fin', 'Mkt&HR'] },
  ] as const,
  inputVectorLength: 15,
};

export const RF_FEATURE_IMPORTANCES: Record<string, { label: string; importance: number }> = {
  ssc_p: { label: 'Secondary (10th) Academic Score', importance: 0.2915 },
  degree_p: { label: 'Undergraduate Degree Percentage', importance: 0.2354 },
  hsc_p: { label: 'Higher Secondary (12th) Score', importance: 0.1572 },
  mba_p: { label: 'Core Specialization / Track Average', importance: 0.0989 },
  etest_p: { label: 'Employability & Aptitude Test Score', importance: 0.062 },
  workex: { label: 'Prior Work / Internship Experience', importance: 0.0608 },
  specialisation: { label: 'Specialization Track Indicator', importance: 0.0606 },
  degree_t: { label: 'Undergraduate Discipline Category', importance: 0.0183 },
  hsc_s: { label: 'Higher Secondary Stream', importance: 0.0152 },
};

function clampPercent(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.max(0, Math.min(100, val));
}

/**
 * Deterministically transforms supported model input features into the exact
 * 15-element float32 tensor expected by public/models/employability_model.onnx.
 */
export function encodeFeaturesToFloat32(input: ModelFeatureInput): Float32Array {
  const vec = new Float32Array(PREPROCESSING_SPEC.inputVectorLength);
  let idx = 0;

  // 1. Numeric features standardized with training-split mean & scale
  const numericValues: Record<string, number> = {
    ssc_p: clampPercent(input.ssc_p),
    hsc_p: clampPercent(input.hsc_p),
    degree_p: clampPercent(input.degree_p),
    etest_p: clampPercent(input.etest_p),
    mba_p: clampPercent(input.mba_p),
  };

  for (const spec of PREPROCESSING_SPEC.numericFeatures) {
    const raw = numericValues[spec.name];
    vec[idx++] = (raw - spec.mean) / spec.scale;
  }

  // 2. Categorical features one-hot encoded in exact training column order
  const catValues: Record<string, string> = {
    hsc_s: input.hsc_s,
    degree_t: input.degree_t,
    workex: input.workex,
    specialisation: input.specialisation,
  };

  for (const catSpec of PREPROCESSING_SPEC.categoricalFeatures) {
    const selected = catValues[catSpec.name];
    for (const option of catSpec.categories) {
      vec[idx++] = selected === option ? 1.0 : 0.0;
    }
  }

  return vec;
}

export function classifyReadinessCategory(
  probability: number
): 'High Readiness' | 'Moderate Readiness' | 'Developing Readiness' {
  if (probability >= 0.72) return 'High Readiness';
  if (probability >= 0.45) return 'Moderate Readiness';
  return 'Developing Readiness';
}

export function buildExplanationAndGuidance(
  submission: AssessmentSubmission,
  probability: number
): {
  topFactors: FeatureFactor[];
  strengths: string[];
  improvements: string[];
  readinessScore: number;
} {
  const mf = submission.modelFeatures;

  const topFactors: FeatureFactor[] = [
    {
      feature: 'ssc_p',
      label: RF_FEATURE_IMPORTANCES.ssc_p.label,
      importance: RF_FEATURE_IMPORTANCES.ssc_p.importance,
      studentValue: `${mf.ssc_p.toFixed(1)}% (cohort mean 67.2%)`,
      direction: mf.ssc_p >= 68 ? 'positive' : mf.ssc_p >= 58 ? 'neutral' : 'attention',
    },
    {
      feature: 'degree_p',
      label: RF_FEATURE_IMPORTANCES.degree_p.label,
      importance: RF_FEATURE_IMPORTANCES.degree_p.importance,
      studentValue: `${mf.degree_p.toFixed(1)}% (cohort mean 66.2%)`,
      direction: mf.degree_p >= 68 ? 'positive' : mf.degree_p >= 60 ? 'neutral' : 'attention',
    },
    {
      feature: 'hsc_p',
      label: RF_FEATURE_IMPORTANCES.hsc_p.label,
      importance: RF_FEATURE_IMPORTANCES.hsc_p.importance,
      studentValue: `${mf.hsc_p.toFixed(1)}% (cohort mean 66.4%)`,
      direction: mf.hsc_p >= 68 ? 'positive' : mf.hsc_p >= 58 ? 'neutral' : 'attention',
    },
    {
      feature: 'mba_p',
      label: RF_FEATURE_IMPORTANCES.mba_p.label,
      importance: RF_FEATURE_IMPORTANCES.mba_p.importance,
      studentValue: `${mf.mba_p.toFixed(1)}% (cohort mean 62.3%)`,
      direction: mf.mba_p >= 64 ? 'positive' : mf.mba_p >= 58 ? 'neutral' : 'attention',
    },
    {
      feature: 'etest_p',
      label: RF_FEATURE_IMPORTANCES.etest_p.label,
      importance: RF_FEATURE_IMPORTANCES.etest_p.importance,
      studentValue: `${mf.etest_p.toFixed(1)}% (cohort mean 72.6%)`,
      direction: mf.etest_p >= 75 ? 'positive' : mf.etest_p >= 62 ? 'neutral' : 'attention',
    },
    {
      feature: 'workex',
      label: RF_FEATURE_IMPORTANCES.workex.label,
      importance: RF_FEATURE_IMPORTANCES.workex.importance,
      studentValue: mf.workex === 'Yes' ? 'Yes (internship/work experience)' : 'No prior experience',
      direction: mf.workex === 'Yes' ? 'positive' : 'attention',
    },
  ];

  // Clearly separate ML feature drivers vs rule-based practical readiness indicators
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (mf.degree_p >= 70) {
    strengths.push(`Strong undergraduate academic standing (${mf.degree_p.toFixed(1)}%), above cohort average.`);
  } else if (mf.degree_p < 62) {
    improvements.push(`Raise undergraduate semester grades (${mf.degree_p.toFixed(1)}%) to clear campus recruiter cutoffs.`);
  }

  if (mf.etest_p >= 75) {
    strengths.push(`Solid aptitude & employability test performance (${mf.etest_p.toFixed(1)}%).`);
  } else {
    improvements.push(`Practice quantitative, logical, and verbal aptitude drills (currently ${mf.etest_p.toFixed(1)}%).`);
  }

  if (mf.workex === 'Yes' || submission.experience.internshipsCount > 0) {
    strengths.push('Practical work or internship experience strengthens recruiter screening readiness.');
  } else {
    improvements.push('Complete at least one hands-on internship, open-source contribution, or industry capstone.');
  }

  if (submission.experience.projectsCount >= 3) {
    strengths.push(`Built ${submission.experience.projectsCount} applied portfolio projects (rule-based readiness signal).`);
  } else {
    improvements.push('Ship 2–3 documented technical projects with live demos and clean READMEs.');
  }

  if (submission.skills.technicalSkills.length >= 5) {
    strengths.push(`Broad technical stack (${submission.skills.technicalSkills.length} recorded skills).`);
  } else {
    improvements.push('Expand core role-specific technical skills and document them in your profile.');
  }

  if (submission.readiness.communicationRating < 7) {
    improvements.push('Conduct mock behavioral & technical interviews to improve structured communication.');
  } else {
    strengths.push('High self-assessed communication and interview confidence.');
  }

  if (strengths.length === 0) {
    strengths.push('Baseline academic foundation is established and ready for targeted skill acceleration.');
  }

  // Composite Readiness Indicator combines ML probability (70%) + rule-based practical signals (30%)
  const practicalPoints =
    Math.min(10, submission.experience.projectsCount * 2.5) +
    (submission.experience.internshipsCount > 0 ? 7 : 0) +
    Math.min(5, submission.skills.technicalSkills.length * 0.8) +
    Math.min(4, submission.skills.codingPracticeHours * 0.3) +
    Math.min(4, submission.readiness.communicationRating * 0.4);

  const readinessScore = Math.round(
    Math.max(5, Math.min(99, probability * 70 + practicalPoints))
  );

  return { topFactors, strengths, improvements, readinessScore };
}

export const MODEL_DISCLAIMER =
  'This employability estimate is produced by a Random Forest model trained on 215 historical campus recruitment records. It reflects statistical cohort patterns—not causality or an employment guarantee.';
