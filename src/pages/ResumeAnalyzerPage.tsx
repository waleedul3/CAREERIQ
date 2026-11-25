import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, CheckCircle2, FileText, Upload } from 'lucide-react';
import { apiRequest } from '../lib/api.ts';
import { CAREER_ROLES } from '../lib/careerRoles.ts';
import type { ResumeAnalysisRecord } from '../types/index.ts';

const MAX_BYTES = 5 * 1024 * 1024;

export function ResumeAnalyzerPage() {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<ResumeAnalysisRecord | null>(null);
  const [history, setHistory] = useState<ResumeAnalysisRecord[]>([]);

  useEffect(() => {
    apiRequest<{ analyses: ResumeAnalysisRecord[] }>('/api/resume/history')
      .then((res) => {
        setHistory(res.analyses);
        if (res.analyses.length > 0) setCurrent(res.analyses[0]);
      })
      .catch(() => undefined);
  }, []);

  const handleFilePick = (file: File | null) => {
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.txt')) {
      setError('Unsupported file type. Please choose a .pdf, .docx, or .txt resume.');
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_BYTES || file.size === 0) {
      setError('File size must be greater than 0 bytes and under 5 MB.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read selected file.'));
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Select a PDF, DOCX, or TXT resume file first.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const base64Data = await fileToBase64(selectedFile);
      const res = await apiRequest<{ analysis: ResumeAnalysisRecord }>('/api/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          base64Data,
          targetRole,
        }),
      });
      setCurrent(res.analysis);
      setHistory((prev) => [res.analysis, ...prev]);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const sectionChartData = current
    ? [
        { section: 'Contact (15)', score: current.sectionScores.contactInfo },
        { section: 'Education (15)', score: current.sectionScores.education },
        { section: 'Skills (25)', score: current.sectionScores.skills },
        { section: 'Projects (15)', score: current.sectionScores.projects },
        { section: 'Experience (15)', score: current.sectionScores.experience },
        { section: 'Certs (5)', score: current.sectionScores.certifications },
        { section: 'Structure (10)', score: current.sectionScores.formattingSignals },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
          Open-source PDF/DOCX extraction · Transparent rule-based rubric
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Resume analyzer</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Upload your resume to evaluate section completeness, target-role keyword coverage, and
          basic ATS-oriented formatting signals without paid APIs.
        </p>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleAnalyze}
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-4 md:grid-cols-12 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="resume-file"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Resume file (.pdf, .docx, .txt · max 5 MB)
            </label>
            <label
              htmlFor="resume-file"
              className="mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 hover:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span className="truncate">
                {selectedFile ? selectedFile.name : 'Choose resume file...'}
              </span>
              <Upload className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
              className="sr-only"
            />
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="resume-role"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Target career role
            </label>
            <select
              id="resume-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {CAREER_ROLES.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={analyzing || !selectedFile}
              className="w-full rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {analyzing ? 'Extracting & scoring...' : 'Analyze resume'}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </form>

      {/* Current Analysis Output */}
      {current ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-xl bg-[#1D4ED8] p-6 text-white">
              <div className="text-xs text-blue-100">Transparent rubric score</div>
              <div className="mt-2 flex items-baseline gap-1 font-display">
                <span className="text-4xl font-extrabold tabular-nums">{current.overallScore}</span>
                <span className="text-base text-blue-100">/100</span>
              </div>
              <div className="mt-3 text-xs text-blue-100">
                File: {current.fileName} · {current.wordCount} words
              </div>
              <div className="mt-1 text-xs text-blue-100">Target Role: {current.targetRole}</div>
              <p className="mt-4 text-[11px] leading-relaxed text-blue-100">
                {current.scoringMethodNote}
              </p>
            </div>

            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Section score breakdown
              </h2>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="section" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 25]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" name="Points Earned" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detected sections & keywords
              </h3>
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <strong>Sections found:</strong> {current.detectedSections.join(' · ') || 'None detected'}
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Matched technical keywords ({current.matchedSkills.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {current.matchedSkills.map((kw) => (
                    <span
                      key={kw}
                      className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              {current.missingRoleSkills.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Missing {current.targetRole} keywords
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {current.missingRoleSkills.map((kw) => (
                      <span
                        key={kw}
                        className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ATS-oriented signals & recommendations
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {current.atsSignals.map((sig, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-700 mt-0.5" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Actionable improvements
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {current.recommendations.map((rec, i) => (
                    <li key={i}>· {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <FileText className="mx-auto h-8 w-8 text-slate-400" />
          <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No resume analyzed yet
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Upload a PDF, DOCX, or plain-text resume above to inspect your section breakdown.
          </p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Previous resume analyses
          </h2>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(item)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left text-xs hover:bg-slate-50 px-2 rounded dark:hover:bg-slate-800/40"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.fileName}</div>
                  <div className="text-slate-500">
                    {item.targetRole} · {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-mono tabular-nums font-bold text-[#1D4ED8] dark:text-blue-400">
                  {item.overallScore}/100
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
