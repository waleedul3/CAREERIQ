"""Export selected scikit-learn model to ONNX and verify Python vs ONNX Runtime parity."""

import json
from pathlib import Path
import sys
import joblib
import numpy as np
import onnx
import onnxruntime as ort
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

ML_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = ML_DIR.parent
sys.path.insert(0, str(ML_DIR))


def export_and_validate_onnx() -> dict:
    bundle_path = ML_DIR / "models" / "selected_bundle.joblib"
    if not bundle_path.exists():
        raise FileNotFoundError(
            "selected_bundle.joblib not found. Run train_and_evaluate.py first."
        )

    bundle = joblib.load(bundle_path)
    clf = bundle["classifier"]
    X_test: np.ndarray = bundle["X_test"]
    model_name: str = bundle["model_name"]
    n_features = X_test.shape[1]

    initial_type = [("float_input", FloatTensorType([None, n_features]))]
    onnx_model = convert_sklearn(
        clf,
        initial_types=initial_type,
        target_opset=15,
        options={id(clf): {"zipmap": False}},
    )

    onnx.checker.check_model(onnx_model)

    public_onnx_path = ROOT_DIR / "public" / "models" / "employability_model.onnx"
    ml_export_path = ML_DIR / "export" / "employability_model.onnx"
    public_onnx_path.parent.mkdir(parents=True, exist_ok=True)
    ml_export_path.parent.mkdir(parents=True, exist_ok=True)

    serialized = onnx_model.SerializeToString()
    public_onnx_path.write_bytes(serialized)
    ml_export_path.write_bytes(serialized)

    # Validate inference parity with onnxruntime
    sess = ort.InferenceSession(str(public_onnx_path), providers=["CPUExecutionProvider"])
    input_name = sess.get_inputs()[0].name
    output_names = [o.name for o in sess.get_outputs()]

    ort_labels, ort_probs = sess.run(output_names, {input_name: X_test.astype(np.float32)})
    sk_labels = clf.predict(X_test)
    sk_probs = clf.predict_proba(X_test)

    max_prob_diff = float(np.max(np.abs(sk_probs - ort_probs)))
    label_mismatches = int(np.sum(sk_labels != ort_labels))

    if label_mismatches > 0 or max_prob_diff > 1e-4:
        raise AssertionError(
            f"ONNX parity check failed! label_mismatches={label_mismatches}, max_prob_diff={max_prob_diff}"
        )

    validation_report = {
        "modelName": model_name,
        "onnxFile": "public/models/employability_model.onnx",
        "opsetVersion": 15,
        "inputName": input_name,
        "inputShape": ["batch", n_features],
        "outputNames": output_names,
        "testSamplesChecked": int(len(X_test)),
        "labelMismatches": label_mismatches,
        "maxProbabilityDelta": max_prob_diff,
        "parityTolerance": 1e-4,
        "status": "PASSED",
    }

    (ML_DIR / "export" / "onnx_validation.json").write_text(
        json.dumps(validation_report, indent=2), encoding="utf-8"
    )
    print("ONNX validation report:", json.dumps(validation_report, indent=2))
    return validation_report


if __name__ == "__main__":
    export_and_validate_onnx()
