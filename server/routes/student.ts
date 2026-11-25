import { Router } from 'express';
import { connectToDatabase } from '../config/db.ts';
import {
  createRateLimiter,
  requireAuth,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';
import {
  AdminLogModel,
  AssessmentModel,
  PredictionModel,
  ProfileModel,
  ResumeAnalysisModel,
  RoadmapProgressModel,
  UserModel,
} from '../models/index.ts';
import { extractResumeTextFromBase64 } from '../services/resumeParser.ts';
import { CAREER_ROLES, generateDeterministicRoadmap } from '../../src/lib/careerRoles.ts';
import {
  buildExplanationAndGuidance,
  classifyReadinessCategory,
  encodeFeaturesToFloat32,
  MODEL_DISCLAIMER,
} from '../../src/lib/mlPreprocessing.ts';
import { analyzeResumeText } from '../../src/lib/resumeAnalyzer.ts';
import {
  assessmentSubmitSchema,
  customRoadmapTaskSchema,
  profileUpdateSchema,
  roadmapStatusPatchSchema,
  roadmapTopicPatchSchema,
} from '../../src/lib/validation.ts';
import type { RoadmapStatus } from '../../src/types/index.ts';

const router = Router();
const uploadRateLimit = createRateLimiter(20, 15 * 60 * 1000);

router.use(requireAuth);

router.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    await connectToDatabase();
    let profile = await ProfileModel.findOne({ userId: req.user!.id }).lean();
    if (!profile) {
      profile = (
        await ProfileModel.create({
          userId: req.user!.id,
          name: req.user!.name,
          email: req.user!.email,
          technicalSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
          programmingLanguages: ['JavaScript', 'Python'],
          careerInterests: ['Full Stack Development'],
          targetRole: 'Full Stack Developer',
        })
      ).toObject();
    }
    res.json({ profile });
  } catch (err) {
    console.error('Get profile error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load student profile.' });
  }
});

router.put('/profile', async (req: AuthenticatedRequest, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Invalid profile data.',
    });
    return;
  }

  try {
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(req.user!.id, { name: parsed.data.name });

    const updated = await ProfileModel.findOneAndUpdate(
      { userId: req.user!.id },
      {
        ...parsed.data,
        email: req.user!.email,
      },
      { returnDocument: 'after', upsert: true }
    ).lean();

    // Sync roadmap when skills or targetRole update while keeping existing progress
    const existingRoadmap = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    const nextRoadmap = generateDeterministicRoadmap(
      parsed.data.targetRole,
      parsed.data.technicalSkills,
      existingRoadmap?.tasks || [],
      extractStatusHistory(existingRoadmap)
    );
    await RoadmapProgressModel.findOneAndUpdate(
      { userId: req.user!.id },
      { targetRole: nextRoadmap.targetRole, tasks: nextRoadmap.tasks },
      { upsert: true }
    );

    res.json({ profile: updated });
  } catch (err) {
    console.error('Update profile error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to save profile updates.' });
  }
});

router.get('/assessments', async (req: AuthenticatedRequest, res) => {
  try {
    await connectToDatabase();
    const assessments = await AssessmentModel.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();
    res.json({ assessments });
  } catch (err) {
    console.error('List assessments error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load assessment history.' });
  }
});

function computeDeterministicFallbackProbability(vec: Float32Array): number {
  // Linearized cohort reference weights aligned with trained standardized features (only used if client WASM fails)
  const z = 0.85 + vec[0] * 0.8 + vec[1] * 0.4 + vec[2] * 0.55 + vec[3] * 0.15 + vec[4] * 0.35 + (vec[12] > 0.5 ? 0.65 : -0.2);
  const prob = 1 / (1 + Math.exp(-z));
  return Number(Math.max(0.05, Math.min(0.95, prob)).toFixed(4));
}

