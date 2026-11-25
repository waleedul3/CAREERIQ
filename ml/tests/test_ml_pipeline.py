"""Automated tests for CareerIQ ML pipeline and ONNX export parity."""

import json
from pathlib import Path
import joblib
import numpy as np
import onnxruntime as ort

ML_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = ML_DIR.parent


def test_metrics_and_metadata_exist():
    metrics_path = ML_DIR / "evaluation" / "metrics.json"
    public_meta_path = ROOT_DIR / "public" / "models" / "model_metadata.json"
    assert metrics_path.exists()
    assert public_meta_path.exists()

    data = json.loads(metrics_path.read_text(encoding="utf-8"))
    assert data["dataset"]["cleanedRows"] == 215
    assert data["selectedModel"] in data["models"]
    assert len(data["preprocessing"]["transformedFeatureNames"]) == 15
    assert data["preprocessing"]["inputVectorLength"] == 15


def test_onnx_model_parity():
    onnx_path = ROOT_DIR / "public" / "models" / "employability_model.onnx"
    bundle_path = ML_DIR / "models" / "selected_bundle.joblib"
    assert onnx_path.exists()
    assert bundle_path.exists()

    bundle = joblib.load(bundle_path)
    clf = bundle["classifier"]
    X_test = bundle["X_test"].astype(np.float32)

    sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = sess.get_inputs()[0].name
    ort_labels, ort_probs = sess.run(None, {input_name: X_test})

    sk_labels = clf.predict(X_test)
    sk_probs = clf.predict_proba(X_test)

    assert np.array_equal(sk_labels, ort_labels)
    assert np.max(np.abs(sk_probs - ort_probs)) < 1e-4
