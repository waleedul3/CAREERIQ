import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
  },
  { timestamps: true }
);

const ProjectSubSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    techStack: [{ type: String, trim: true }],
    link: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const ProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    university: { type: String, default: 'University Institute of Technology', trim: true },
    degree: { type: String, default: 'B.Tech', trim: true },
    branch: { type: String, default: 'Computer Science & Engineering', trim: true },
    semester: { type: Number, default: 7, min: 1, max: 12 },
    cgpa: { type: Number, default: 7.5, min: 0, max: 10 },
    sscPercentage: { type: Number, default: 75, min: 0, max: 100 },
    hscPercentage: { type: Number, default: 74, min: 0, max: 100 },
    hscStream: { type: String, enum: ['Science', 'Commerce', 'Arts'], default: 'Science' },
    degreeType: { type: String, enum: ['Sci&Tech', 'Comm&Mgmt', 'Others'], default: 'Sci&Tech' },
    technicalSkills: [{ type: String, trim: true }],
    programmingLanguages: [{ type: String, trim: true }],
    projects: [ProjectSubSchema],
    internshipsCount: { type: Number, default: 0, min: 0, max: 20 },
    hasWorkExperience: { type: Boolean, default: false },
    certifications: [{ type: String, trim: true }],
    communicationLevel: { type: Number, default: 7, min: 1, max: 10 },
    aptitudeScore: { type: Number, default: 72, min: 0, max: 100 },
    codingPracticeHours: { type: Number, default: 6, min: 0, max: 80 },
    careerInterests: [{ type: String, trim: true }],
    targetRole: { type: String, default: 'Full Stack Developer', trim: true },
  },
  { timestamps: true }
);

const AssessmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    academics: {
      sscPercentage: { type: Number, required: true },
      hscPercentage: { type: Number, required: true },
      hscStream: { type: String, enum: ['Science', 'Commerce', 'Arts'], required: true },
      degreePercentage: { type: Number, required: true },
      degreeType: { type: String, enum: ['Sci&Tech', 'Comm&Mgmt', 'Others'], required: true },
      specializationTrack: { type: String, enum: ['Mkt&Fin', 'Mkt&HR'], required: true },
      coreSpecializationPercentage: { type: Number, required: true },
    },
    skills: {
      technicalSkills: [{ type: String }],
      programmingLanguages: [{ type: String }],
      problemSolvingScore: { type: Number, required: true },
      codingPracticeHours: { type: Number, required: true },
    },
    experience: {
      projectsCount: { type: Number, required: true },
      internshipsCount: { type: Number, required: true },
      hasWorkExperience: { type: Boolean, required: true },
      certificationsCount: { type: Number, required: true },
    },
    readiness: {
      aptitudeTestPercentage: { type: Number, required: true },
      communicationRating: { type: Number, required: true },
      interviewReadinessRating: { type: Number, required: true },
      targetRole: { type: String, required: true },
      careerInterests: [{ type: String }],
    },
    modelFeatures: {
      ssc_p: { type: Number, required: true },
      hsc_p: { type: Number, required: true },
      degree_p: { type: Number, required: true },
      etest_p: { type: Number, required: true },
      mba_p: { type: Number, required: true },
      hsc_s: { type: String, required: true },
      degree_t: { type: String, required: true },
      workex: { type: String, required: true },
      specialisation: { type: String, required: true },
    },
    featureSchemaVersion: { type: String, default: '1.0.0' },
  },
  { timestamps: true }
);
AssessmentSchema.index({ userId: 1, createdAt: -1 });

const PredictionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    predictedClass: { type: String, enum: ['Placed', 'Not Placed'], required: true },
    readinessCategory: {
      type: String,
      enum: ['High Readiness', 'Moderate Readiness', 'Developing Readiness'],
      required: true,
    },
    probability: { type: Number, required: true, min: 0, max: 1 },
    readinessScore: { type: Number, required: true, min: 0, max: 100 },
    modelName: { type: String, required: true },
    modelVersion: { type: String, required: true },
    inferenceEngine: { type: String, enum: ['onnxruntime-web', 'server-fallback'], required: true },
    topFactors: [
      {
        feature: String,
        label: String,
        importance: Number,
        studentValue: String,
        direction: { type: String, enum: ['positive', 'neutral', 'attention'] },
      },
    ],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    disclaimer: { type: String, required: true },
  },
  { timestamps: true }
);
PredictionSchema.index({ userId: 1, createdAt: -1 });

const RoadmapTaskSubSchema = new Schema(
  {
    taskId: { type: String, required: true },
    skill: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Foundation'], required: true },
    objective: { type: String, required: true },
    practiceActivity: { type: String, required: true },
    projectSuggestion: { type: String, required: true },
    estimatedHours: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
  },
  { _id: false }
);

const RoadmapStatusEntrySubSchema = new Schema(
  {
    taskId: { type: String, required: true },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      required: true,
    },
  },
  { _id: false }
);

const TopicCompletionEntrySubSchema = new Schema(
  {
    taskId: { type: String, required: true },
    completedTopicIds: { type: [String], default: [] },
  },
  { _id: false }
);

const RoadmapProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    targetRole: { type: String, required: true },
    tasks: [RoadmapTaskSubSchema],
    statusEntries: { type: [RoadmapStatusEntrySubSchema], default: [] },
    topicCompletions: { type: [TopicCompletionEntrySubSchema], default: [] },
  },
  { timestamps: true }
);

const ResumeAnalysisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    targetRole: { type: String, required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    sectionScores: {
      contactInfo: Number,
      education: Number,
      skills: Number,
      projects: Number,
      experience: Number,
      certifications: Number,
      formattingSignals: Number,
    },
    detectedSections: [{ type: String }],
    matchedSkills: [{ type: String }],
    missingRoleSkills: [{ type: String }],
    atsSignals: [{ type: String }],
    recommendations: [{ type: String }],
    wordCount: { type: Number, required: true },
    scoringMethodNote: { type: String, required: true },
  },
  { timestamps: true }
);
ResumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

const AdminLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);
AdminLogSchema.index({ createdAt: -1 });

const SystemConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    adminPasscodeHash: { type: String, required: true },
    claimedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
export const AssessmentModel =
  mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export const PredictionModel =
  mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
export const RoadmapProgressModel =
  mongoose.models.RoadmapProgress || mongoose.model('RoadmapProgress', RoadmapProgressSchema);
export const ResumeAnalysisModel =
  mongoose.models.ResumeAnalysis || mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
export const AdminLogModel =
  mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);
export const SystemConfigModel =
  mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