router.post('/assessments', async (req: AuthenticatedRequest, res) => {
  const parsed = assessmentSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Invalid assessment input.',
    });
    return;
  }

  try {
    await connectToDatabase();
    const data = parsed.data;
    const featureVec = encodeFeaturesToFloat32(data.modelFeatures);

    const probability =
      data.clientPrediction && Number.isFinite(data.clientPrediction.probability)
        ? Number(Math.max(0, Math.min(1, data.clientPrediction.probability)).toFixed(4))
        : computeDeterministicFallbackProbability(featureVec);

    const predictedClass =
      data.clientPrediction?.predictedClass || (probability >= 0.5 ? 'Placed' : 'Not Placed');

    const inferenceEngine = data.clientPrediction?.inferenceEngine || 'server-fallback';

    const assessment = await AssessmentModel.create({
      userId: req.user!.id,
      academics: data.academics,
      skills: data.skills,
      experience: data.experience,
      readiness: data.readiness,
      modelFeatures: data.modelFeatures,
      featureSchemaVersion: '1.0.0',
    });

    const { topFactors, strengths, improvements, readinessScore } = buildExplanationAndGuidance(
      data,
      probability
    );

    const prediction = await PredictionModel.create({
      userId: req.user!.id,
      assessmentId: assessment._id,
      predictedClass,
      readinessCategory: classifyReadinessCategory(probability),
      probability,
      readinessScore,
      modelName: 'RandomForestClassifier',
      modelVersion: '1.0.0',
      inferenceEngine,
      topFactors,
      strengths,
      improvements,
      disclaimer: MODEL_DISCLAIMER,
    });

    // Update student profile metrics & target role
    await ProfileModel.findOneAndUpdate(
      { userId: req.user!.id },
      {
        sscPercentage: data.academics.sscPercentage,
        hscPercentage: data.academics.hscPercentage,
        hscStream: data.academics.hscStream,
        degreeType: data.academics.degreeType,
        cgpa: Number((data.academics.degreePercentage / 10).toFixed(2)),
        technicalSkills: data.skills.technicalSkills,
        programmingLanguages: data.skills.programmingLanguages,
        codingPracticeHours: data.skills.codingPracticeHours,
        internshipsCount: data.experience.internshipsCount,
        hasWorkExperience: data.experience.hasWorkExperience,
        aptitudeScore: data.readiness.aptitudeTestPercentage,
        communicationLevel: data.readiness.communicationRating,
        targetRole: data.readiness.targetRole,
        careerInterests: data.readiness.careerInterests,
      },
      { upsert: true }
    );

    const existingRoadmap = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    const nextRoadmap = generateDeterministicRoadmap(
      data.readiness.targetRole,
      data.skills.technicalSkills,
      existingRoadmap?.tasks || [],
      extractStatusHistory(existingRoadmap)
    );
    await RoadmapProgressModel.findOneAndUpdate(
      { userId: req.user!.id },
      { targetRole: nextRoadmap.targetRole, tasks: nextRoadmap.tasks },
      { upsert: true }
    );

    await AdminLogModel.create({
      actorId: req.user!.id,
      action: 'ASSESSMENT_SUBMITTED',
      targetType: 'Prediction',
      summary: `Assessment completed for ${data.readiness.targetRole} (${classifyReadinessCategory(probability)}).`,
    });

    res.status(201).json({
      assessment,
      prediction: {
        id: String(prediction._id),
        assessmentId: String(assessment._id),
        predictedClass: prediction.predictedClass,
        readinessCategory: prediction.readinessCategory,
        probability: prediction.probability,
        readinessScore: prediction.readinessScore,
        modelName: prediction.modelName,
        modelVersion: prediction.modelVersion,
        inferenceEngine: prediction.inferenceEngine,
        topFactors: prediction.topFactors,
        strengths: prediction.strengths,
        improvements: prediction.improvements,
        disclaimer: prediction.disclaimer,
        createdAt: prediction.createdAt,
      },
    });
  } catch (err) {
    console.error('Submit assessment error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to submit employability assessment.' });
  }
});

router.get('/predictions', async (req: AuthenticatedRequest, res) => {
  try {
    await connectToDatabase();
    const docs = await PredictionModel.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const predictions = docs.map((d) => ({
      id: String(d._id),
      assessmentId: String(d.assessmentId),
      predictedClass: d.predictedClass,
      readinessCategory: d.readinessCategory,
      probability: d.probability,
      readinessScore: d.readinessScore,
      modelName: d.modelName,
      modelVersion: d.modelVersion,
      inferenceEngine: d.inferenceEngine,
      topFactors: d.topFactors,
      strengths: d.strengths,
      improvements: d.improvements,
      disclaimer: d.disclaimer,
      createdAt: d.createdAt,
    }));

    res.json({ predictions });
  } catch (err) {
    console.error('Get predictions error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load prediction history.' });
  }
});

