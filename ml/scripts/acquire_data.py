"""Reproducible dataset acquisition script for CareerIQ.

Downloads the public-domain Campus Recruitment dataset (Placement_Data_Full_Class.csv)
originally published by Ben Roshan D under CC0 1.0 Public Domain license, and verifies
row count, required columns, and file integrity.
"""

from pathlib import Path
import hashlib
import urllib.request
import pandas as pd

DATASET_URL = (
    "https://raw.githubusercontent.com/gouravkhator/"
    "Student-Placement-Prediction/master/Placement_Data_Full_Class.csv"
)
ML_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = ML_DIR / "dataset" / "Placement_Data_Full_Class.csv"

EXPECTED_COLUMNS = [
    "sl_no",
    "gender",
    "ssc_p",
    "ssc_b",
    "hsc_p",
    "hsc_b",
    "hsc_s",
    "degree_p",
    "degree_t",
    "workex",
    "etest_p",
    "specialisation",
    "mba_p",
    "status",
    "salary",
]


def acquire_dataset(force: bool = False) -> Path:
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATASET_PATH.exists() or force:
        urllib.request.urlretrieve(DATASET_URL, DATASET_PATH)

    df = pd.read_csv(DATASET_PATH)
    if list(df.columns) != EXPECTED_COLUMNS:
        raise ValueError(f"Unexpected columns: {list(df.columns)}")
    if len(df) != 215:
        raise ValueError(f"Expected 215 rows, found {len(df)}")

    sha256 = hashlib.sha256(DATASET_PATH.read_bytes()).hexdigest()
    print(f"Dataset ready: {DATASET_PATH}")
    print(f"Rows: {len(df)}, Columns: {len(df.columns)}, SHA-256: {sha256}")
    return DATASET_PATH


if __name__ == "__main__":
    acquire_dataset()
