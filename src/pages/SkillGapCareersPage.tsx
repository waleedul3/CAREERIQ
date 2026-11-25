import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { apiRequest } from '../lib/api.ts';
import { analyzeSkillGap, CAREER_ROLES, recommendCareers } from '../lib/careerRoles.ts';
import type { StudentProfileData } from '../types/index.ts';

export function SkillGapCareersPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ profile: StudentProfileData }>('/api/profile')
      .then(({ profile: p }) => {
        setProfile(p);
        setSelectedRole(p.targetRole || 'Full Stack Developer');
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  const skills = profile?.technicalSkills || [];
  const gap = analyzeSkillGap(skills, selectedRole);
  const recommendations = recommendCareers({
    skills,
    interests: profile?.careerInterests || [],
    degreeType: profile?.degreeType || 'Sci&Tech',
    cgpaPercent: (profile?.cgpa || 7.5) * 10,
    codingPracticeHours: profile?.codingPracticeHours || 6,
    targetRole: profile?.targetRole,
  });

  const roleChartData = recommendations.slice(0, 6).map((r) => ({
    role: r.role.name.replace(' Developer', '').replace(' Engineer', ' Eng.'),
    fit: r.overallFitScore,
    skills: r.skillMatchScore,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            Transparent rule-based analytics (non-ML)
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Skill gap analysis & career pathways
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="role-select" className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Inspect role:
          </label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
          >
            {CAREER_ROLES.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Role Skill Gap Matrix */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{gap.role.name}</h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {gap.role.description}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1D4ED8] dark:text-blue-400">
                {gap.coveragePercent}%
              </div>
              <div className="text-[11px] text-slate-500">Weighted match</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Existing matched skills ({gap.matchedRequired.length + gap.matchedPreferred.length})
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[...gap.matchedRequired, ...gap.matchedPreferred].length === 0 ? (
                  <span className="text-xs text-slate-500">No role skills matched yet.</span>
                ) : (
                  [...gap.matchedRequired, ...gap.matchedPreferred].map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-medium text-emerald-800 border border-emerald-200 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Missing skills ({gap.missingRequired.length + gap.missingPreferred.length})
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {gap.missingRequired.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-white px-2 py-1 text-xs font-semibold text-amber-900 border border-amber-300 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300"
                  >
                    {s} (Required)
                  </span>
                ))}
                {gap.missingPreferred.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-white px-2 py-1 text-xs text-slate-700 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {s} (Preferred)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {gap.prioritizedGaps.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Prioritized learning actions
              </div>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {gap.prioritizedGaps.slice(0, 5).map((item) => (
                  <li key={item.skill} className="flex items-start justify-between gap-3">
                    <span>
                      <strong className="text-slate-900 dark:text-white">{item.skill}:</strong>{' '}
                      {item.recommendedActivity}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                      {item.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigate('/roadmap')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <span>View roadmap tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Career Recommendations Chart */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Top career role fit scores
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Weighted score: 55% skills + 25% interests + 20% academic/coding alignment
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="role" width={95} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="fit" name="Overall Fit %" fill="#1D4ED8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* All 11 Career Recommendations Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          All internal career role recommendations ({recommendations.length})
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {recommendations.map((rec) => (
            <div
              key={rec.role.id}
              onClick={() => setSelectedRole(rec.role.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedRole(rec.role.name);
              }}
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                selectedRole === rec.role.name
                  ? 'border-blue-700 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/30'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">{rec.role.category}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rec.role.name}
                  </h3>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-bold text-[#1D4ED8] dark:text-blue-400">
                    {rec.overallFitScore}%
                  </div>
                  <div className="text-[11px] text-slate-500">overall fit</div>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {rec.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
