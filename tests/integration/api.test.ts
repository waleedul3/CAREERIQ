import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiApp } from '../../server/app.ts';

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);

describe('CareerIQ API Integration', () => {
  let server: http.Server;
  let baseUrl = '';

  beforeAll(async () => {
    const app = createApiApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('responds ok on GET /api/health', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; modelPath: string };
    expect(data.status).toBe('ok');
    expect(data.modelPath).toBe('/models/employability_model.onnx');
  });

  it('blocks unauthenticated access to protected student and admin endpoints', async () => {
    const profRes = await fetch(`${baseUrl}/api/profile`);
    expect(profRes.status).toBe(401);

    const adminRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    expect(adminRes.status).toBe(401);
  });

  it.skipIf(!hasMongo)(
    'supports student registration, profile update, assessment prediction, roadmap progress, resume analysis, and blocks student access to admin routes',
    async () => {
      const uniqueEmail = `test_student_${Date.now()}@university.edu`;
      try {
        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Student',
            email: uniqueEmail,
            password: 'TestPassword123',
            confirmPassword: 'TestPassword123',
          }),
        });
        expect(regRes.status).toBe(201);
        const regJson = (await regRes.json()) as {
          user: { role: string; email: string };
          token: string;
        };
        expect(regJson.user.role).toBe('student');
        const authHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${regJson.token}`,
        };

        // Student cannot access admin endpoint (server-side RBAC check)
        const adminDenied = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: authHeaders });
        expect(adminDenied.status).toBe(403);

        // Update profile
        const profRes = await fetch(`${baseUrl}/api/profile`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: 'Test Student',
            university: 'National Institute of Technology',
            degree: 'B.Tech',
            branch: 'CSE',
            semester: 8,
            cgpa: 8.5,
            sscPercentage: 84,
            hscPercentage: 82,
            hscStream: 'Science',
            degreeType: 'Sci&Tech',
            technicalSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
            programmingLanguages: ['JavaScript', 'Python'],
            projects: [],
            internshipsCount: 1,
            hasWorkExperience: true,
            certifications: ['AWS Cloud Practitioner'],
            communicationLevel: 8,
            aptitudeScore: 81,
            codingPracticeHours: 10,
            careerInterests: ['Full Stack Development'],
            targetRole: 'Full Stack Developer',
          }),
        });
        expect(profRes.status).toBe(200);

        // Submit assessment
        const assessRes = await fetch(`${baseUrl}/api/assessments`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            academics: {
              sscPercentage: 84,
              hscPercentage: 82,
              hscStream: 'Science',
              degreePercentage: 85,
              degreeType: 'Sci&Tech',
              specializationTrack: 'Mkt&Fin',
              coreSpecializationPercentage: 78,
            },
            skills: {
              technicalSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
              programmingLanguages: ['JavaScript', 'Python'],
              problemSolvingScore: 8,
              codingPracticeHours: 10,
            },
            experience: {
              projectsCount: 3,
              internshipsCount: 1,
              hasWorkExperience: true,
              certificationsCount: 1,
            },
            readiness: {
              aptitudeTestPercentage: 81,
              communicationRating: 8,
              interviewReadinessRating: 8,
              targetRole: 'Full Stack Developer',
              careerInterests: ['Full Stack Development'],
            },
            modelFeatures: {
              ssc_p: 84,
              hsc_p: 82,
              degree_p: 85,
              etest_p: 81,
              mba_p: 78,
              hsc_s: 'Science',
              degree_t: 'Sci&Tech',
              workex: 'Yes',
              specialisation: 'Mkt&Fin',
            },
            clientPrediction: {
              predictedClass: 'Placed',
              probability: 0.88,
              inferenceEngine: 'onnxruntime-web',
            },
          }),
        });
        expect(assessRes.status).toBe(201);
        const assessJson = (await assessRes.json()) as {
          prediction: { readinessCategory: string; probability: number };
        };
        expect(assessJson.prediction.readinessCategory).toBe('High Readiness');

        // Roadmap update, cross-role status preservation, target role update, and custom task CRUD
        const roadGet = await fetch(`${baseUrl}/api/roadmap`, { headers: authHeaders });
        expect(roadGet.status).toBe(200);
        const roadJson = (await roadGet.json()) as {
          roadmap: { tasks: Array<{ taskId: string; status: string }> };
          profileTargetRole?: string;
        };
        expect(roadJson.roadmap.tasks.length).toBeGreaterThan(0);

        const taskId = roadJson.roadmap.tasks[0].taskId;
        // Toggle topic completion and verify status + MongoDB persistence across reloads
        const topicPartialRes = await fetch(`${baseUrl}/api/roadmap/topics`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            taskId,
            topicId: 'topic-1',
            completed: true,
            totalTopics: 2,
          }),
        });
        expect(topicPartialRes.status).toBe(200);
        const topicPartialJson = (await topicPartialRes.json()) as {
          roadmap: {
            tasks: Array<{ taskId: string; status: string }>;
            topicCompletions?: Record<string, string[]>;
          };
        };
        expect(topicPartialJson.roadmap.topicCompletions?.[taskId]).toEqual(['topic-1']);
        expect(topicPartialJson.roadmap.tasks.find((t) => t.taskId === taskId)?.status).toBe(
          'In Progress'
        );

        const topicCompleteRes = await fetch(`${baseUrl}/api/roadmap/topics`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            taskId,
            topicId: 'topic-2',
            completed: true,
            totalTopics: 2,
          }),
        });
        expect(topicCompleteRes.status).toBe(200);
        const topicCompleteJson = (await topicCompleteRes.json()) as {
          roadmap: {
            tasks: Array<{ taskId: string; status: string }>;
            topicCompletions?: Record<string, string[]>;
          };
        };
        expect(topicCompleteJson.roadmap.topicCompletions?.[taskId]).toEqual([
          'topic-1',
          'topic-2',
        ]);
        expect(topicCompleteJson.roadmap.tasks.find((t) => t.taskId === taskId)?.status).toBe(
          'Completed'
        );

        const roadPatch = await fetch(`${baseUrl}/api/roadmap/progress`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ taskId, status: 'Completed' }),
        });
        expect(roadPatch.status).toBe(200);

        // Switch to Data Analyst, then switch back to Full Stack Developer and verify status persisted
        const otherRoad = await fetch(`${baseUrl}/api/roadmap?role=Data%20Analyst`, {
          headers: authHeaders,
        });
        expect(otherRoad.status).toBe(200);
        const backRoad = await fetch(`${baseUrl}/api/roadmap?role=Full%20Stack%20Developer`, {
          headers: authHeaders,
        });
        expect(backRoad.status).toBe(200);
        const backJson = (await backRoad.json()) as {
          roadmap: { tasks: Array<{ taskId: string; status: string }> };
        };
        expect(backJson.roadmap.tasks.find((t) => t.taskId === taskId)?.status).toBe('Completed');

        // Update active target role via roadmap endpoint
        const setTargetRes = await fetch(`${baseUrl}/api/roadmap/target-role`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ targetRole: 'Backend Developer' }),
        });
        expect(setTargetRes.status).toBe(200);
        const setTargetJson = (await setTargetRes.json()) as { targetRole: string };
        expect(setTargetJson.targetRole).toBe('Backend Developer');

        // Add custom roadmap task and then delete it
        const addTaskRes = await fetch(`${baseUrl}/api/roadmap/tasks`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            skill: 'Redis Caching',
            priority: 'Medium',
            objective: 'Implement Redis caching for hot API endpoints',
            practiceActivity: 'Build a cache-aside wrapper with TTL invalidation',
            projectSuggestion: 'Cached analytics summary endpoint',
            estimatedHours: 6,
          }),
        });
        expect(addTaskRes.status).toBe(201);
        const addTaskJson = (await addTaskRes.json()) as {
          roadmap: { tasks: Array<{ taskId: string; skill: string }> };
        };
        const customTask = addTaskJson.roadmap.tasks.find((t) => t.taskId.startsWith('custom-'));
        expect(customTask?.skill).toBe('Redis Caching');

        const delTaskRes = await fetch(
          `${baseUrl}/api/roadmap/tasks/${encodeURIComponent(customTask!.taskId)}`,
          { method: 'DELETE', headers: authHeaders }
        );
        expect(delTaskRes.status).toBe(200);
        const delTaskJson = (await delTaskRes.json()) as {
          roadmap: { tasks: Array<{ taskId: string }> };
        };
        expect(delTaskJson.roadmap.tasks.some((t) => t.taskId === customTask!.taskId)).toBe(false);

        // Resume analyze (TXT sample)
        const sampleTxt = Buffer.from(
          'Test Student\ntest@university.edu | +91 9999999999 | github.com/test\nEDUCATION\nB.Tech CSE CGPA 8.5\nSKILLS\nHTML, CSS, JavaScript, React, Node.js, Git, SQL\nPROJECTS\nBuilt API service improving response time by 40%.\nEXPERIENCE\nSoftware Intern working on React dashboards.',
          'utf8'
        ).toString('base64');

        const resumeRes = await fetch(`${baseUrl}/api/resume/analyze`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            fileName: 'resume.txt',
            mimeType: 'text/plain',
            base64Data: sampleTxt,
            targetRole: 'Full Stack Developer',
          }),
        });
        expect(resumeRes.status).toBe(201);
        const resumeJson = (await resumeRes.json()) as { analysis: { overallScore: number } };
        expect(resumeJson.analysis.overallScore).toBeGreaterThan(60);
      } finally {
        // Clean up test user records so Atlas DB remains clean
        const {
          UserModel,
          ProfileModel,
          AssessmentModel,
          PredictionModel,
          RoadmapProgressModel,
          ResumeAnalysisModel,
          AdminLogModel,
        } = await import('../../server/models/index.ts');
        const testUser = await UserModel.findOne({ email: uniqueEmail }).lean();
        if (testUser) {
          await Promise.all([
            ProfileModel.deleteMany({ userId: testUser._id }),
            AssessmentModel.deleteMany({ userId: testUser._id }),
            PredictionModel.deleteMany({ userId: testUser._id }),
            RoadmapProgressModel.deleteMany({ userId: testUser._id }),
            ResumeAnalysisModel.deleteMany({ userId: testUser._id }),
            AdminLogModel.deleteMany({ actorId: testUser._id }),
            UserModel.deleteOne({ _id: testUser._id }),
          ]);
        }
      }
    },
    25000
  );
});
