# Machine Learning Methodology & ONNX Export (`CareerIQ`)

## Preprocessing Pipeline (`ml/preprocessing/pipeline.py`)

1. **Duplicate & Missing Check**: Verified `215/215` unique rows and `0` missing values in all modeled columns.
2. **Leakage Prevention**: Performed stratified `80/20` train/test split (`172 train / 43 test`, `random_state=42`, `stratify=y`) **before** fitting `StandardScaler` and `OneHotEncoder`.
3. **Feature Vector Schema**:
   - Numeric features (`ssc_p`, `hsc_p`, `degree_p`, `etest_p`, `mba_p`) standardized using training-split mean and standard deviation.
   - Categorical features (`hsc_s`, `degree_t`, `workex`, `specialisation`) one-hot encoded with explicit fixed category ordering (`15` total `float32` inputs).

## Training & Evaluation (`ml/scripts/train_and_evaluate.py`)

Three classifiers were evaluated using 5-fold Stratified Cross-Validation on the training split and evaluated once on the held-out `n=43` test split:

| Model | 5-Fold CV Acc | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Test Acc | Precision | Recall | F1-Score | Test ROC-AUC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `LogisticRegression` (balanced) | 0.8597 | 0.8903 | 0.9419 | 0.8837 | 1.0000 | 0.8333 | 0.9091 | 0.9410 |
| `RandomForestClassifier` (200 trees, depth 6, balanced) | 0.8313 | 0.8702 | 0.9126 | 0.8605 | 0.9286 | 0.8667 | 0.8966 | **0.9462** |
| `GradientBoostingClassifier` (100 trees, depth 3) | 0.8195 | 0.8690 | 0.8827 | 0.8140 | 0.8438 | 0.9000 | 0.8710 | 0.8923 |

### Holdout Confusion Matrix (`RandomForestClassifier`, n=43)
- True Negatives (`Not Placed` correctly predicted): `11`
- False Positives: `2`
- False Negatives: `4`
- True Positives (`Placed` correctly predicted): `26`

### Top Gini Feature Importances (`RandomForestClassifier`)
1. `ssc_p`: `0.2915`
2. `degree_p`: `0.2354`
3. `hsc_p`: `0.1572`
4. `mba_p`: `0.0989`
5. `etest_p`: `0.0620`
6. `workex=Yes` (`0.0324`) + `workex=No` (`0.0284`) = `0.0608`

*Note*: Feature importances measure split impurity reduction within the historical sample—they do **not** establish causal proof.

## ONNX Export & Numerical Parity (`ml/export/export_onnx.py`)

- Exported via `skl2onnx` (`target_opset=15`, `zipmap=False`) to `public/models/employability_model.onnx`.
- Verified with `onnx.checker.check_model` and `onnxruntime`:
  - `testSamplesChecked`: `43`
  - `labelMismatches`: `0`
  - `maxProbabilityDelta`: `6.9355e-07` (`< 1e-4` tolerance)
- Browser execution uses `onnxruntime-web` (`wasmPaths = '/ort/'`, `numThreads = 1`) in `src/lib/onnxInference.ts` with identical TypeScript preprocessing (`src/lib/mlPreprocessing.ts`).
