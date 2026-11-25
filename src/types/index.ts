export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface StudentProfileData {
  name: string;
  email: string;
  university: string;
  degree: string;
  branch: string;
  semester: number;
  cgpa: number;
  sscPercentage: number;
  hscPercentage: number;
  hscStream: 'Science' | 'Commerce' | 'Arts';
  degreeType: 'Sci&Tech' | 'Comm&Mgmt' | 'Others';
  technicalSkills: string[];
  programmingLanguages: string[];
  projects: ProjectItem[];
  internshipsCount: number;
  hasWorkExperience: boolean;
  certifications: string[];
  communicationLevel: number;
  aptitudeScore: number;
  codingPracticeHours: number;
  careerInterests: string[];
  targetRole: string;
  updatedAt?: string;
}

export interface ModelFeatureInput {
  ssc_p: number;
  hsc_p: number;
  degree_p: number;
  etest_p: number;
  mba_p: number;
  hsc_s: 'Arts' | 'Commerce' | 'Science';
  degree_t: 'Comm&Mgmt' | 'Others' | 'Sci&Tech';
  workex: 'No' | 'Yes';
  specialisation: 'Mkt&Fin' | 'Mkt&HR';
}

export interface AssessmentSubmission {
  academics: {
    sscPercentage: number;
    hscPercentage: number;
    hscStream: 'Science' | 'Commerce' | 'Arts';
    degreePercentage: number;
    degreeType: 'Sci&Tech' | 'Comm&Mgmt' | 'Others';
    specializationTrack: 'Mkt&Fin' | 'Mkt&HR';
    coreSpecializationPercentage: number;
  };
  skills: {
    technicalSkills: string[];
    programmingLanguages: string[];
    problemSolvingScore: number;
    codingPracticeHours: number;
  };
  experience: {
    projectsCount: number;
    internshipsCount: number;
    hasWorkExperience: boolean;
    certificationsCount: number;
  };
  readiness: {
    aptitudeTestPercentage: number;
    communicationRating: number;
    interviewReadinessRating: number;
    targetRole: string;
    careerInterests: string[];
  };
  modelFeatures: ModelFeatureInput;
  clientPrediction?: {
    predictedClass: 'Placed' | 'Not Placed';
    probability: number;
    inferenceEngine: 'onnxruntime-web' | 'server-fallback';
  };
}

export interface FeatureFactor {
  feature: string;
  label: string;
  importance: number;
  studentValue: string;
  direction: 'positive' | 'neutral' | 'attention';
}

export interface PredictionRecord {
  id: string;
  assessmentId: string;
  predictedClass: 'Placed' | 'Not Placed';
  readinessCategory: 'High Readiness' | 'Moderate Readiness' | 'Developing Readiness';
  probability: number;
  readinessScore: number;
  modelName: string;
  modelVersion: string;
  inferenceEngine: 'onnxruntime-web' | 'server-fallback';
  topFactors: FeatureFactor[];
  strengths: string[];
  improvements: string[];
  disclaimer: string;
  createdAt: string;
}

export type RoadmapStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface RoadmapTask {
  taskId: string;
  skill: string;
  priority: 'High' | 'Medium' | 'Foundation';
  objective: string;
  practiceActivity: string;
  projectSuggestion: string;
  estimatedHours: number;
  status: RoadmapStatus;
}

export interface RoadmapRecord {
  targetRole: string;
  tasks: RoadmapTask[];
  topicCompletions?: Record<string, string[]>;
  updatedAt?: string;
}

export interface ResumeAnalysisRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  targetRole: string;
  overallScore: number;
  sectionScores: {
    contactInfo: number;
    education: number;
    skills: number;
    projects: number;
    experience: number;
    certifications: number;
    formattingSignals: number;
  };
  detectedSections: string[];
  matchedSkills: string[];
  missingRoleSkills: string[];
  atsSignals: string[];
  recommendations: string[];
  wordCount: number;
  scoringMethodNote: string;
  createdAt: string;
}

export interface CareerRoleDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  beginnerRoadmap: string[];
  intermediateRoadmap: string[];
  advancedRoadmap: string[];
  suggestedProjects: string[];
  learningObjectives: string[];
}

export interface ModelMetadataReport {
  generatedAt: string;
  dataset: {
    name: string;
    source: string;
    sourceUrl: string;
    license: string;
    rawRows: number;
    cleanedRows: number;
    duplicatesRemoved: number;
    trainRows: number;
    testRows: number;
    classDistribution: {
      Placed: number;
      NotPlaced: number;
    };
  };
  selectedModel: string;
  selectionRationale: string;
  models: Record<
    string,
    {
      cv5Fold: {
        accuracyMean: number;
        accuracyStd: number;
        f1Mean: number;
        rocAucMean: number;
      };
      holdoutTest: {
        accuracy: number;
        precision: number;
        recall: number;
        f1: number;
        rocAuc: number;
        confusionMatrix: {
          tn: number;
          fp: number;
          fn: number;
          tp: number;
        };
      };
      featureImportances: Array<{ feature: string; importance: number }>;
    }
  >;
  preprocessing: {
    schemaVersion: string;
    numericFeatures: Array<{ name: string; mean: number; scale: number }>;
    categoricalFeatures: Array<{ name: string; categories: string[] }>;
    transformedFeatureNames: string[];
    inputVectorLength: number;
    excludedColumns: Record<string, string>;
  };
  limitations: string[];
}
