import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Info,
} from 'lucide-react';
import { apiRequest } from '../lib/api.ts';
import { CAREER_ROLES } from '../lib/careerRoles.ts';
import { runEmployabilityOnnxInference } from '../lib/onnxInference.ts';
import { assessmentSubmitSchema } from '../lib/validation.ts';
import type {
  AssessmentSubmission,
  PredictionRecord,
  StudentProfileData,
} from '../types/index.ts';

const STEPS = [
  '01. Academic Context',
  '02. Technical & Coding',
  '03. Experience & Projects',
  '04. Aptitude & Review',
];

export function AssessmentPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [step, setStep] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionRecord | null>(null);

  const [sscPercentage, setSscPercentage] = useState(76);
  const [hscPercentage, setHscPercentage] = useState(74);
  const [hscStream, setHscStream] = useState<'Science' | 'Commerce' | 'Arts'>('Science');
  const [degreePercentage, setDegreePercentage] = useState(74);
  const [degreeType, setDegreeType] = useState<'Sci&Tech' | 'Comm&Mgmt' | 'Others'>('Sci&Tech');
  const [specializationTrack, setSpecializationTrack] = useState<'Mkt&Fin' | 'Mkt&HR'>('Mkt&Fin');
  const [coreSpecializationPercentage, setCoreSpecializationPercentage] = useState(70);

  const [skillsText, setSkillsText] = useState('HTML, CSS, JavaScript, React, Git, SQL');
  const [langsText, setLangsText] = useState('JavaScript, Python');
  const [problemSolvingScore, setProblemSolvingScore] = useState(7);
  const [codingPracticeHours, setCodingPracticeHours] = useState(8);

  const [projectsCount, setProjectsCount] = useState(3);
  const [internshipsCount, setInternshipsCount] = useState(1);
  const [hasWorkExperience, setHasWorkExperience] = useState(true);
  const [certificationsCount, setCertificationsCount] = useState(2);

  const [aptitudeTestPercentage, setAptitudeTestPercentage] = useState(78);
  const [communicationRating, setCommunicationRating] = useState(7);
  const [interviewReadinessRating, setInterviewReadinessRating] = useState(7);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [interestsText, setInterestsText] = useState('Full Stack Development, Cloud Engineering');

  useEffect(() => {
    let active = true;
    apiRequest<{ profile: StudentProfileData }>('/api/profile')
      .then(({ profile }) => {
        if (!active) return;
        setSscPercentage(profile.sscPercentage || 75);
        setHscPercentage(profile.hscPercentage || 74);
        setHscStream(profile.hscStream || 'Science');
        setDegreePercentage(Number(((profile.cgpa || 7.5) * 10).toFixed(1)));
        setDegreeType(profile.degreeType || 'Sci&Tech');
        setSkillsText(profile.technicalSkills.join(', ') || 'HTML, CSS, JavaScript, Git');
        setLangsText(profile.programmingLanguages.join(', ') || 'JavaScript, Python');
        setCodingPracticeHours(profile.codingPracticeHours || 6);
        setProjectsCount(Math.max(1, profile.projects.length));
        setInternshipsCount(profile.internshipsCount || 0);
        setHasWorkExperience(profile.hasWorkExperience || profile.internshipsCount > 0);
        setCertificationsCount(profile.certifications.length);
        setAptitudeTestPercentage(profile.aptitudeScore || 72);
        setCommunicationRating(profile.communicationLevel || 7);
        setTargetRole(profile.targetRole || 'Full Stack Developer');
        setInterestsText(profile.careerInterests.join(', ') || 'Full Stack Development');
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const parseCsv = (val: string) =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const buildPayload = (): AssessmentSubmission => {
    const modelFeatures = {
      ssc_p: sscPercentage,
      hsc_p: hscPercentage,
      degree_p: degreePercentage,
      etest_p: aptitudeTestPercentage,
      mba_p: coreSpecializationPercentage,
      hsc_s: hscStream,
      degree_t: degreeType,
      workex: (hasWorkExperience || internshipsCount > 0 ? 'Yes' : 'No') as 'Yes' | 'No',
      specialisation: specializationTrack,
    };

    return {
      academics: {
        sscPercentage,
        hscPercentage,
        hscStream,
        degreePercentage,
        degreeType,
        specializationTrack,
        coreSpecializationPercentage,
      },
      skills: {
        technicalSkills: parseCsv(skillsText),
        programmingLanguages: parseCsv(langsText),
        problemSolvingScore,
        codingPracticeHours,
      },
      experience: {
        projectsCount,
        internshipsCount,
        hasWorkExperience: hasWorkExperience || internshipsCount > 0,
        certificationsCount,
      },
      readiness: {
        aptitudeTestPercentage,
        communicationRating,
        interviewReadinessRating,
        targetRole,
        careerInterests: parseCsv(interestsText),
      },
      modelFeatures,
    };
  };

  const handleSubmitAssessment = async () => {
    setError(null);
    const basePayload = buildPayload();
    const parsed = assessmentSubmitSchema.safeParse(basePayload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Please check all assessment fields.');
      return;
    }

    setSubmitting(true);
    try {
      let clientPrediction: AssessmentSubmission['clientPrediction'] | undefined;
      try {
        const onnxOut = await runEmployabilityOnnxInference(basePayload.modelFeatures);
        clientPrediction = {
          predictedClass: onnxOut.predictedClass,
          probability: onnxOut.probability,
          inferenceEngine: 'onnxruntime-web',
        };
      } catch {
        // If WASM execution fails in a restricted client browser, server uses explicit fallback
        clientPrediction = undefined;
      }

      const res = await apiRequest<{ prediction: PredictionRecord }>('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({ ...basePayload, clientPrediction }),
      });
      setPrediction(res.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  if (prediction) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              ONNX Inference Complete · {prediction.modelName} v{prediction.modelVersion}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              Employability assessment results
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPrediction(null);
                setStep(0);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Retake assessment
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Back to overview
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 rounded-xl bg-[#1D4ED8] p-6 text-white">
            <div className="text-xs text-blue-100">Predicted readiness category</div>
            <div className="mt-2 text-3xl font-extrabold font-display">
              {prediction.readinessCategory}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-blue-500/40 pt-4">
              <div>
                <div className="text-xs text-blue-100">ML Placement Probability</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums">
                  {Math.round(prediction.probability * 100)}%
                </div>
                <div className="text-[11px] text-blue-100">Class: {prediction.predictedClass}</div>
              </div>
              <div>
                <div className="text-xs text-blue-100">Composite Readiness</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums">
                  {prediction.readinessScore}/100
                </div>
                <div className="text-[11px] text-blue-100">Engine: {prediction.inferenceEngine}</div>
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-blue-100">{prediction.disclaimer}</p>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Supported ML model feature breakdown
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Factors actually consumed by the trained RandomForestClassifier ONNX graph
            </p>
            <div className="mt-4 space-y-2.5">
              {prediction.topFactors.map((f) => (
                <div
                  key={f.feature}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{f.label}</div>
                    <div className="text-slate-500 dark:text-slate-400">{f.studentValue}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {(f.importance * 100).toFixed(1)}% weight
                    </div>
                    <div
                      className={`text-[11px] font-medium ${
                        f.direction === 'positive'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : f.direction === 'attention'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-500'
                      }`}
                    >
                      {f.direction === 'positive'
                        ? 'Above cohort baseline'
                        : f.direction === 'attention'
                          ? 'Needs attention'
                          : 'Near cohort baseline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Key strengths</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {prediction.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended next actions
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {prediction.improvements.map((imp, idx) => (
                <li key={idx}>· {imp}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onNavigate('/roadmap')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
            >
              <span>Open personalized learning roadmap</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Employability assessment
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Complete all four sections to compute your ONNX machine learning estimate and rule-based
          career guidance.
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(idx)}
            className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
              step === idx
                ? 'border-blue-700 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200'
                : idx < step
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Academic performance & degree track
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Directly mapped to the trained Campus Recruitment model features (`ssc_p`, `hsc_p`,
                `degree_p`, `mba_p`, `hsc_s`, `degree_t`, `specialisation`).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  10th Grade Percentage (`ssc_p`)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={sscPercentage}
                  onChange={(e) => setSscPercentage(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  12th Grade Percentage (`hsc_p`)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={hscPercentage}
                  onChange={(e) => setHscPercentage(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  12th Stream (`hsc_s`)
                </label>
                <select
                  value={hscStream}
                  onChange={(e) => setHscStream(e.target.value as 'Science' | 'Commerce' | 'Arts')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  UG Percentage / CGPA×10 (`degree_p`)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={degreePercentage}
                  onChange={(e) => setDegreePercentage(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  UG Degree Category (`degree_t`)
                </label>
                <select
                  value={degreeType}
                  onChange={(e) =>
                    setDegreeType(e.target.value as 'Sci&Tech' | 'Comm&Mgmt' | 'Others')
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Sci&Tech">Sci&amp;Tech</option>
                  <option value="Comm&Mgmt">Comm&amp;Mgmt</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Core Specialization Avg % (`mba_p` proxy)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={coreSpecializationPercentage}
                  onChange={(e) => setCoreSpecializationPercentage(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cohort Track Mapping (`specialisation`)
                </label>
                <select
                  value={specializationTrack}
                  onChange={(e) =>
                    setSpecializationTrack(e.target.value as 'Mkt&Fin' | 'Mkt&HR')
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Mkt&Fin">Quantitative / Systems Track (Mkt&amp;Fin)</option>
                  <option value="Mkt&HR">Product / Management Track (Mkt&amp;HR)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Technical skills & coding practice
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Used for rule-based skill gap analysis, career recommendations, and composite
                readiness (not fabricated as ML training features).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Technical skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Programming languages (comma-separated)
                </label>
                <input
                  type="text"
                  value={langsText}
                  onChange={(e) => setLangsText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Problem solving / DSA confidence (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={problemSolvingScore}
                  onChange={(e) => setProblemSolvingScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weekly coding practice hours (0–80)
                </label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={codingPracticeHours}
                  onChange={(e) => setCodingPracticeHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Projects, internships & certifications
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Work / internship experience maps directly to the `workex` ML model feature; project
                and certification counts inform practical readiness analytics.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Prior Work / Internship (`workex`)
                </label>
                <select
                  value={hasWorkExperience ? 'Yes' : 'No'}
                  onChange={(e) => setHasWorkExperience(e.target.value === 'Yes')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Internships completed
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={internshipsCount}
                  onChange={(e) => setInternshipsCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Applied technical projects
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={projectsCount}
                  onChange={(e) => setProjectsCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Verified certifications
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={certificationsCount}
                  onChange={(e) => setCertificationsCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Aptitude, interview readiness & review
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review the exact 9 features sent to the ONNX Random Forest model before submitting.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Aptitude / Employability Test % (`etest_p`)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={aptitudeTestPercentage}
                  onChange={(e) => setAptitudeTestPercentage(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Communication readiness (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={communicationRating}
                  onChange={(e) => setCommunicationRating(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Interview readiness (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={interviewReadinessRating}
                  onChange={(e) => setInterviewReadinessRating(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target career role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  {CAREER_ROLES.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Career interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Cpu className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <span>ML Model Input Summary (ONNX Runtime Web)</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-slate-600 sm:grid-cols-3 dark:text-slate-300">
                <span>ssc_p: {sscPercentage}%</span>
                <span>hsc_p: {hscPercentage}%</span>
                <span>degree_p: {degreePercentage}%</span>
                <span>etest_p: {aptitudeTestPercentage}%</span>
                <span>mba_p: {coreSpecializationPercentage}%</span>
                <span>hsc_s: {hscStream}</span>
                <span>degree_t: {degreeType}</span>
                <span>workex: {hasWorkExperience || internshipsCount > 0 ? 'Yes' : 'No'}</span>
                <span>specialisation: {specializationTrack}</span>
              </div>
              <div className="mt-2.5 flex items-start gap-2 text-[11px] text-slate-500">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Other inputs (skills, coding hours, projects, communication) power CareerIQ&apos;s
                  separate rule-based analytics and roadmap engine.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <span>Next section</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitAssessment()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <span>{submitting ? 'Running ONNX model & saving...' : 'Submit & predict employability'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
