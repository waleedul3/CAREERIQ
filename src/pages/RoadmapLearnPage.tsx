import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Layers,
  ListChecks,
  Sparkles,
  Youtube,
} from 'lucide-react';
import { apiRequest } from '../lib/api.ts';
import { getLearningGuideForTask, type ResourceCategory } from '../lib/learningGuides.ts';
import type { RoadmapRecord } from '../types/index.ts';

interface RoadmapLearnPageProps {
  taskId: string;
  onNavigate: (path: string) => void;
}

type ActiveSection =
  | { type: 'overview' }
  | { type: 'topic'; topicIndex: number }
  | { type: 'practice' }
  | { type: 'resources' };

const RESOURCE_BADGE_STYLES: Record<ResourceCategory, string> = {
  'Official Docs':
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  YouTube:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
  'Free Tutorial':
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
  'Free Course':
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900',
  GitHub:
    'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

function ResourceIcon({ category }: { category: ResourceCategory }) {
  switch (category) {
    case 'YouTube':
      return <Youtube className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />;
    case 'GitHub':
      return <FolderGit2 className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />;
    case 'Free Course':
      return <GraduationCap className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />;
    default:
      return <BookOpen className="h-4 w-4 text-blue-700 dark:text-blue-400 shrink-0" />;
  }
}

export function RoadmapLearnPage({ taskId, onNavigate }: RoadmapLearnPageProps) {
  const [roadmap, setRoadmap] = useState<RoadmapRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [section, setSection] = useState<ActiveSection>({ type: 'topic', topicIndex: 0 });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ roadmap: RoadmapRecord }>('/api/roadmap');
        if (active) {
          setRoadmap(res.roadmap);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load learning module.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [taskId]);

  const task = useMemo(
    () => roadmap?.tasks.find((t) => t.taskId === taskId) || null,
    [roadmap, taskId]
  );

  const guide = useMemo(() => {
    if (!task || !roadmap) return null;
    return getLearningGuideForTask(task, roadmap.targetRole);
  }, [task, roadmap]);

  const completedTopicIds = useMemo(() => {
    if (!roadmap || !task) return new Set<string>();
    return new Set(roadmap.topicCompletions?.[task.taskId] || []);
  }, [roadmap, task]);

  const handleToggleTopicComplete = async (topicId: string, nextCompleted: boolean) => {
    if (!roadmap || !task || !guide) return;
    setSavingTopicId(topicId);
    setError(null);
    setFeedback(null);

    const previous = roadmap;
    const prevList = roadmap.topicCompletions?.[task.taskId] || [];
    const nextSet = new Set(prevList);
    if (nextCompleted) nextSet.add(topicId);
    else nextSet.delete(topicId);
    const nextTopicIds = Array.from(nextSet);

    const optimisticStatus =
      nextTopicIds.length >= guide.topics.length
        ? 'Completed'
        : nextTopicIds.length > 0
          ? 'In Progress'
          : 'Not Started';

    setRoadmap({
      ...roadmap,
      tasks: roadmap.tasks.map((t) =>
        t.taskId === task.taskId ? { ...t, status: optimisticStatus } : t
      ),
      topicCompletions: {
        ...(roadmap.topicCompletions || {}),
        [task.taskId]: nextTopicIds,
      },
    });

    try {
      const res = await apiRequest<{ roadmap: RoadmapRecord }>('/api/roadmap/topics', {
        method: 'PATCH',
        body: JSON.stringify({
          taskId: task.taskId,
          topicId,
          completed: nextCompleted,
          totalTopics: guide.topics.length,
        }),
      });
      setRoadmap(res.roadmap);
      setFeedback(
        nextCompleted
          ? 'Topic marked as completed and saved to your roadmap.'
          : 'Topic marked as incomplete.'
      );
    } catch (err) {
      setRoadmap(previous);
      setError(err instanceof Error ? err.message : 'Unable to save topic progress.');
    } finally {
      setSavingTopicId(null);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      </div>
    );
  }

  if (!task || !guide || !roadmap) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
          Learning module not found
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {error || 'This roadmap task could not be found in your current career pathway.'}
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/roadmap')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Roadmap</span>
        </button>
      </div>
    );
  }

  const totalTopics = guide.topics.length;
  const completedCount = guide.topics.filter((t) => completedTopicIds.has(t.id)).length;
  const topicPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const activeTopic =
    section.type === 'topic' ? guide.topics[section.topicIndex] || guide.topics[0] : null;
  const activeTopicIndex = section.type === 'topic' ? section.topicIndex : -1;

  return (
    <div className="space-y-6">
      {/* Top Bar & Progress Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/roadmap')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Roadmap</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {roadmap.targetRole}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 font-mono tabular-nums text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <Clock className="h-3 w-3" />
              {task.estimatedHours} hrs est.
            </span>
            <span
              className={`rounded-md px-2.5 py-1 font-semibold ${
                task.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : task.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {task.status}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Text-based self-paced learning guide · {task.priority} Priority
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {guide.skill}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Topic progress
            </div>
            <div className="text-lg font-extrabold font-mono tabular-nums text-[#1D4ED8] dark:text-blue-400">
              {completedCount}/{totalTopics} topics ({topicPct}%)
            </div>
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-[#1D4ED8] transition-all"
            style={{ width: `${topicPct}%` }}
          />
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Learning Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Table of Contents Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Learning Contents
            </h2>

            <nav aria-label="Module table of contents" className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => setSection({ type: 'overview' })}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  section.type === 'overview'
                    ? 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Skill Introduction & Objectives</span>
              </button>

              <div className="pt-2 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Topics in Order
              </div>

              {guide.topics.map((topic, idx) => {
                const isDone = completedTopicIds.has(topic.id);
                const isActive = section.type === 'topic' && section.topicIndex === idx;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSection({ type: 'topic', topicIndex: idx })}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-blue-50 font-semibold text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="leading-snug">
                        {idx + 1}. {topic.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400 font-mono">
                        ~{topic.estimatedMinutes} min
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  type="button"
                  onClick={() => setSection({ type: 'practice' })}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    section.type === 'practice'
                      ? 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <ListChecks className="h-4 w-4 shrink-0" />
                  <span>Exercises & Mini-Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSection({ type: 'resources' })}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    section.type === 'resources'
                      ? 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>Tutorials, Docs & YouTube ({guide.resources.length})</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Reading Pane */}
        <section className="lg:col-span-8 space-y-6">
          {section.type === 'overview' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. Skill Introduction
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {guide.introduction}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  2. Learning Objectives
                </h2>
                <ul className="mt-3 space-y-2">
                  {guide.objectives.map((obj, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  3. Topics to Study in Order
                </h2>
                <div className="mt-3 space-y-2">
                  {guide.topics.map((topic, idx) => {
                    const done = completedTopicIds.has(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSection({ type: 'topic', topicIndex: idx })}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3.5 text-left hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-slate-800/60"
                      >
                        <div className="flex items-center gap-3">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {idx + 1}. {topic.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              ~{topic.estimatedMinutes} min reading & practice
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Key Takeaways
                </h3>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {guide.keyTakeaways.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSection({ type: 'topic', topicIndex: 0 })}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <span>Start Topic 1</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {section.type === 'topic' && activeTopic && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    Topic {activeTopicIndex + 1} of {totalTopics} · ~{activeTopic.estimatedMinutes} min
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {activeTopic.title}
                  </h2>
                </div>

                <button
                  type="button"
                  disabled={savingTopicId === activeTopic.id}
                  onClick={() =>
                    void handleToggleTopicComplete(
                      activeTopic.id,
                      !completedTopicIds.has(activeTopic.id)
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                    completedTopicIds.has(activeTopic.id)
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-[#1D4ED8] bg-[#1D4ED8] text-white hover:bg-blue-800'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {savingTopicId === activeTopic.id
                      ? 'Saving...'
                      : completedTopicIds.has(activeTopic.id)
                        ? 'Completed (Click to unmark)'
                        : 'Mark as Completed'}
                  </span>
                </button>
              </div>

              {/* Detailed Explanations */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Detailed Explanation
                </h3>
                {activeTopic.explanation.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Important Concepts & Definitions */}
              {activeTopic.concepts.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Important Concepts & Definitions</span>
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {activeTopic.concepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {concept.term}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {concept.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Example with Copy */}
              {activeTopic.codeExample && (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{activeTopic.codeExample.title}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => void handleCopyCode(activeTopic.codeExample!.code)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 font-mono">
                    <code>{activeTopic.codeExample.code}</code>
                  </pre>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {activeTopic.codeExample.notes}
                  </p>
                </div>
              )}

              {/* Step-by-Step Learning Guidance */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Step-by-Step Learning Guidance
                </h3>
                <ol className="mt-2.5 space-y-2 list-decimal pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {activeTopic.stepByStepGuidance.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Topic Key Takeaways */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  Key Takeaways
                </h3>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {activeTopic.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx}>{takeaway}</li>
                  ))}
                </ul>
              </div>

              {/* Previous / Next Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    activeTopicIndex > 0
                      ? setSection({ type: 'topic', topicIndex: activeTopicIndex - 1 })
                      : setSection({ type: 'overview' })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{activeTopicIndex > 0 ? 'Previous Topic' : 'Skill Overview'}</span>
                </button>

                {activeTopicIndex < totalTopics - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSection({ type: 'topic', topicIndex: activeTopicIndex + 1 })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    <span>Next Topic</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSection({ type: 'practice' })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    <span>Exercises & Mini-Projects</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {section.type === 'practice' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Practical Exercises
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Practice independently in your local editor. No timed tests or quizzes—focus on building working code.
                </p>
                <ul className="mt-3 space-y-2.5">
                  {guide.exercises.map((ex, idx) => (
                    <li
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Exercise {idx + 1}:{' '}
                      </span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mini-Project Suggestions
                </h2>
                <div className="mt-3 space-y-3">
                  {guide.miniProjects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {proj.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {proj.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {proj.deliverables.map((deliv, dIdx) => (
                          <span
                            key={dIdx}
                            className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {deliv}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSection({ type: 'topic', topicIndex: totalTopics - 1 })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Last Topic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSection({ type: 'resources' })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <span>External Resources</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {section.type === 'resources' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recommended Learning Resources
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Free official documentation, YouTube tutorial searches, written guides, courses, and GitHub examples for {guide.skill}.
                </p>
              </div>

              <div className="space-y-3">
                {guide.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/30 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">
                        <ResourceIcon category={res.category} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {res.title}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${RESOURCE_BADGE_STYLES[res.category]}`}
                          >
                            {res.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {res.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Always-visible quick resources strip below topic/overview so students can jump to docs/YouTube anytime */}
          {section.type !== 'resources' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick External Resources for {guide.skill}
                </h3>
                <button
                  type="button"
                  onClick={() => setSection({ type: 'resources' })}
                  className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                >
                  View all ({guide.resources.length})
                </button>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {guide.resources.slice(0, 4).map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs hover:border-blue-300 hover:bg-blue-50/30 dark:border-slate-700 dark:hover:border-blue-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ResourceIcon category={res.category} />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
