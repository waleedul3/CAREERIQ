"""Canonical preprocessing pipeline and feature schema for CareerIQ.

Maintains strict parity between Python training and TypeScript ONNX Runtime Web
browser inference by exporting deterministic scaling and encoding parameters.
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERIC_FEATURES: List[str] = [
    "ssc_p",
    "hsc_p",
    "degree_p",
    "etest_p",
    "mba_p",
]

CATEGORICAL_FEATURES: List[str] = [
    "hsc_s",
    "degree_t",
    "workex",
    "specialisation",
]

FEATURE_COLUMNS: List[str] = NUMERIC_FEATURES + CATEGORICAL_FEATURES

EXCLUDED_COLUMNS: Dict[str, str] = {
    "sl_no": "Identifier column with zero predictive semantics",
    "salary": "Post-placement outcome variable (null when Not Placed; target leakage)",
    "gender": "Protected demographic attribute excluded for ethical fairness",
    "ssc_b": "Secondary education board excluded to avoid regional/institutional bias",
    "hsc_b": "Higher secondary education board excluded to avoid regional/institutional bias",
}

TARGET_COLUMN = "status"
POSITIVE_LABEL = "Placed"

CATEGORICAL_CATEGORIES: List[List[str]] = [
    ["Arts", "Commerce", "Science"],
    ["Comm&Mgmt", "Others", "Sci&Tech"],
    ["No", "Yes"],
    ["Mkt&Fin", "Mkt&HR"],
]


@dataclass
class CleanedDataset:
    X: pd.DataFrame
    y: np.ndarray
    raw_rows: int
    cleaned_rows: int
    duplicates_removed: int


def load_and_clean_dataset(csv_path: str) -> CleanedDataset:
    df = pd.read_csv(csv_path)
    raw_rows = len(df)

    # Remove exact duplicate profiles excluding sl_no if any exist
    dedup_cols = [c for c in df.columns if c != "sl_no"]
    df = df.drop_duplicates(subset=dedup_cols).reset_index(drop=True)
    cleaned_rows = len(df)

    # Validate no missing values in model input features or target
    missing = df[FEATURE_COLUMNS + [TARGET_COLUMN]].isnull().sum()
    if int(missing.sum()) > 0:
        raise ValueError(f"Unexpected missing values in model columns: {missing.to_dict()}")

    # Clamp percentage fields defensively to [0, 100]
    for col in NUMERIC_FEATURES:
        df[col] = df[col].astype(float).clip(0.0, 100.0)

    X = df[FEATURE_COLUMNS].copy()
    y = (df[TARGET_COLUMN] == POSITIVE_LABEL).astype(int).to_numpy()

    return CleanedDataset(
        X=X,
        y=y,
        raw_rows=raw_rows,
        cleaned_rows=cleaned_rows,
        duplicates_removed=raw_rows - cleaned_rows,
    )


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(
                    categories=CATEGORICAL_CATEGORIES,
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                CATEGORICAL_FEATURES,
            ),
        ],
        remainder="drop",
    )


def get_transformed_feature_names(preprocessor: ColumnTransformer) -> List[str]:
    names: List[str] = list(NUMERIC_FEATURES)
    encoder: OneHotEncoder = preprocessor.named_transformers_["cat"]
    for col, cats in zip(CATEGORICAL_FEATURES, encoder.categories_):
        for cat in cats:
            names.append(f"{col}={cat}")
    return names


def extract_preprocessing_spec(preprocessor: ColumnTransformer) -> dict:
    scaler: StandardScaler = preprocessor.named_transformers_["num"]
    encoder: OneHotEncoder = preprocessor.named_transformers_["cat"]
    return {
        "schemaVersion": "1.0.0",
        "numericFeatures": [
            {
                "name": col,
                "mean": float(mean),
                "scale": float(scale),
            }
            for col, mean, scale in zip(NUMERIC_FEATURES, scaler.mean_, scaler.scale_)
        ],
        "categoricalFeatures": [
            {
                "name": col,
                "categories": [str(c) for c in cats],
            }
            for col, cats in zip(CATEGORICAL_FEATURES, encoder.categories_)
        ],
        "transformedFeatureNames": get_transformed_feature_names(preprocessor),
        "inputVectorLength": len(get_transformed_feature_names(preprocessor)),
        "excludedColumns": EXCLUDED_COLUMNS,
    }
