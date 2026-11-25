import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModelMetadataReport } from '../types/index.ts';

export function ModelInfoPage() {
  const [meta, setMeta] = useState<ModelMetadataReport | null>(null);

  useEffect(() => {
    fetch('/models/model_metadata.json')
      .then((r) => r.json())
      .then((d: ModelMetadataReport) => setMeta(d))
      .catch(() => undefined);
  }, []);

  if (!meta) {
    return (
      <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  const selected = meta.models[meta.selectedModel];
  const cm = selected.holdoutTest.confusionMatrix;
  const importancesChart = selected.featureImportances.slice(0, 8).map((f) => ({
    feature: f.feature,
    pct: Number((f.importance * 100).toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
          Academically verified ML documentation
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Model evaluation & dataset provenance
        </h1>
      </div>

      {/* Dataset Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Dataset summary</h2>
        <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-slate-500">Dataset</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">
              {meta.dataset.name}
            </div>
          </div>
          <div>
            <div className="text-slate-500">License & Source</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">
              {meta.dataset.license} · {meta.dataset.source}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Records & Split</div>
            <div className="mt-1 font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {meta.dataset.cleanedRows} total ({meta.dataset.trainRows} train / {meta.dataset.testRows} test)
            </div>
          </div>
          <div>
            <div className="text-slate-500">Target Distribution</div>
            <div className="mt-1 font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              Placed: {meta.dataset.classDistribution.Placed} · Not Placed: {meta.dataset.classDistribution.NotPlaced}
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Supervised model comparison (Stratified 80/20 Holdout + 5-Fold CV)
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{meta.selectionRationale}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <th className="py-2.5 pr-4 font-semibold">Model</th>
                <th className="py-2.5 pr-4 font-semibold text-right">CV ROC-AUC</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Test Accuracy</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Precision</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Recall</th>
                <th className="py-2.5 pr-4 font-semibold text-right">F1-Score</th>
                <th className="py-2.5 font-semibold text-right">Test ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(meta.models).map(([name, m]) => (
                <tr key={name} className={name === meta.selectedModel ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}>
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                    {name} {name === meta.selectedModel ? '(Selected ONNX)' : ''}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {m.cv5Fold.rocAucMean.toFixed(4)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {(m.holdoutTest.accuracy * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {m.holdoutTest.precision.toFixed(4)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {m.holdoutTest.recall.toFixed(4)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {m.holdoutTest.f1.toFixed(4)}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums font-bold text-[#1D4ED8] dark:text-blue-400">
                    {m.holdoutTest.rocAuc.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importances & Confusion Matrix */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Top feature importances ({meta.selectedModel})
          </h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importancesChart} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="feature" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="pct" name="Importance %" fill="#1D4ED8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Holdout confusion matrix (n={meta.dataset.testRows})
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-slate-500">True Negative (Not Placed)</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums">{cm.tn}</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <div className="text-amber-800 dark:text-amber-300">False Positive</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums">{cm.fp}</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <div className="text-amber-800 dark:text-amber-300">False Negative</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums">{cm.fn}</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="text-emerald-800 dark:text-emerald-300">True Positive (Placed)</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums">{cm.tp}</div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Documented limitations
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {meta.limitations.map((lim, i) => (
                <li key={i}>· {lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
