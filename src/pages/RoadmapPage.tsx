import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { apiRequest } from '../lib/api.ts';
import { CAREER_ROLES } from '../lib/careerRoles.ts';
import { getLearningGuideForTask } from '../lib/learningGuides.ts';
import { customRoadmapTaskSchema } from '../lib/validation.ts';
import type { RoadmapRecord, RoadmapStatus, RoadmapTask } from '../types/index.ts';

interface RoadmapPageProps {
  onNavigate?: (path: string) => void;
}

export function RoadmapPage({ onNavigate }: RoadmapPageProps) {
  const [roadmap, setRoadmap] = useState<RoadmapRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [profileTargetRole, setProfileTargetRole] = useState<string>('');
  const [filter, setFilter] = useState<'All' | RoadmapStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | RoadmapTask['priority']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingTarget, setSavingTarget] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add custom task state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [customPriority, setCustomPriority] = useState<RoadmapTask['priority']>('Medium');
  const [customObjective, setCustomObjective] = useState('');
  const [customPractice, setCustomPractice] = useState('');
  const [customProject, setCustomProject] = useState('');
  const [customHours, setCustomHours] = useState(8);

  const loadRoadmap = async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = role ? `?role=${encodeURIComponent(role)}` : '';
      const res = await apiRequest<{ roadmap: RoadmapRecord; profileTargetRole?: string }>(
        `/api/roadmap${qs}`
      );
      setRoadmap(res.roadmap);
      setSelectedRole(res.roadmap.targetRole);
      if (res.profileTargetRole) setProfileTargetRole(res.profileTargetRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoadmap();
  }, []);

  const updateStatus = async (taskId: string, status: RoadmapStatus) => {
    if (!roadmap) return;
    const previous = roadmap;
    setUpdatingId(taskId);
    setError(null);
    setFeedback(null);

    // Optimistic UI update
    setRoadmap({
      ...roadmap,
      tasks: roadmap.tasks.map((t) => (t.taskId === taskId ? { ...t, status } : t)),
    });

    try {
      const res = await apiRequest<{ roadmap: RoadmapRecord }>('/api/roadmap/progress', {
        method: 'PATCH',
        body: JSON.stringify({ taskId, status }),
      });
      setRoadmap(res.roadmap);
    } catch (err) {
      setRoadmap(previous);
      setError(err instanceof Error ? err.message : 'Unable to update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetTargetRole = async () => {
    if (!selectedRole) return;
    setSavingTarget(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await apiRequest<{ targetRole: string }>('/api/roadmap/target-role', {
        method: 'PUT',
        body: JSON.stringify({ targetRole: selectedRole }),
      });
      setProfileTargetRole(res.targetRole);
      setFeedback(`${res.targetRole} saved as your active target role.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update target role.');
    } finally {
      setSavingTarget(false);
    }
  };

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const parsed = customRoadmapTaskSchema.safeParse({
      skill: customSkill,
      priority: customPriority,
      objective: customObjective,
      practiceActivity: customPractice,
      projectSuggestion: customProject,
      estimatedHours: customHours,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check custom task fields.');
      return;
    }

    setAddingTask(true);
    try {
      const res = await apiRequest<{ roadmap: RoadmapRecord }>('/api/roadmap/tasks', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      setRoadmap(res.roadmap);
      setCustomSkill('');
      setCustomObjective('');
      setCustomPractice('');
      setCustomProject('');
      setCustomHours(8);
      setShowAddForm(false);
      setFeedback('Custom learning task added to your roadmap.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add custom task.');
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteCustomTask = async (taskId: string) => {
    setUpdatingId(taskId);
    setError(null);
    try {
      const res = await apiRequest<{ roadmap: RoadmapRecord }>(
        `/api/roadmap/tasks/${encodeURIComponent(taskId)}`,
        { method: 'DELETE' }
      );
      setRoadmap(res.roadmap);
      setFeedback('Custom task removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete task.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !roadmap) {
    return (
      <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  const tasks = roadmap?.tasks || [];
  const q = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((t) => {
    if (filter !== 'All' && t.status !== filter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (
      q &&
      !t.skill.toLowerCase().includes(q) &&
      !t.objective.toLowerCase().includes(q) &&
      !t.practiceActivity.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const remainingHours = tasks
    .filter((t) => t.status !== 'Completed')
    .reduce((sum, t) => sum + t.estimatedHours, 0);
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isTargetSynced = profileTargetRole === roadmap?.targetRole;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            Deterministic learning plan · Persisted in MongoDB
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Personalized learning roadmap
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="roadmap-role"
            className="text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Role pathway:
          </label>
          <select
            id="roadmap-role"
            value={selectedRole}
            onChange={(e) => void loadRoadmap(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
          >
            {CAREER_ROLES.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          {!isTargetSynced && selectedRole && (
            <button
              type="button"
              disabled={savingTarget}
              onClick={() => void handleSetTargetRole()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
            >
              <Target className="h-3.5 w-3.5" />
              <span>{savingTarget ? 'Saving...' : 'Set as target role'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
          >
            {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{showAddForm ? 'Close' : 'Add custom task'}</span>
          </button>
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

      {/* Add Custom Task Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddCustomTask}
          className="rounded-xl border border-blue-200 bg-white p-5 space-y-4 dark:border-blue-900 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Add custom learning milestone
            </h2>
            <span className="text-xs text-slate-500">Saved to your roadmap</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skill or topic
              </label>
              <input
                type="text"
                required
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g. Redis Caching"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value as RoadmapTask['priority'])}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Foundation">Foundation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estimated hours
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Learning objective
              </label>
              <input
                type="text"
                required
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                placeholder="What will you master?"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Practice activity
              </label>
              <input
                type="text"
                required
                value={customPractice}
                onChange={(e) => setCustomPractice(e.target.value)}
                placeholder="Concrete exercise or drill"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project suggestion
              </label>
              <input
                type="text"
                required
                value={customProject}
                onChange={(e) => setCustomProject(e.target.value)}
                placeholder="Small deliverable or portfolio feature"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingTask}
              className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {addingTask ? 'Saving...' : 'Save task'}
            </button>
          </div>
        </form>
      )}

      {/* Progress & Filter Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {roadmap?.targetRole} · {completedCount}/{tasks.length} tasks completed
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono tabular-nums">
              <span>{inProgressCount} in progress</span>
              <span aria-hidden="true">·</span>
              <span>{remainingHours} hrs remaining of {totalHours} hrs</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#1D4ED8] dark:text-blue-400">
            {completionPct}%
          </div>
        </div>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-[#1D4ED8] transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Interactive Filter Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === tab
                    ? 'bg-[#1D4ED8] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as 'All' | RoadmapTask['priority'])
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="All">All priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Foundation">Foundation Priority</option>
            </select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter skills..."
                className="w-40 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          <p>No roadmap tasks match your current filters.</p>
          <button
            type="button"
            onClick={() => {
              setFilter('All');
              setPriorityFilter('All');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isCustom = task.taskId.startsWith('custom-');
            const guide = getLearningGuideForTask(task, roadmap?.targetRole || 'Full Stack Developer');
            const completedTopics = roadmap?.topicCompletions?.[task.taskId]?.length || 0;
            const totalTopics = guide.topics.length;
            const topicPct =
              totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0;
            const isCompleted = task.status === 'Completed' || (totalTopics > 0 && completedTopics >= totalTopics);
            return (
              <div
                key={task.taskId}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`font-semibold ${
                          task.priority === 'High'
                            ? 'text-blue-700 dark:text-blue-400'
                            : task.priority === 'Medium'
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="h-3 w-3" />
                        {task.estimatedHours} hrs
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {topicPct}% completed ({completedTopics}/{totalTopics} topics)
                      </span>
                      {isCustom && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Custom task</span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                      {task.skill}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Completed · 100%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold font-mono tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {topicPct}% completed
                      </span>
                    )}
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/roadmap/learn/${encodeURIComponent(task.taskId)}`)
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Start Learning</span>
                      </button>
                    )}
                    {isCustom && (
                      <button
                        type="button"
                        aria-label={`Remove ${task.skill}`}
                        disabled={updatingId === task.taskId}
                        onClick={() => void handleDeleteCustomTask(task.taskId)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-3 dark:border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Learning objective
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                      {task.objective}
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Practice activity
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                      {task.practiceActivity}
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Project suggestion
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                      {task.projectSuggestion}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
