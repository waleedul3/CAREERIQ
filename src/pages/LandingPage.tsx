import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Code2,
  Database,
  GitBranch,
  Layers,
  Moon,
  Sun,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark.tsx';
import { SampleEstimateModal } from '../components/SampleEstimateModal.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import type { ModelMetadataReport } from '../types/index.ts';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { user, darkMode, toggleDarkMode } = useAuth();
  const [sampleOpen, setSampleOpen] = useState(false);
  const [modelMeta, setModelMeta] = useState<ModelMetadataReport | null>(null);

  useEffect(() => {
    fetch('/models/model_metadata.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ModelMetadataReport | null) => {
        if (data) setModelMeta(data);
      })
      .catch(() => undefined);
  }, []);

  const selectedMetrics = modelMeta?.models[modelMeta.selectedModel]?.holdoutTest;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar: strictly 3 zones */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <BrandMark onClick={() => onNavigate('/')} />

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#how-it-works"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How it works
            </a>
            <a
              href="#how-we-guide"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How we guide you
            </a>
            <button
              type="button"
              onClick={() => onNavigate(user ? '/dashboard' : '/login')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Dashboard' : 'Sign in'}
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(user ? '/dashboard' : '/register')}
              className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Open workspace' : 'Create account'}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <Activity className="h-3.5 w-3.5" />
                <span>Career readiness, made actionable</span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl leading-[1.08] text-balance dark:text-white">
                Understand where you stand. Build what comes next.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                CareerIQ turns your academic profile, assessment, and goals into a clear
                employability estimate and a practical plan for growing the skills employers value.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(user ? '/assessment' : '/register')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  <span>Start your readiness profile</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSampleOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Explore a sample estimate
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
                Built for final-year students. No job guarantee—just clearer evidence and next steps.
              </p>
            </div>

            {/* Right Snapshot Card (matches Screenshot 1) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Your readiness signal
                    </div>
                    <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                      Career snapshot
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    ONNX Live Model
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#1D4ED8] p-5 text-white">
                    <div className="text-xs font-medium text-blue-100">Employability estimate</div>
                    <div className="mt-2 flex items-baseline gap-1 font-display">
                      <span className="text-4xl font-extrabold tabular-nums">78</span>
                      <span className="text-base font-semibold text-blue-100">/100</span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-blue-100">
                      ML-based estimate from supported assessment signals
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Next strongest move
                    </div>
                    <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      Ship one API-backed project
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      Rule-based guidance from your selected role path.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Full Stack Developer pathway
                    </span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      3 priority skills
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { name: 'React', Icon: Code2 },
                      { name: 'APIs', Icon: Database },
                      { name: 'Git', Icon: GitBranch },
                    ].map(({ name, Icon }) => (
                      <div
                        key={name}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-50 py-3 px-2 border border-slate-100 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <Icon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: One connected student journey */}
        <section
          id="how-it-works"
          className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              A clearer path to readiness
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              One connected student journey
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  num: '01',
                  title: 'Build your profile',
                  desc: 'Capture academic context, practical experience, skills, and the work you want to pursue.',
                },
                {
                  num: '02',
                  title: 'Assess your readiness',
                  desc: 'Answer structured questions and review what is used in the employability estimate.',
                },
                {
                  num: '03',
                  title: 'Act on the insight',
                  desc: 'Follow prioritized skill actions, role pathways, and a progress-aware learning roadmap.',
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-xs font-bold font-mono text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {step.num}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Transparent by design */}
        <section id="how-we-guide" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                Transparent by design
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance dark:text-white">
                Know what&apos;s estimated—and what&apos;s guided.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                CareerIQ labels its intelligence clearly. Your employability estimate is produced by a
                trained Random Forest model running via ONNX Runtime Web using supported assessment
                features. Skill gaps, career matches, and roadmap steps use understandable rule
                criteria—not opaque automation.
              </p>

              {selectedMetrics && modelMeta && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Verified holdout evaluation · {modelMeta.selectedModel} (n={modelMeta.dataset.cleanedRows})
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {(selectedMetrics.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {selectedMetrics.f1.toFixed(3)}
                      </div>
                      <div className="text-xs text-slate-500">F1-Score</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400">
                        {selectedMetrics.rocAuc.toFixed(3)}
                      </div>
                      <div className="text-xs text-slate-500">ROC-AUC</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ML-based estimate
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    A probability-informed readiness category computed in your browser via ONNX
                    Runtime Web from academic history, employability test scores, and work
                    experience—presented with cohort context and limitations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Rule-based guidance
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Transparent role skill matrices, deterministic learning roadmaps, and structured
                    resume rubrics turn your current profile into practical weekly actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-slate-500 dark:text-slate-400">
          <div>© 2026 CareerIQ · Employability intelligence for students</div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Student sign in
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Create account
            </button>
          </div>
        </div>
      </footer>

      <SampleEstimateModal
        open={sampleOpen}
        onClose={() => setSampleOpen(false)}
        onCreateAccount={() => {
          setSampleOpen(false);
          onNavigate('/register');
        }}
      />
    </div>
  );
}
