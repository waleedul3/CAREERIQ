import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Compass,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '../lib/api.ts';
import { analyzeSkillGap, recommendCareers } from '../lib/careerRoles.ts';
import type {
  PredictionRecord,
  ResumeAnalysisRecord,
  RoadmapRecord,
  StudentProfileData,
} from '../types/index.ts';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapRecord | null>(null);
  const [resumes, setResumes] = useState<ResumeAnalysisRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [profRes, predRes, roadRes, resumeRes] = await Promise.all([
          apiRequest<{ profile: StudentProfileData }>('/api/profile'),
          apiRequest<{ predictions: PredictionRecord[] }>('/api/predictions'),
          apiRequest<{ roadmap: RoadmapRecord }>('/api/roadmap'),
          apiRequest<{ analyses: ResumeAnalysisRecord[] }>('/api/resume/history'),
        ]);
        if (!active) return;
        setProfile(profRes.profile);
        setPredictions(predRes.predictions);
        setRoadmap(roadRes.roadmap);
        setResumes(resumeRes.analyses);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>Unable to load dashboard</span>
        </div>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const latest = predictions[0] || null;
  const latestResume = resumes[0] || null;
  const targetRole = profile?.targetRole || 'Full Stack Developer';
  const skillGap = analyzeSkillGap(profile?.technicalSkills || [], targetRole);

  const recommended = recommendCareers({
    skills: profile?.technicalSkills || [],
    interests: profile?.careerInterests || [],
    degreeType: profile?.degreeType || 'Sci&Tech',
    cgpaPercent: (profile?.cgpa || 7.5) * 10,
    codingPracticeHours: profile?.codingPracticeHours || 6,
    targetRole,
  }).slice(0, 3);

  const completedTasks = roadmap?.tasks.filter((t) => t.status === 'Completed').length || 0;
  const totalTasks = roadmap?.tasks.length || 0;
  const roadmapPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const trajectoryData = predictions
    .slice()
    .reverse()
    .map((p, idx) => ({
      attempt: `#${idx + 1}`,
      date: new Date(p.createdAt).toLocaleDateString(),
      readiness: p.readinessScore,
      mlProb: Math.round(p.probability * 100),
    }));

  const factorChartData = (latest?.topFactors || []).slice(0, 5).map((f) => ({
    name: f.feature.replace('_', ' ').toUpperCase(),
    importance: Math.round(f.importance * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Employability overview
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Target pathway: <span className="font-semibold text-slate-900 dark:text-white">{targetRole}</span> ·{' '}
            {profile?.university || 'Update university in Profile'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/profile')}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/assessment')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>{latest ? 'New assessment' : 'Take first assessment'}</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-[#1D4ED8] p-5 text-white">
          <div className="text-xs text-blue-100">Latest readiness score</div>
          <div className="mt-2 flex items-baseline gap-1 font-display">
            <span className="text-3xl font-extrabold tabular-nums">
              {latest ? latest.readinessScore : '—'}
            </span>
            {latest && <span className="text-sm text-blue-100">/100</span>}
          </div>
          <div className="mt-2 text-xs text-blue-100">
            {latest ? `${latest.readinessCategory} · ML ${Math.round(latest.probability * 100)}%` : 'No assessment submitted yet'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Role skill coverage</div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {skillGap.coveragePercent}%
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {skillGap.matchedRequired.length}/{skillGap.role.requiredSkills.length} required skills for {targetRole}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Roadmap completion</div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {roadmapPct}%
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Latest resume score</div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {latestResume ? `${latestResume.overallScore}/100` : '—'}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {latestResume ? latestResume.fileName : 'Upload a resume to analyze'}
          </div>
        </div>
      </div>

      {/* Empty CTA Banner if no assessments yet */}
      {!latest && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Complete your first employability assessment
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Submit your academic profile, aptitude percentage, and practical experience to run our
            trained Random Forest model directly in your browser via ONNX Runtime Web.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/assessment')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <span>Start assessment</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Readiness & ML probability history
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracks composite readiness vs ONNX placement probability across submissions
              </p>
            </div>
          </div>

          {trajectoryData.length === 0 ? (
            <div className="mt-6 flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 dark:border-slate-800">
              Submit an assessment to visualize your progress trajectory.
            </div>
          ) : (
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="readiness"
                    name="Composite Readiness"
                    stroke="#1D4ED8"
                    fill="#DBEAFE"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="mlProb"
                    name="ML Probability %"
                    stroke="#0F766E"
                    fill="#CCFBF1"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Model feature weights (%)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Global Gini importance in RandomForestClassifier (not causal proof)
          </p>

          {factorChartData.length === 0 ? (
            <div className="mt-6 flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 dark:border-slate-800">
              Feature attribution appears after your first prediction.
            </div>
          ) : (
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={factorChartData} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 35]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={74} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="importance" name="Importance %" fill="#1D4ED8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Strengths, Gaps, and Career Matches */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Strengths & improvement areas
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('/careers')}
              className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
            >
              View skill gaps
            </button>
          </div>

          {latest ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Identified strengths
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {latest.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Priority improvements
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {latest.improvements.map((imp, i) => (
                    <li key={i}>· {imp}</li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{latest.disclaimer}</p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              Complete an assessment to generate strengths and model-grounded recommendations.
            </p>
          )}
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Top recommended career pathways
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('/careers')}
              className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
            >
              Explore all 11 roles
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Rule-based matching across your skills, interests, and academic track
          </p>

          <div className="mt-4 space-y-3">
            {recommended.map((item) => (
              <div
                key={item.role.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.role.name}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.missingCoreSkills.length > 0
                      ? `Missing: ${item.missingCoreSkills.slice(0, 3).join(', ')}`
                      : 'All core skills matched'}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold font-mono tabular-nums text-[#1D4ED8] dark:text-blue-400">
                    {item.overallFitScore}% fit
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.skillMatchScore}% skill match
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/roadmap')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Open roadmap</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/resume')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Analyze resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assessment History Table */}
      {predictions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Assessment & prediction history
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {predictions.length} record{predictions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">Date</th>
                  <th className="py-2.5 pr-4 font-semibold">Readiness Category</th>
                  <th className="py-2.5 pr-4 font-semibold">Model Class</th>
                  <th className="py-2.5 pr-4 font-semibold text-right">ML Probability</th>
                  <th className="py-2.5 pr-4 font-semibold text-right">Composite Score</th>
                  <th className="py-2.5 font-semibold">Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                      {p.readinessCategory}
                    </td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                      {p.predictedClass}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {Math.round(p.probability * 100)}%
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                      {p.readinessScore}/100
                    </td>
                    <td className="py-3 text-slate-500">{p.inferenceEngine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
