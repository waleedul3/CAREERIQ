# Dataset Selection & Provenance (`CareerIQ`)

## Candidate Evaluation Summary

During Phase 5, three real public datasets were downloaded and inspected:

1. **UCI Machine Learning Repository #697 (`Predict Students' Dropout and Academic Success`)**
   - 4,424 records, CC BY 4.0 license.
   - *Decision*: Excluded as primary placement target because its outcome is `Dropout / Enrolled / Graduate` rather than post-degree job placement or employability.
2. **Students' Employability Dataset (`Student-Employability-Datasets.xlsx`)**
   - 2,982 rows of mock-interview physical/soft-skill scores (`1–5`).
   - *Decision*: Excluded after data quality inspection revealed only **155 unique feature rows** (94.8% exact duplicates across 2,982 records), creating severe train/test leakage risk and lacking academic/experience attributes.
3. **Campus Recruitment Dataset (`Placement_Data_Full_Class.csv`) — SELECTED**
   - **Author / Source**: Ben Roshan D (Kaggle: *Factors Affecting Campus Placement*)
   - **URL**: `https://www.kaggle.com/datasets/benroshan/factors-affecting-campus-placement`
   - **License**: **CC0 1.0 Public Domain**
   - **Records**: **215 unique records** (`0` duplicates, `0` missing values across all input features)
   - **Target Variable**: `status` (`Placed`: 148 [68.8%], `Not Placed`: 67 [31.2%])

## Feature Schema & Exclusions

### Modeled Input Features (9 raw features → 15 transformed float32 inputs)
- `ssc_p` (numeric): Secondary school (10th) percentage
- `hsc_p` (numeric): Higher secondary (12th) percentage
- `hsc_s` (categorical): Higher secondary stream (`Arts`, `Commerce`, `Science`)
- `degree_p` (numeric): Undergraduate degree percentage
- `degree_t` (categorical): Undergraduate discipline (`Comm&Mgmt`, `Others`, `Sci&Tech`)
- `workex` (categorical): Prior work / internship experience (`No`, `Yes`)
- `etest_p` (numeric): Standardized employability / aptitude test percentage
- `specialisation` (categorical): Specialization track (`Mkt&Fin`, `Mkt&HR`)
- `mba_p` (numeric): Core specialization / post-grad percentage

### Excluded Columns (Documented)
- `sl_no`: Serial identifier (non-predictive).
- `salary`: Post-placement salary (missing whenever `Not Placed` — excluded strictly to prevent target leakage).
- `gender`: Protected demographic attribute excluded for ethical fairness.
- `ssc_b`, `hsc_b`: Secondary/higher-secondary school board names excluded to reduce regional institutional bias.

## Limitations

- Small sample size (`n = 215`) limits broad cross-university generalization.
- Original cohort reflects undergraduate + MBA campus recruitment records; engineering students map their core track average to `mba_p` and track category to `specialisation` transparently.
- Class distribution is moderately imbalanced (`68.8% Placed` vs `31.2% Not Placed`), mitigated using `class_weight="balanced"` and evaluating Precision, Recall, F1-score, and ROC-AUC alongside Accuracy.
