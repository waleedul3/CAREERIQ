# CareerIQ Machine Learning Pipeline

Reproducible dataset acquisition, preprocessing, supervised model training, evaluation, and ONNX export for **CareerIQ**.

## Directory Layout

- `dataset/` — Raw public-domain CSV (`Placement_Data_Full_Class.csv`) and dataset provenance documentation.
- `preprocessing/` — Canonical `ColumnTransformer` schema (`StandardScaler` + `OneHotEncoder`) and exported deterministic feature spec.
- `scripts/` — Acquisition (`acquire_data.py`), exploratory inspection (`inspect_data.py`), and training/evaluation (`train_and_evaluate.py`).
- `models/` — Serialized scikit-learn artifact (`selected_bundle.joblib`).
- `evaluation/` — Actual CV and holdout test metrics (`metrics.json`).
- `export/` — ONNX Runtime export (`export_onnx.py`), exported `.onnx` model, and parity verification report (`onnx_validation.json`).
- `tests/` — Pytest verification (`test_ml_pipeline.py`).

## Reproduction Steps

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install pandas numpy scikit-learn skl2onnx onnx onnxruntime pytest

python ml/scripts/acquire_data.py
python ml/scripts/inspect_data.py
python ml/scripts/train_and_evaluate.py
python ml/export/export_onnx.py
pytest ml/tests/test_ml_pipeline.py -v
```

Generated browser artifacts are copied directly to:
- `public/models/employability_model.onnx`
- `public/models/model_metadata.json`
