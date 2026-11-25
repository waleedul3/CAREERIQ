"""Train, cross-validate, evaluate, and compare supervised ML models for CareerIQ."""

import json
from datetime import datetime, timezone
from pathlib import Path
import sys
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split

ML_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = ML_DIR.parent
sys.path.insert(0, str(ML_DIR))

from preprocessing.pipeline import (  # noqa: E402
    build_preprocessor,
    extract_preprocessing_spec,
    get_transformed_feature_names,
    load_and_clean_dataset,
)
from scripts.acquire_data import acquire_dataset  # noqa: E402

RANDOM_STATE = 42


def evaluate_binary_classifier(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    cm = confusion_matrix(y_true, y_pred)
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "rocAuc": round(float(roc_auc_score(y_true, y_prob)), 4),
        "confusionMatrix": {
            "tn": int(cm[0, 0]),
            "fp": int(cm[0, 1]),
            "fn": int(cm[1, 0]),
            "tp": int(cm[1, 1]),
        },
    }


def extract_feature_importances(model, feature_names):
    if hasattr(model, "feature_importances_"):
        raw = model.feature_importances_
    elif hasattr(model, "coef_"):
        raw = np.abs(model.coef_[0])
        raw = raw / raw.sum() if raw.sum() > 0 else raw
    else:
        return []

    items = [
        {"feature": name, "importance": round(float(val), 4)}
        for name, val in zip(feature_names, raw)
    ]
    items.sort(key=lambda item: item["importance"], reverse=True)
    return items


def run_training() -> dict:
    dataset_path = acquire_dataset()
    cleaned = load_and_clean_dataset(str(dataset_path))

    # Split BEFORE fitting preprocessing transformations to prevent data leakage
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        cleaned.X,
        cleaned.y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=cleaned.y,
    )

    preprocessor = build_preprocessor()
    X_train = preprocessor.fit_transform(X_train_raw).astype(np.float32)
    X_test = preprocessor.transform(X_test_raw).astype(np.float32)
    feature_names = get_transformed_feature_names(preprocessor)

    candidates = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            random_state=RANDOM_STATE,
            class_weight="balanced",
        ),
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            min_samples_leaf=3,
            random_state=RANDOM_STATE,
            class_weight="balanced",
        ),
        "GradientBoostingClassifier": GradientBoostingClassifier(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.05,
            random_state=RANDOM_STATE,
        ),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    results = {}
    fitted_models = {}

    for name, clf in candidates.items():
        # Run CV using a fresh pipeline per fold via raw X_train_raw? Fit on pre-scaled?
        # Even cleaner: run CV with Pipeline on X_train_raw so each fold fits its own scaler
        from sklearn.pipeline import Pipeline

        cv_pipe = Pipeline([("pre", build_preprocessor()), ("clf", clf)])
        cv_scores = cross_validate(
            cv_pipe,
            X_train_raw,
            y_train,
            cv=cv,
            scoring=["accuracy", "precision", "recall", "f1", "roc_auc"],
        )

        # Fit final candidate on full training split
        clf.fit(X_train, y_train)
        fitted_models[name] = clf

        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1]
        holdout_metrics = evaluate_binary_classifier(y_test, y_pred, y_prob)

        results[name] = {
            "cv5Fold": {
                "accuracyMean": round(float(cv_scores["test_accuracy"].mean()), 4),
                "accuracyStd": round(float(cv_scores["test_accuracy"].std()), 4),
                "f1Mean": round(float(cv_scores["test_f1"].mean()), 4),
                "rocAucMean": round(float(cv_scores["test_roc_auc"].mean()), 4),
            },
            "holdoutTest": holdout_metrics,
            "featureImportances": extract_feature_importances(clf, feature_names),
        }

    # Select best model primarily by holdout ROC-AUC (with RandomForest preferred for non-linear ties)
    selected_name = max(
        results.keys(),
        key=lambda m: (
            results[m]["holdoutTest"]["rocAuc"],
            results[m]["holdoutTest"]["f1"],
            1 if m == "RandomForestClassifier" else 0,
        ),
    )

    models_dir = ML_DIR / "models"
    eval_dir = ML_DIR / "evaluation"
    public_models_dir = ROOT_DIR / "public" / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    eval_dir.mkdir(parents=True, exist_ok=True)
    public_models_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "model_name": selected_name,
            "classifier": fitted_models[selected_name],
            "preprocessor": preprocessor,
            "X_test": X_test,
            "y_test": y_test,
            "X_test_raw": X_test_raw,
        },
        models_dir / "selected_bundle.joblib",
    )

    preprocessing_spec = extract_preprocessing_spec(preprocessor)
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "dataset": {
            "name": "Campus Recruitment Dataset (Placement_Data_Full_Class.csv)",
            "source": "Kaggle / Ben Roshan D",
            "sourceUrl": "https://www.kaggle.com/datasets/benroshan/factors-affecting-campus-placement",
            "license": "CC0 1.0 Public Domain",
            "rawRows": cleaned.raw_rows,
            "cleanedRows": cleaned.cleaned_rows,
            "duplicatesRemoved": cleaned.duplicates_removed,
            "trainRows": int(len(X_train_raw)),
            "testRows": int(len(X_test_raw)),
            "classDistribution": {
                "Placed": int(cleaned.y.sum()),
                "NotPlaced": int((1 - cleaned.y).sum()),
            },
        },
        "selectedModel": selected_name,
        "selectionRationale": (
            f"{selected_name} achieved the highest holdout ROC-AUC "
            f"({results[selected_name]['holdoutTest']['rocAuc']}) on the stratified test split "
            "while capturing non-linear interactions across academic scores, employability test performance, and work experience."
        ),
        "models": results,
        "preprocessing": preprocessing_spec,
        "limitations": [
            "Trained on n=215 campus recruitment records; small sample size limits generalization across diverse institutions.",
            "Original cohort includes undergraduate plus MBA specialization tracks; engineering undergraduate inputs map academic averages and core track percentage to the trained feature schema.",
            "Predicted probabilities represent statistical similarity to historical cohort placement outcomes, not an employment guarantee.",
        ],
    }

    (eval_dir / "metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (public_models_dir / "model_metadata.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )

    print(f"Selected model: {selected_name}")
    for name, data in results.items():
        h = data["holdoutTest"]
        print(
            f"  {name}: Test Acc={h['accuracy']}, Prec={h['precision']}, "
            f"Rec={h['recall']}, F1={h['f1']}, ROC-AUC={h['rocAuc']}"
        )

    return report


if __name__ == "__main__":
    run_training()