function extractStatusHistory(
  doc: {
    statusEntries?: Array<{ taskId: string; status: string }>;
  } | null
): Record<string, RoadmapStatus> {
  const out: Record<string, RoadmapStatus> = {};
  if (!Array.isArray(doc?.statusEntries)) return out;
  for (const entry of doc.statusEntries) {
    if (
      entry?.taskId &&
      (entry.status === 'Not Started' ||
        entry.status === 'In Progress' ||
        entry.status === 'Completed')
    ) {
      out[entry.taskId] = entry.status;
    }
  }
  return out;
}

function formatTopicCompletions(
  entries?: Array<{ taskId: string; completedTopicIds?: string[] }> | null
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!Array.isArray(entries)) return out;
  for (const entry of entries) {
    if (entry?.taskId && Array.isArray(entry.completedTopicIds)) {
      out[entry.taskId] = Array.from(
        new Set(entry.completedTopicIds.filter((id) => typeof id === 'string' && id.length > 0))
      );
    }
  }
  return out;
}

function serializeRoadmap(doc: {
  targetRole: string;
  tasks: unknown[];
  topicCompletions?: Array<{ taskId: string; completedTopicIds?: string[] }> | null;
  updatedAt?: Date | string;
}) {
  return {
    targetRole: doc.targetRole,
    tasks: doc.tasks,
    topicCompletions: formatTopicCompletions(doc.topicCompletions),
    updatedAt: doc.updatedAt,
  };
}

router.get('/roadmap', async (req: AuthenticatedRequest, res) => {
  try {
    await connectToDatabase();
    const profile = await ProfileModel.findOne({ userId: req.user!.id }).lean();
    const requestedRole =
      typeof req.query.role === 'string' && req.query.role.trim().length > 0
        ? req.query.role.trim()
        : profile?.targetRole || 'Full Stack Developer';

    const existing = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    const historyMap = extractStatusHistory(existing);

    const generated = generateDeterministicRoadmap(
      requestedRole,
      profile?.technicalSkills || [],
      existing?.tasks || [],
      historyMap
    );

    const saved = await RoadmapProgressModel.findOneAndUpdate(
      { userId: req.user!.id },
      { targetRole: generated.targetRole, tasks: generated.tasks },
      { returnDocument: 'after', upsert: true }
    ).lean();

    res.json({
      roadmap: serializeRoadmap(saved),
      profileTargetRole: profile?.targetRole || 'Full Stack Developer',
    });
  } catch (err) {
    console.error('Get roadmap error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load personalized roadmap.' });
  }
});

router.patch('/roadmap/progress', async (req: AuthenticatedRequest, res) => {
  const parsed = roadmapStatusPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid roadmap update.' });
    return;
  }

  try {
    await connectToDatabase();
    const roadmap = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not found for your account.' });
      return;
    }

    const task = roadmap.tasks.find((t: { taskId: string }) => t.taskId === parsed.data.taskId);
    if (!task) {
      res.status(404).json({ error: 'Roadmap task not found.' });
      return;
    }

    task.status = parsed.data.status;
    const entries = Array.isArray(roadmap.statusEntries) ? [...roadmap.statusEntries] : [];
    const existingIdx = entries.findIndex(
      (entry: { taskId: string }) => entry.taskId === parsed.data.taskId
    );
    if (existingIdx >= 0) {
      entries[existingIdx] = { taskId: parsed.data.taskId, status: parsed.data.status };
    } else {
      entries.push({ taskId: parsed.data.taskId, status: parsed.data.status });
    }
    roadmap.set('statusEntries', entries);
    await roadmap.save();

    res.json({
      roadmap: serializeRoadmap(roadmap),
    });
  } catch (err) {
    console.error('Update roadmap error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to update roadmap task status.' });
  }
});

