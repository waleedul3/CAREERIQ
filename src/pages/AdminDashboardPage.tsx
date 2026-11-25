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
import { AlertCircle, Search } from 'lucide-react';
import { apiRequest } from '../lib/api.ts';

interface AdminDashboardData {
  summary: {
    totalStudents: number;
    completedAssessments: number;
    analyzedResumes: number;
    averageReadiness: number;
  };
  predictionDistribution: Array<{ category: string; count: number }>;
  popularRoles: Array<{ role: string; count: number }>;
  commonSkillGaps: Array<{ skill: string; count: number }>;
  assessmentTrends: Array<{ date: string; assessments: number; avgReadiness: number }>;
  recentActivity: Array<{ action: string; targetType: string; summary: string; createdAt: string }>;
}

interface AdminStudentRow {
  id: string;
  name: string;
  university: string;
  branch: string;
  semester: number;
  cgpa: number;
  targetRole: string;
  skillsCount: number;
  assessmentsCount: number;
  latestReadinessScore: number | null;
  latestReadinessCategory: string;
}

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStudents = async (nextPage: number, q: string) => {
    const res = await apiRequest<{
      students: AdminStudentRow[];
      pagination: { page: number; totalPages: number };
    }>(`/api/admin/students?page=${nextPage}&limit=8&search=${encodeURIComponent(q)}`);
    setStudents(res.students);
    setPage(res.pagination.page);
    setTotalPages(res.pagination.totalPages);
  };

  useEffect(() => {
    let active = true;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [dashRes] = await Promise.all([
          apiRequest<AdminDashboardData>('/api/admin/dashboard'),
          loadStudents(1, ''),
        ]);
        if (active) setData(dashRes);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load admin console.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>Administrator access required</span>
        </div>
        <p className="mt-1">{error || 'Unable to load administrator analytics.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
          Server-verified administrator console · Aggregated cohort analytics
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Institution readiness overview
        </h1>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-[#1D4ED8] p-5 text-white">
          <div className="text-xs text-blue-100">Registered students</div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums">
            {data.summary.totalStudents}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Completed assessments</div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {data.summary.completedAssessments}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Average cohort readiness</div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {data.summary.averageReadiness}/100
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Analyzed resumes</div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {data.summary.analyzedResumes}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Prediction category distribution
          </h2>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.predictionDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Predictions" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Most common missing required skills
          </h2>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.commonSkillGaps} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="skill" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Students Missing" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Popular target career roles
          </h2>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularRoles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="role" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Assessment volume & average readiness trend
          </h2>
          {data.assessmentTrends.length === 0 ? (
            <div className="mt-6 flex h-52 items-center justify-center text-xs text-slate-500">
              No assessment submissions recorded yet.
            </div>
          ) : (
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.assessmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="avgReadiness"
                    name="Avg Readiness"
                    stroke="#1D4ED8"
                    fill="#DBEAFE"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Paginated Student Table (non-PII sanitized) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Student readiness roster
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void loadStudents(1, search);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name..."
                className="rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <th className="py-2.5 pr-4 font-semibold">Student</th>
                <th className="py-2.5 pr-4 font-semibold">Institution & Branch</th>
                <th className="py-2.5 pr-4 font-semibold">Target Role</th>
                <th className="py-2.5 pr-4 font-semibold text-right">CGPA</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Assessments</th>
                <th className="py-2.5 font-semibold text-right">Latest Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                    {st.name}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                    {st.university} · {st.branch}
                  </td>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-200">{st.targetRole}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {st.cgpa ? st.cgpa.toFixed(2) : '—'}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {st.assessmentsCount}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums">
                    {st.latestReadinessScore !== null
                      ? `${st.latestReadinessScore}/100 (${st.latestReadinessCategory})`
                      : 'Not Assessed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void loadStudents(page - 1, search)}
              className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => void loadStudents(page + 1, search)}
              className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      {data.recentActivity.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent platform activity
          </h2>
          <ul className="mt-3 divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {data.recentActivity.map((log, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-slate-700 dark:text-slate-300">{log.summary}</span>
                <span className="shrink-0 font-mono tabular-nums text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
