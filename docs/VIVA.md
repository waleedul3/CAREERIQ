# CareerIQ — Final-Year B.Tech Viva Preparation Guide

### 1. Why was this project selected and what problem does it solve?
Final-year engineering students often struggle to judge their placement readiness objectively, identify missing role-specific skills, or structure resumes before campus recruitment begins. CareerIQ unifies ML-based readiness estimation, rule-based skill gap analysis, personalized roadmaps, and free resume analysis in one platform.

### 2. What is the difference between Machine Learning and Rule-Based Analytics in CareerIQ?
- **Machine Learning (`RandomForestClassifier` via ONNX)**: Predicts placement readiness probability (`Placed` vs `Not Placed`) strictly from the 9 features supported by the training dataset (`ssc_p`, `hsc_p`, `hsc_s`, `degree_p`, `degree_t`, `workex`, `etest_p`, `specialisation`, `mba_p`).
- **Rule-Based Analytics**: Skill gap coverage, career role matching (11 roles), deterministic learning roadmaps, and the 100-point resume rubric use transparent weighted rules rather than pretending to be ML models.

### 3. Which dataset was used, where did it come from, and what are its limitations?
We selected the **Campus Recruitment Dataset** (`Placement_Data_Full_Class.csv`, Ben Roshan D, Kaggle, **CC0 1.0 Public Domain**, 215 unique records: 148 Placed, 67 Not Placed). Limitation: `n=215` is relatively small and originates from a specific MBA/UG cohort, so outputs are statistical cohort estimates—not employment guarantees.

### 4. What preprocessing steps were performed and how was data leakage prevented?
We excluded `sl_no` (ID), `salary` (post-placement target leakage), and `gender`/`ssc_b`/`hsc_b` (fairness). Crucially, we ran a **stratified 80/20 train/test split before** fitting `StandardScaler` (5 numeric features) and `OneHotEncoder` (4 categorical features → 15 float32 features total).

### 5. Why were Logistic Regression, Random Forest, and Gradient Boosting compared?
- **Logistic Regression** provides an interpretable linear baseline (`88.37%` accuracy, `0.9091` F1, `0.9410` ROC-AUC on holdout).
- **Random Forest Classifier** captures non-linear feature interactions and achieved the highest holdout **ROC-AUC (`0.9462`)** with `86.05%` accuracy, `0.9286` precision, `0.8667` recall, and `0.8966` F1.
- **Gradient Boosting** achieved `81.40%` accuracy and `0.8923` ROC-AUC.
Random Forest was selected for highest ROC-AUC and balanced precision/recall.

### 6. What do Accuracy, Precision, Recall, F1-score, Confusion Matrix, and ROC-AUC mean?
- **Accuracy**: Fraction of all predictions that were correct (`37/43 = 86.05%`).
- **Precision**: Of students predicted `Placed`, how many were actually placed (`26/28 = 92.86%`).
- **Recall**: Of all actually placed students, how many were identified (`26/30 = 86.67%`).
- **F1-Score**: Harmonic mean of Precision and Recall (`0.8966`).
- **Confusion Matrix**: `[[TN=11, FP=2], [FN=4, TP=26]]`.
- **ROC-AUC**: Probability that a randomly chosen `Placed` student receives a higher predicted score than a `Not Placed` student (`0.9462`).

### 7. What is ONNX and why use ONNX Runtime Web in the browser?
**ONNX (Open Neural Network Exchange)** is an open standard format for ML models. Exporting our `scikit-learn` Random Forest via `skl2onnx` and executing it in the browser with `onnxruntime-web` (WebAssembly) eliminates the need for a separate paid Python inference server in production while matching Python `sklearn` outputs within `6.94e-07` probability delta.

### 8. How does authentication and role-based access control (RBAC) work?
Passwords are hashed with `bcryptjs` (12 salt rounds). Sessions use signed `HS256` JWTs stored in `HttpOnly` cookies (plus in-memory Bearer header) with CSRF origin checks. Public registration always forces `role: 'student'`, and all `/api/admin/*` routes enforce `requireAdmin` on the server.
