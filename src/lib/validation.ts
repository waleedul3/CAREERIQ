import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
    email: z.string().trim().email('Enter a valid academic or personal email address').max(120),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const projectItemSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(500),
  techStack: z.array(z.string().trim().min(1).max(40)).max(15),
  link: z
    .string()
    .trim()
    .max(300)
    .optional()
    .refine(
      (val) => !val || val.startsWith('https://') || val.startsWith('http://'),
      'Project URL must start with http:// or https://'
    ),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  university: z.string().trim().min(2).max(160),
  degree: z.string().trim().min(2).max(100),
  branch: z.string().trim().min(2).max(100),
  semester: z.coerce.number().int().min(1).max(12),
  cgpa: z.coerce.number().min(0).max(10),
  sscPercentage: z.coerce.number().min(0).max(100),
  hscPercentage: z.coerce.number().min(0).max(100),
  hscStream: z.enum(['Science', 'Commerce', 'Arts']),
  degreeType: z.enum(['Sci&Tech', 'Comm&Mgmt', 'Others']),
  technicalSkills: z.array(z.string().trim().min(1).max(50)).max(50),
  programmingLanguages: z.array(z.string().trim().min(1).max(40)).max(25),
  projects: z.array(projectItemSchema).max(20),
  internshipsCount: z.coerce.number().int().min(0).max(20),
  hasWorkExperience: z.boolean(),
  certifications: z.array(z.string().trim().min(1).max(120)).max(30),
  communicationLevel: z.coerce.number().min(1).max(10),
  aptitudeScore: z.coerce.number().min(0).max(100),
  codingPracticeHours: z.coerce.number().min(0).max(80),
  careerInterests: z.array(z.string().trim().min(1).max(60)).max(15),
  targetRole: z.string().trim().min(2).max(80),
});

export const modelFeatureInputSchema = z.object({
  ssc_p: z.coerce.number().min(0).max(100),
  hsc_p: z.coerce.number().min(0).max(100),
  degree_p: z.coerce.number().min(0).max(100),
  etest_p: z.coerce.number().min(0).max(100),
  mba_p: z.coerce.number().min(0).max(100),
  hsc_s: z.enum(['Arts', 'Commerce', 'Science']),
  degree_t: z.enum(['Comm&Mgmt', 'Others', 'Sci&Tech']),
  workex: z.enum(['No', 'Yes']),
  specialisation: z.enum(['Mkt&Fin', 'Mkt&HR']),
});

export const assessmentSubmitSchema = z.object({
  academics: z.object({
    sscPercentage: z.coerce.number().min(0).max(100),
    hscPercentage: z.coerce.number().min(0).max(100),
    hscStream: z.enum(['Science', 'Commerce', 'Arts']),
    degreePercentage: z.coerce.number().min(0).max(100),
    degreeType: z.enum(['Sci&Tech', 'Comm&Mgmt', 'Others']),
    specializationTrack: z.enum(['Mkt&Fin', 'Mkt&HR']),
    coreSpecializationPercentage: z.coerce.number().min(0).max(100),
  }),
  skills: z.object({
    technicalSkills: z.array(z.string().trim().min(1).max(50)).max(50),
    programmingLanguages: z.array(z.string().trim().min(1).max(40)).max(25),
    problemSolvingScore: z.coerce.number().min(1).max(10),
    codingPracticeHours: z.coerce.number().min(0).max(80),
  }),
  experience: z.object({
    projectsCount: z.coerce.number().int().min(0).max(30),
    internshipsCount: z.coerce.number().int().min(0).max(20),
    hasWorkExperience: z.boolean(),
    certificationsCount: z.coerce.number().int().min(0).max(30),
  }),
  readiness: z.object({
    aptitudeTestPercentage: z.coerce.number().min(0).max(100),
    communicationRating: z.coerce.number().min(1).max(10),
    interviewReadinessRating: z.coerce.number().min(1).max(10),
    targetRole: z.string().trim().min(2).max(80),
    careerInterests: z.array(z.string().trim().min(1).max(60)).max(15),
  }),
  modelFeatures: modelFeatureInputSchema,
  clientPrediction: z
    .object({
      predictedClass: z.enum(['Placed', 'Not Placed']),
      probability: z.coerce.number().min(0).max(1),
      inferenceEngine: z.enum(['onnxruntime-web', 'server-fallback']),
    })
    .optional(),
});

export const roadmapStatusPatchSchema = z.object({
  taskId: z.string().trim().min(1).max(120),
  status: z.enum(['Not Started', 'In Progress', 'Completed']),
  targetRole: z.string().trim().min(2).max(80).optional(),
});

export const roadmapTopicPatchSchema = z.object({
  taskId: z.string().trim().min(1).max(120),
  topicId: z.string().trim().min(1).max(120),
  completed: z.boolean(),
  totalTopics: z.coerce.number().int().min(1).max(50),
});

export const customRoadmapTaskSchema = z.object({
  skill: z.string().trim().min(2, 'Skill or milestone name is required').max(80),
  priority: z.enum(['High', 'Medium', 'Foundation']).default('Medium'),
  objective: z.string().trim().min(5, 'Learning objective must be at least 5 characters').max(260),
  practiceActivity: z.string().trim().min(5, 'Practice activity must be at least 5 characters').max(260),
  projectSuggestion: z.string().trim().min(5, 'Project suggestion must be at least 5 characters').max(260),
  estimatedHours: z.coerce.number().int().min(1).max(100),
});
