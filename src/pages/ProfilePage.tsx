import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { CAREER_ROLES } from '../lib/careerRoles.ts';
import type { AuthUser, ProjectItem, StudentProfileData } from '../types/index.ts';

interface AdminStatusResponse {
  envPasscodeConfigured: boolean;
  firstRunClaimAvailable: boolean;
  hasAdminUser: boolean;
  isCurrentUserAdmin: boolean;
}

export function ProfilePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, applyAuthSession } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Admin setup / claim state
  const [adminStatus, setAdminStatus] = useState<AdminStatusResponse | null>(null);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [profRes, adminRes] = await Promise.all([
          apiRequest<{ profile: StudentProfileData }>('/api/profile'),
          apiRequest<AdminStatusResponse>('/api/auth/admin-status'),
        ]);
        if (!active) return;
        setProfile(profRes.profile);
        setAdminStatus(adminRes);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load profile.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await apiRequest<{ profile: StudentProfileData }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setProfile(res.profile);
      setMessage('Profile saved and personalized roadmap synced.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const addTag = (
    field: 'technicalSkills' | 'programmingLanguages' | 'certifications' | 'careerInterests',
    value: string,
    clear: () => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed || !profile) return;
    if (!profile[field].includes(trimmed)) {
      setProfile({ ...profile, [field]: [...profile[field], trimmed] });
    }
    clear();
  };

  const removeTag = (
    field: 'technicalSkills' | 'programmingLanguages' | 'certifications' | 'careerInterests',
    item: string
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: profile[field].filter((x) => x !== item) });
  };

  const addProject = () => {
    if (!profile) return;
    const next: ProjectItem = {
      title: 'New Capstone Project',
      description: 'Describe architecture, dataset or API, and measurable outcome.',
      techStack: ['React', 'TypeScript'],
      link: '',
    };
    setProfile({ ...profile, projects: [...profile.projects, next] });
  };

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminBusy(true);
    setAdminError(null);
    setAdminMessage(null);
    try {
      const res = await apiRequest<{ user: AuthUser; token: string }>('/api/auth/claim-admin', {
        method: 'POST',
        body: JSON.stringify({ passcode: adminPasscode }),
      });
      applyAuthSession(res.user, res.token);
      setAdminPasscode('');
      setAdminMessage('Administrator access verified for this account.');
      const nextStatus = await apiRequest<AdminStatusResponse>('/api/auth/admin-status');
      setAdminStatus(nextStatus);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Administrator verification failed.');
    } finally {
      setAdminBusy(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student profile</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Keep your academic scores, technical skills, projects, and target role up to date.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academic & Identity */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Academic background
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full name
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                University / College
              </label>
              <input
                type="text"
                required
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Degree & Branch
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={profile.degree}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  placeholder="B.Tech"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="text"
                  required
                  value={profile.branch}
                  onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                  placeholder="CSE"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Semester (1–12)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current CGPA (0–10)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Career Role
              </label>
              <select
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {CAREER_ROLES.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                10th Grade Percentage
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={profile.sscPercentage}
                onChange={(e) => setProfile({ ...profile, sscPercentage: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                12th Grade Percentage
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={profile.hscPercentage}
                onChange={(e) => setProfile({ ...profile, hscPercentage: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                12th Stream & UG Category
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <select
                  value={profile.hscStream}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      hscStream: e.target.value as StudentProfileData['hscStream'],
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
                <select
                  value={profile.degreeType}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      degreeType: e.target.value as StudentProfileData['degreeType'],
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Sci&Tech">Sci&amp;Tech</option>
                  <option value="Comm&Mgmt">Comm&amp;Mgmt</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Skills & Readiness Inputs */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Skills, readiness & practice metrics
          </h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {/* Technical Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Technical skills
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('technicalSkills', newSkill, () => setNewSkill(''));
                    }
                  }}
                  placeholder="Add skill (e.g. React, SQL, Docker)"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => addTag('technicalSkills', newSkill, () => setNewSkill(''))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {profile.technicalSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeTag('technicalSkills', skill)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    title="Click to remove"
                  >
                    <span>{skill}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Programming Languages */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Programming languages
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('programmingLanguages', newLang, () => setNewLang(''));
                    }
                  }}
                  placeholder="Add language (e.g. Python, TypeScript)"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => addTag('programmingLanguages', newLang, () => setNewLang(''))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {profile.programmingLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => removeTag('programmingLanguages', lang)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>{lang}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Certifications
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('certifications', newCert, () => setNewCert(''));
                    }
                  }}
                  placeholder="Add certification"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => addTag('certifications', newCert, () => setNewCert(''))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {profile.certifications.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => removeTag('certifications', cert)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>{cert}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Career Interests */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Career interests
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('careerInterests', newInterest, () => setNewInterest(''));
                    }
                  }}
                  placeholder="e.g. Cloud Engineering, Data Analytics"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => addTag('careerInterests', newInterest, () => setNewInterest(''))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {profile.careerInterests.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => removeTag('careerInterests', item)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>{item}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Internships completed
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={profile.internshipsCount}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    internshipsCount: Number(e.target.value),
                    hasWorkExperience: Number(e.target.value) > 0 || profile.hasWorkExperience,
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Communication rating (1–10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={profile.communicationLevel}
                onChange={(e) =>
                  setProfile({ ...profile, communicationLevel: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Aptitude test score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={profile.aptitudeScore}
                onChange={(e) => setProfile({ ...profile, aptitudeScore: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Coding practice (hrs/week)
              </label>
              <input
                type="number"
                min={0}
                max={80}
                value={profile.codingPracticeHours}
                onChange={(e) =>
                  setProfile({ ...profile, codingPracticeHours: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Projects</h2>
              <p className="text-xs text-slate-500">Document applied engineering & data projects</p>
            </div>
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add project</span>
            </button>
          </div>

          {profile.projects.length === 0 ? (
            <p className="mt-4 text-xs text-slate-500">
              No projects recorded yet. Click &quot;Add project&quot; to document your portfolio work.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {profile.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      required
                      value={proj.title}
                      onChange={(e) => {
                        const copy = [...profile.projects];
                        copy[idx] = { ...proj, title: e.target.value };
                        setProfile({ ...profile, projects: copy });
                      }}
                      placeholder="Project title"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          projects: profile.projects.filter((_, i) => i !== idx),
                        })
                      }
                      aria-label="Remove project"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={proj.description}
                    onChange={(e) => {
                      const copy = [...profile.projects];
                      copy[idx] = { ...proj, description: e.target.value };
                      setProfile({ ...profile, projects: copy });
                    }}
                    placeholder="Key features, architecture, and outcome"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? 'Saving profile...' : 'Save profile changes'}
          </button>
        </div>
      </form>

      {/* Server-protected Administrator Access Claim/Verification */}
      {adminStatus && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Administrator console access
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {user?.role === 'admin'
                    ? 'Your account has verified administrator access.'
                    : adminStatus.firstRunClaimAvailable
                      ? 'No administrator has been configured yet. Set a one-time server passcode (min 8 characters) to claim administrator access.'
                      : 'Enter the server administrator passcode to unlock the Admin Console.'}
                </p>
              </div>
            </div>

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-700"
              >
                Open Admin Console
              </button>
            )}
          </div>

          {adminMessage && (
            <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {adminMessage}
            </p>
          )}
          {adminError && (
            <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">{adminError}</p>
          )}

          {user?.role !== 'admin' && (
            <form onSubmit={handleClaimAdmin} className="mt-4 flex flex-wrap gap-3">
              <input
                type="password"
                minLength={8}
                required
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder={
                  adminStatus.firstRunClaimAvailable
                    ? 'Create initial admin passcode (min 8 chars)'
                    : 'Enter administrator passcode'
                }
                className="flex-1 min-w-56 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="submit"
                disabled={adminBusy}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {adminBusy
                  ? 'Verifying...'
                  : adminStatus.firstRunClaimAvailable
                    ? 'Claim administrator access'
                    : 'Verify passcode'}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
