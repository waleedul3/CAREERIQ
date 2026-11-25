import { Router } from 'express';
import { connectToDatabase } from '../config/db.ts';
import { requireAdmin, requireAuth } from '../middleware/auth.ts';
import {
  AdminLogModel,
  AssessmentModel,
  PredictionModel,
  ProfileModel,
  ResumeAnalysisModel,
  UserModel,
} from '../models/index.ts';
import { analyzeSkillGap } from '../../src/lib/careerRoles.ts';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', async (_req, res) => {
  try {
    await connectToDatabase();

    const [
      totalStudents,
      totalAssessments,
      totalResumes,
      predictions,
      profiles,
      recentLogs,
    ] = await Promise.all([
      UserModel.countDocuments({ role: 'student' }),
      AssessmentModel.countDocuments(),
      ResumeAnalysisModel.countDocuments(),
      PredictionModel.find()
        .select('readinessCategory predictedClass readinessScore probability createdAt userId')
        .sort({ createdAt: -1 })
        .lean(),
      ProfileModel.find().select('targetRole technicalSkills').lean(),
      AdminLogModel.find().sort({ createdAt: -1 }).limit(12).select('action targetType summary createdAt').lean(),
    ]);

    const avgReadiness =
      predictions.length > 0
        ? Math.round(
            predictions.reduce((acc, p) => acc + Number(p.readinessScore || 0), 0) /
              predictions.length
          )
        : 0;

    const categoryCounts: Record<string, number> = {
      'High Readiness': 0,
      'Moderate Readiness': 0,
      'Developing Readiness': 0,
    };
    const outcomeCounts = { Placed: 0, 'Not Placed': 0 };

    predictions.forEach((p) => {
      if (p.readinessCategory in categoryCounts) {
        categoryCounts[p.readinessCategory] += 1;
      }
      if (p.predictedClass === 'Placed') outcomeCounts.Placed += 1;
      else outcomeCounts['Not Placed'] += 1;
    });

    const roleCounts = new Map<string, number>();
    const gapCounts = new Map<string, number>();

    profiles.forEach((prof) => {
      const role = prof.targetRole || 'Full Stack Developer';
      roleCounts.set(role, (roleCounts.get(role) || 0) + 1);

      const gap = analyzeSkillGap(prof.technicalSkills || [], role);
      gap.missingRequired.forEach((skill) => {
        gapCounts.set(skill, (gapCounts.get(skill) || 0) + 1);
      });
    });

    const popularRoles = Array.from(roleCounts.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const commonSkillGaps = Array.from(gapCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Group assessment trends by date (YYYY-MM-DD)
    const trendMap = new Map<string, { date: string; count: number; totalScore: number }>();
    predictions
      .slice()
      .reverse()
      .forEach((p) => {
        const date = new Date(p.createdAt).toISOString().slice(0, 10);
        const entry = trendMap.get(date) || { date, count: 0, totalScore: 0 };
        entry.count += 1;
        entry.totalScore += Number(p.readinessScore || 0);
        trendMap.set(date, entry);
      });

    const assessmentTrends = Array.from(trendMap.values()).map((t) => ({
      date: t.date,
      assessments: t.count,
      avgReadiness: Math.round(t.totalScore / t.count),
    }));

    res.json({
      summary: {
        totalStudents,
        completedAssessments: totalAssessments,
        analyzedResumes: totalResumes,
        averageReadiness: avgReadiness,
      },
      predictionDistribution: Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      })),
      outcomeDistribution: [
        { outcome: 'Placed Estimate', count: outcomeCounts.Placed },
        { outcome: 'Needs Development', count: outcomeCounts['Not Placed'] },
      ],
      popularRoles,
      commonSkillGaps,
      assessmentTrends,
      recentActivity: recentLogs,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load administrator analytics.' });
  }
});

router.get('/students', async (req, res) => {
  try {
    await connectToDatabase();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(5, Number(req.query.limit) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query: Record<string, unknown> = { role: 'student' };
    if (search) {
      const safeRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.name = safeRegex;
    }

    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query)
      .select('name createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const userIds = users.map((u) => u._id);
    const [profiles, predictions] = await Promise.all([
      ProfileModel.find({ userId: { $in: userIds } })
        .select('userId university branch semester cgpa targetRole technicalSkills')
        .lean(),
      PredictionModel.find({ userId: { $in: userIds } })
        .sort({ createdAt: -1 })
        .select('userId readinessScore readinessCategory probability createdAt')
        .lean(),
    ]);

    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));
    const latestPredMap = new Map<string, (typeof predictions)[0]>();
    const predCountMap = new Map<string, number>();

    predictions.forEach((p) => {
      const uid = String(p.userId);
      predCountMap.set(uid, (predCountMap.get(uid) || 0) + 1);
      if (!latestPredMap.has(uid)) {
        latestPredMap.set(uid, p);
      }
    });

    // Expose only academic & readiness metadata (no emails or private resumes)
    const students = users.map((u) => {
      const uid = String(u._id);
      const prof = profileMap.get(uid);
      const pred = latestPredMap.get(uid);
      return {
        id: uid,
        name: u.name,
        university: prof?.university || 'Not specified',
        branch: prof?.branch || 'Not specified',
        semester: prof?.semester || 0,
        cgpa: prof?.cgpa || 0,
        targetRole: prof?.targetRole || 'Full Stack Developer',
        skillsCount: prof?.technicalSkills?.length || 0,
        assessmentsCount: predCountMap.get(uid) || 0,
        latestReadinessScore: pred?.readinessScore ?? null,
        latestReadinessCategory: pred?.readinessCategory ?? 'Not Assessed',
        joinedAt: u.createdAt,
      };
    });

    res.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error('Admin students error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to load student overview.' });
  }
});

router.get('/analytics', async (_req, res) => {
  try {
    await connectToDatabase();
    const predictions = await PredictionModel.find()
      .select('probability readinessScore modelName inferenceEngine createdAt')
      .lean();

    const engineCounts = predictions.reduce(
      (acc, p) => {
        if (p.inferenceEngine === 'onnxruntime-web') acc.onnx += 1;
        else acc.fallback += 1;
        return acc;
      },
      { onnx: 0, fallback: 0 }
    );

    res.json({
      totalPredictions: predictions.length,
      averageProbability:
        predictions.length > 0
          ? Number(
              (
                predictions.reduce((sum, p) => sum + Number(p.probability || 0), 0) /
                predictions.length
              ).toFixed(4)
            )
          : 0,
      inferenceEngineCounts: engineCounts,
    });
  } catch (err) {
    console.error('Admin analytics error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to compute analytics summary.' });
  }
});

export default router;
