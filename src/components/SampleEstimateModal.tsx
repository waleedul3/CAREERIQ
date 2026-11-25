import React, { useEffect, useState } from 'react';
import { X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { runEmployabilityOnnxInference } from '../lib/onnxInference.ts';
import { classifyReadinessCategory, MODEL_DISCLAIMER } from '../lib/mlPreprocessing.ts';
import type { ModelFeatureInput } from '../types/index.ts';

interface SampleEstimateModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
}

export function SampleEstimateModal({
  open,
  onClose,
  onCreateAccount,
}: SampleEstimateModalProps) {
  const [features, setFeatures] = useState<ModelFeatureInput>({
    ssc_p: 78,
    hsc_p: 76,
    degree_p: 74,
    etest_p: 80,
    mba_p: 71,
    hsc_s: 'Science',
    degree_t: 'Sci&Tech',
    workex: 'Yes',
    specialisation: 'Mkt&Fin',
  });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    predictedClass: 'Placed' | 'Not Placed';
    probability: number;
  } | null>(null);

  const runEstimate = async (input: ModelFeatureInput) => {
    setRunning(true);
    setError(null);
    try {
      const out = await runEmployabilityOnnxInference(input);
      setResult({ predictedClass: out.predictedClass, probability: out.probability });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to execute ONNX model.');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (open) {
      void runEstimate(features);
    }
  }, [open]);

  if (!open) return null;

  const pct = result ? Math.round(result.probability * 100) : 0;
  const category = result ? classifyReadinessCategory(result.probability) : 'Pending';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-estimate-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Live browser ONNX inference
            </p>
            <h2
              id="sample-estimate-title"
              className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              Explore a sample employability estimate
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sample estimate modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label htmlFor="sample-degree">Undergraduate % (CGPA × 10)</label>
                <span className="font-mono tabular-nums">{features.degree_p}%</span>
              </div>
              <input
                id="sample-degree"
                type="range"
                min={45}
                max={95}
                value={features.degree_p}
                onChange={(e) => {
                  const next = { ...features, degree_p: Number(e.target.value) };
                  setFeatures(next);
                  void runEstimate(next);
                }}
                className="mt-1.5 w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label htmlFor="sample-ssc">10th Grade Percentage</label>
                <span className="font-mono tabular-nums">{features.ssc_p}%</span>
              </div>
              <input
                id="sample-ssc"
                type="range"
                min={45}
                max={95}
                value={features.ssc_p}
                onChange={(e) => {
                  const next = { ...features, ssc_p: Number(e.target.value) };
                  setFeatures(next);
                  void runEstimate(next);
                }}
                className="mt-1.5 w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label htmlFor="sample-hsc">12th Grade Percentage</label>
                <span className="font-mono tabular-nums">{features.hsc_p}%</span>
              </div>
              <input
                id="sample-hsc"
                type="range"
                min={45}
                max={95}
                value={features.hsc_p}
                onChange={(e) => {
                  const next = { ...features, hsc_p: Number(e.target.value) };
                  setFeatures(next);
                  void runEstimate(next);
                }}
                className="mt-1.5 w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label htmlFor="sample-etest">Aptitude / Employability Test %</label>
                <span className="font-mono tabular-nums">{features.etest_p}%</span>
              </div>
              <input
                id="sample-etest"
                type="range"
                min={45}
                max={98}
                value={features.etest_p}
                onChange={(e) => {
                  const next = { ...features, etest_p: Number(e.target.value) };
                  setFeatures(next);
                  void runEstimate(next);
                }}
                className="mt-1.5 w-full accent-blue-700"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Prior Internship / Work Experience
              </span>
              <div className="mt-1.5 flex gap-2">
                {(['Yes', 'No'] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => {
                      const next = { ...features, workex: choice };
                      setFeatures(next);
                      void runEstimate(next);
                    }}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      features.workex === choice
                        ? 'border-blue-700 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {choice === 'Yes' ? 'Has Experience' : 'No Experience'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                RandomForestClassifier · ONNX WebAssembly
              </div>
              {error ? (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : (
                <>
                  <div className="mt-4 rounded-xl bg-[#1D4ED8] p-5 text-white">
                    <div className="text-xs text-blue-100">Model readiness estimate</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-bold font-mono tabular-nums">
                        {running ? '...' : `${pct}%`}
                      </span>
                      <span className="text-xs text-blue-100">probability</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-50">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{category}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {MODEL_DISCLAIMER}
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onCreateAccount}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              <span>Create account for full assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