router.patch('/roadmap/topics', async (req: AuthenticatedRequest, res) => {
  const parsed = roadmapTopicPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid topic progress update.' });
    return;
  }

  try {
    await connectToDatabase();
    const roadmap = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not found for your account.' });
      return;
    }

    const { taskId, topicId, completed, totalTopics } = parsed.data;
    const task = roadmap.tasks.find((t: { taskId: string }) => t.taskId === taskId);
    if (!task) {
      res.status(404).json({ error: 'Roadmap task not found.' });
      return;
    }

    const topicEntries = Array.isArray(roadmap.topicCompletions) ? [...roadmap.topicCompletions] : [];
    const entryIdx = topicEntries.findIndex((entry: { taskId: string }) => entry.taskId === taskId);
    const currentSet = new Set<string>(
      entryIdx >= 0 && Array.isArray(topicEntries[entryIdx].completedTopicIds)
        ? topicEntries[entryIdx].completedTopicIds
        : []
    );

    if (completed) {
      currentSet.add(topicId);
    } else {
      currentSet.delete(topicId);
    }

    const nextTopicIds = Array.from(currentSet);
    if (entryIdx >= 0) {
      topicEntries[entryIdx] = { taskId, completedTopicIds: nextTopicIds };
    } else {
      topicEntries.push({ taskId, completedTopicIds: nextTopicIds });
    }
    roadmap.set('topicCompletions', topicEntries);

    // Synchronize parent task status based on topic completion without auto-completing on view
    let nextStatus: RoadmapStatus = task.status as RoadmapStatus;
    if (nextTopicIds.length >= totalTopics) {
      nextStatus = 'Completed';
    } else if (nextTopicIds.length > 0) {
      nextStatus = 'In Progress';
    } else if (task.status === 'Completed' || task.status === 'In Progress') {
      nextStatus = 'Not Started';
    }

    task.status = nextStatus;
    const statusEntries = Array.isArray(roadmap.statusEntries) ? [...roadmap.statusEntries] : [];
    const statusIdx = statusEntries.findIndex(
      (entry: { taskId: string }) => entry.taskId === taskId
    );
    if (statusIdx >= 0) {
      statusEntries[statusIdx] = { taskId, status: nextStatus };
    } else {
      statusEntries.push({ taskId, status: nextStatus });
    }
    roadmap.set('statusEntries', statusEntries);

    await roadmap.save();

    res.json({
      roadmap: serializeRoadmap(roadmap),
    });
  } catch (err) {
    console.error('Update topic progress error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to update learning topic progress.' });
  }
});

router.put('/roadmap/target-role', async (req: AuthenticatedRequest, res) => {
  const roleName = typeof req.body?.targetRole === 'string' ? req.body.targetRole.trim() : '';
  const validRole = CAREER_ROLES.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase() || r.id === roleName.toLowerCase()
  );
  if (!validRole) {
    res.status(400).json({ error: 'Select a valid career role.' });
    return;
  }

  try {
    await connectToDatabase();
    await ProfileModel.findOneAndUpdate(
      { userId: req.user!.id },
      { targetRole: validRole.name },
      { upsert: true }
    );
    res.json({ targetRole: validRole.name });
  } catch (err) {
    console.error('Update target role error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to update target role.' });
  }
});

router.post('/roadmap/tasks', async (req: AuthenticatedRequest, res) => {
  const parsed = customRoadmapTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid custom task data.' });
    return;
  }

  try {
    await connectToDatabase();
    const roadmap = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not initialized.' });
      return;
    }

    const customTask = {
      taskId: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      skill: parsed.data.skill,
      priority: parsed.data.priority,
      objective: parsed.data.objective,
      practiceActivity: parsed.data.practiceActivity,
      projectSuggestion: parsed.data.projectSuggestion,
      estimatedHours: parsed.data.estimatedHours,
      status: 'Not Started' as const,
    };

    roadmap.tasks.push(customTask);
    await roadmap.save();

    res.status(201).json({
      roadmap: serializeRoadmap(roadmap),
    });
  } catch (err) {
    console.error('Create custom roadmap task error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to add custom roadmap task.' });
  }
});

