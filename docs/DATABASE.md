# MongoDB Atlas Database Design

CareerIQ connects to MongoDB Atlas (`dbName: 'careeriq'`) via Mongoose (`server/config/db.ts`), using connection caching across serverless/server invocations.

## Collections & Indexes

1. **`users`**
   - Fields: `name`, `email` (unique, lowercase, indexed), `passwordHash` (`bcryptjs` 12 rounds), `role` (`'student' | 'admin'`, default `'student'`), `createdAt`, `updatedAt`.
2. **`profiles`**
   - Fields: `userId` (unique ref `User`, indexed), `university`, `degree`, `branch`, `semester`, `cgpa`, `sscPercentage`, `hscPercentage`, `hscStream`, `degreeType`, `technicalSkills[]`, `programmingLanguages[]`, `projects[]`, `internshipsCount`, `hasWorkExperience`, `certifications[]`, `communicationLevel`, `aptitudeScore`, `codingPracticeHours`, `careerInterests[]`, `targetRole`.
3. **`assessments`**
   - Fields: `userId` (indexed ref `User`), `academics`, `skills`, `experience`, `readiness`, `modelFeatures`, `featureSchemaVersion`.
   - Compound index: `{ userId: 1, createdAt: -1 }`.
4. **`predictions`**
   - Fields: `userId` (indexed ref `User`), `assessmentId` (ref `Assessment`), `predictedClass` (`Placed | Not Placed`), `readinessCategory`, `probability`, `readinessScore`, `modelName`, `modelVersion`, `inferenceEngine`, `topFactors[]`, `strengths[]`, `improvements[]`, `disclaimer`.
   - Compound index: `{ userId: 1, createdAt: -1 }`.
5. **`roadmapprogresses`**
   - Fields: `userId` (unique ref `User`), `targetRole`, `tasks[]` (`taskId`, `skill`, `priority`, `objective`, `practiceActivity`, `projectSuggestion`, `estimatedHours`, `status`).
6. **`resumeanalyses`**
   - Fields: `userId` (indexed ref `User`), `fileName`, `fileType`, `fileSizeBytes`, `targetRole`, `overallScore`, `sectionScores`, `detectedSections[]`, `matchedSkills[]`, `missingRoleSkills[]`, `atsSignals[]`, `recommendations[]`, `wordCount`, `scoringMethodNote`.
   - Note: Raw extracted resume text is processed transiently in memory and **not persisted** to minimize sensitive PII retention.
7. **`adminlogs`**
   - Fields: `actorId`, `action`, `targetType`, `summary`, `createdAt` (indexed descending).
8. **`systemconfigs`**
   - Stores hashed first-run admin bootstrap passcode (`key: 'admin_claim'`) when `ADMIN_PASSCODE` env var is unset.
