# Final-Year B.Tech CSE Project Report Material

**Official Project Title:** *An Intelligent Employability Analytics and Career Readiness Platform Using Machine Learning and Data Analytics*  
**Product Name:** CareerIQ  
**Domain:** Data Analytics & Educational Decision Support

---

## 1. Abstract
CareerIQ is a web-based employability analytics and career readiness platform designed to help final-year engineering students evaluate their placement readiness, identify skill gaps, explore suitable technical roles, follow deterministic learning roadmaps, and review structural resume quality. A Random Forest classifier trained on the public-domain Campus Recruitment dataset (`n = 215`) achieves `0.9462` holdout ROC-AUC (`86.05%` accuracy, `0.8966` F1) and is exported to ONNX for zero-server-cost browser inference via `onnxruntime-web`. Rule-based modules independently handle skill-gap diagnostics, role matching across 11 careers, roadmap task tracking, and PDF/DOCX resume scoring, backed by MongoDB Atlas.

## 2. Problem Statement & Objectives
Students preparing for campus placements lack unified tools that connect academic readiness estimates with concrete skill actions without expensive subscription APIs.  
**Objectives**:
1. Build a reproducible supervised ML pipeline with leakage-free preprocessing and ONNX export.
2. Execute real ML inference directly in the client browser using ONNX Runtime Web.
3. Persist student profiles, assessments, prediction history, roadmap progress, and resume analyses in MongoDB Atlas.
4. Clearly separate ML-derived estimates from transparent rule-based career guidance.

## 3. Existing vs. Proposed System
- **Existing Systems**: Static GPA calculators, opaque black-box scorecards, or fragmented paid resume/job portals.
- **Proposed System (CareerIQ)**: Free-first architecture combining verified scikit-learn → ONNX modeling, transparent feature attribution, deterministic roadmaps, and role-based cohort analytics for university administrators.

## 4. Methodology & Implementation Results
- **Dataset**: Campus Recruitment (`Placement_Data_Full_Class.csv`, CC0 1.0, `215` unique instances).
- **Algorithms**: Logistic Regression (baseline), Random Forest Classifier (selected), Gradient Boosting Classifier.
- **Actual Results (n=43 Holdout)**: `RandomForestClassifier` achieved `0.9462` ROC-AUC (`TP=26, TN=11, FP=2, FN=4`), with ONNX Runtime parity verified at `0` label mismatches (`max Δ = 6.94e-07`).

## 5. Limitations & Future Scope
- **Limitations**: Modest dataset size (`n=215`), cohort domain adaptation (`mba_p` / `specialisation` mapped from undergraduate tracks), and non-causal statistical feature importances.
- **Future Scope**: Multi-institution longitudinal placement datasets, calibrated probability intervals, and campus placement cell ERP integrations.

## 6. References
1. Ben Roshan D., *Campus Recruitment Dataset (Placement_Data_Full_Class.csv)*, Kaggle, CC0 Public Domain.
2. Pedregosa et al., *Scikit-learn: Machine Learning in Python*, JMLR 12, 2011.
3. ONNX & ONNX Runtime Contributors, *Open Neural Network Exchange (ONNX) & onnxruntime-web*.