router.delete('/roadmap/tasks/:taskId', async (req: AuthenticatedRequest, res) => {
  const taskId = String(req.params.taskId || '');
  if (!taskId.startsWith('custom-')) {
    res.status(400).json({ error: 'Only custom tasks can be removed.' });
    return;
  }

  try {
    await connectToDatabase();
    const roadmap = await RoadmapProgressModel.findOne({ userId: req.user!.id });
    if (!roadmap) {
      res.status(404).json({ error: 'Roadmap not found.' });
      return;
    }

    const filteredTasks = roadmap.tasks.filter((t: { taskId: string }) => t.taskId !== taskId);
    roadmap.set('tasks', filteredTasks);
    if (Array.isArray(roadmap.statusEntries)) {
      roadmap.set(
        'statusEntries',
        roadmap.statusEntries.filter((entry: { taskId: string }) => entry.taskId !== taskId)
      );
    }
    if (Array.isArray(roadmap.topicCompletions)) {
      roadmap.set(
        'topicCompletions',
        roadmap.topicCompletions.filter((entry: { taskId: string }) => entry.taskId !== taskId)
      );
    }
    await roadmap.save();

    res.json({
      roadmap: serializeRoadmap(roadmap),
    });
  } catch (err) {
    console.error('Delete custom task error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to remove custom task.' });
  }
});

router.post('/resume/analyze', uploadRateLimit, async (req: AuthenticatedRequest, res) => {
  const { fileName, mimeType, base64Data, targetRole } = req.body || {};
  if (
    typeof fileName !== 'string' ||
    typeof base64Data !== 'string' ||
    fileName.trim().length === 0
  ) {
    res.status(400).json({ error: 'Please select a valid PDF, DOCX, or TXT resume file.' });
    return;
  }

  try {
    await connectToDatabase();
    const profile = await ProfileModel.findOne({ userId: req.user!.id }).lean();
    const effectiveRole =
      typeof targetRole === 'string' && targetRole.trim().length > 0
        ? targetRole.trim()
        : profile?.targetRole || 'Full Stack Developer';

    const extracted = await extractResumeTextFromBase64({
      fileName,
      mimeType: typeof mimeType === 'string' ? mimeType : '',
      base64Data,
    });

    const analysis = analyzeResumeText(extracted.text, effectiveRole);

    const saved = await ResumeAnalysisModel.create({
      userId: req.user!.id,
      fileName: fileName.slice(0, 120),
      fileType: extracted.fileType,
      fileSizeBytes: extracted.fileSizeBytes,
      targetRole: effectiveRole,
      ...analysis,
    });

    await AdminLogModel.create({
      actorId: req.user!.id,
      action: 'RESUME_ANALYZED',
      targetType: 'ResumeAnalysis',
      summary: `Resume analyzed for ${effectiveRole} (score ${analysis.overallScore}/100).`,
    });

    res.status(201).json({
      analysis: {
        id: String(saved._id),
        fileName: saved.fileName,
        fileType: saved.fileType,
        fileSizeBytes: saved.fileSizeBytes,
        targetRole: saved.targetRole,
        overallScore: saved.overallScore,
        sectionScores: saved.sectionScores,
        detectedSections: saved.detectedSections,
        matchedSkills: saved.matchedSkills,
        missingRoleSkills: saved.missingRoleSkills,
        atsSignals: saved.atsSignals,
        recommendations: saved.recommendations,
        wordCount: saved.wordCount,
        scoringMethodNote: saved.scoringMethodNote,
        createdAt: saved.createdAt,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unable to extract and analyze resume document.';
    res.status(400).json({ error: message });
  }
});

router.get('/resume/history', async (req: AuthenticatedRequest, res) => {
  try {
    await connectToDatabase();
    const docs = await ResumeAnalysisModel.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const analyses = docs.map((d) => ({
      id: String(d._id),
      fileName: d.fileName,
      fileType: d.fileType,
      fileSizeBytes: d.fileSizeBytes,
      targetRole: d.targetRole,
      overallScore: d.overallScore,
      sectionScores: d.sectionScores,
      detectedSections: d.detectedSections,
      matchedSkills: d.matchedSkills,
      missingRoleSkills: d.missingRoleSkills,
      atsSignals: d.atsSignals,
      recommendations: d.recommendations,
      wordCount: d.wordCount,
      scoringMethodNote: d.scoringMethodNote,
      createdAt: d.createdAt,
    }));

    res.json({ analyses });
  } catch (err) {
    console.error('Resume history error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load resume analysis history.' });
  }
});

export default router;
