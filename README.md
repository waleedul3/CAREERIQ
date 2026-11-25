# CareerIQ

**Official Academic Project Title:** *An Intelligent Employability Analytics and Career Readiness Platform Using Machine Learning and Data Analytics*

CareerIQ is a full-stack employability analytics and career-readiness platform built for final-year engineering students. It pairs **browser-side ONNX machine learning inference** (`onnxruntime-web`) with transparent **rule-based skill gap analysis, career role matching, deterministic learning roadmaps, and open-source resume analysis**—backed by MongoDB Atlas and zero paid AI APIs.

---

## Key Features

- **Landing & Sample ONNX Explorer**: Interactive landing experience where students can test the live ONNX Random Forest model directly in the browser before registering.
- **Role-Based Authentication**: Secure registration, login, logout, `bcryptjs` password hashing, JWT sessions (`HttpOnly` partitioned cookies + in-memory Bearer token), and server-enforced Student/Admin authorization.
- **Student Profile**: Persists academic history (`10th`, `12th`, `CGPA`, `stream`, `degree type`), technical skills, programming languages, projects, internships, certifications, aptitude, and target role in MongoDB Atlas.
- **Multi-Step Employability Assessment & ONNX Prediction**: Maps supported assessment inputs to the exact 15-element standardized feature vector (`float32[1, 15]`) used during Python training, runs `employability_model.onnx` in WebAssembly, and stores predictions with strengths, gaps, feature attributions, and cohort disclaimers.
- **Student Analytics Dashboard**: Interactive Recharts visualizations of readiness trajectories, global feature weights, roadmap completion, resume scores, and assessment history.
- **Skill Gap Analysis & Career Recommendation Engine**: Internal catalog of 11 tech career pathways with transparent weighted scoring (`55% skills + 25% interests + 20% academic/coding alignment`).
- **Personalized Learning Roadmap**: Deterministic weekly task generator with persistent status tracking (`Not Started`, `In Progress`, `Completed`).
- **Free Resume Analyzer**: Safe PDF (`unpdf`), DOCX (`mammoth`), and TXT upload validation (extension, MIME, 5 MB cap, magic-byte check) scored against a documented 100-point rubric.
- **Protected Admin Console**: Server-verified administrator analytics showing student count, prediction distribution, common missing required skills, popular roles, assessment trends, and a paginated non-PII student roster.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Zod
- **Backend**: Node.js + Express (`server.ts` / Vercel serverless `api/index.ts`)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: `bcryptjs` + `jsonwebtoken` + `HttpOnly` cookies & Bearer tokens
- **Machine Learning (Training)**: Python 3.11, Pandas, NumPy, scikit-learn, `skl2onnx`, `onnx`
- **Machine Learning (Production Inference)**: `onnxruntime-web` (WASM) in the browser
- **Resume Parsing**: `unpdf` (PDF) and `mammoth` (DOCX)
- **Testing**: Vitest (unit & API integration) and pytest (ML pipeline & ONNX parity)

---

## Dataset & Machine Learning Summary

- **Dataset**: Campus Recruitment Dataset (`Placement_Data_Full_Class.csv`), Kaggle / Ben Roshan D
- **URL**: `https://www.kaggle.com/datasets/benroshan/factors-affecting-campus-placement`
- **License**: CC0 1.0 Public Domain
- **Records**: 215 unique records (`148 Placed`, `67 Not Placed`), zero missing values in modeled features (`salary` excluded to prevent post-outcome target leakage; `gender`, `ssc_b`, `hsc_b` excluded for fairness).
- **Split & Preprocessing**: Stratified 80/20 split (`172 train / 43 test`) performed *before* fitting `StandardScaler` (5 numeric features) and `OneHotEncoder` (4 categorical features -> 15 total transformed inputs).

### Actual Model Evaluation Results (Holdout Test Set, n=43)

| Model | 5-Fold CV ROC-AUC | Test Accuracy | Precision | Recall | F1-Score | Test ROC-AUC |
| --- | --- | --- | --- | --- | --- | --- |
| LogisticRegression | 0.9419 | 88.37% | 1.0000 | 0.8333 | 0.9091 | 0.9410 |
| **RandomForestClassifier (Selected)** | 0.9126 | 86.05% | 0.9286 | 0.8667 | 0.8966 | **0.9462** |
| GradientBoostingClassifier | 0.8827 | 81.40% | 0.8438 | 0.9000 | 0.8710 | 0.8923 |

- **ONNX Validation**: Verified 0 label mismatches across all 43 test samples with max probability delta `6.9355e-07`.

---

## Environment Variables (`.env.example`)

- `MONGODB_URI`: MongoDB Atlas connection string (server-side only; never expose to browser).
- `AUTH_SECRET`: Secret for signing JWT session tokens (uses an ephemeral in-memory random key if omitted locally).
- `ADMIN_PASSCODE`: Server-side passcode to unlock administrator access (if unset, first-run Admin Setup lets the first account claim and hash an initial passcode).
- `APP_URL`: Public application URL.

---

## Local Development & Testing

```bash
npm install
npm run dev       # Starts full-stack Express + Vite server on http://localhost:3000
npm run lint      # TypeScript type-checking
npm test          # Runs Vitest unit & integration suites
npm run build     # Builds production Vite bundle to dist/
```

To reproduce the ML training and ONNX export pipeline:
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install pandas numpy scikit-learn skl2onnx onnx onnxruntime pytest
python ml/scripts/acquire_data.py
python ml/scripts/train_and_evaluate.py
python ml/export/export_onnx.py
pytest ml/tests/test_ml_pipeline.py -v
```

---

## Documentation Index

- `docs/ARCHITECTURE.md` — System & browser ONNX inference architecture
- `docs/DATABASE.md` — MongoDB Atlas collections, schemas, and indexes
- `docs/API.md` — Complete REST endpoint contracts
- `docs/DATASET.md` — Dataset evaluation, provenance, and limitations
- `docs/ML_METHODOLOGY.md` — Preprocessing, training, metrics, and ONNX parity
- `docs/DEPLOYMENT.md` — MongoDB Atlas, GitHub, and Vercel deployment guide
- `docs/VIVA.md` — B.Tech project viva questions and accurate answers
- `docs/UNIVERSITY_REPORT.md` — Final-year academic project report material
