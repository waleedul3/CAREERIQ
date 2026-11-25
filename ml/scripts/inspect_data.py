"""Dataset inspection and exploratory summary script for CareerIQ."""

from pathlib import Path
import json
import sys
import pandas as pd

ML_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_DIR))

from preprocessing.pipeline import EXCLUDED_COLUMNS, FEATURE_COLUMNS, TARGET_COLUMN
from scripts.acquire_data import acquire_dataset


def inspect_dataset() -> dict:
    path = acquire_dataset()
    df = pd.read_csv(path)

    dedup_cols = [c for c in df.columns if c != "sl_no"]
    unique_rows = int(df.drop_duplicates(subset=dedup_cols).shape[0])

    summary = {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "uniqueRowsExcludingId": unique_rows,
        "missingValuesByColumn": {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
        "targetDistribution": {str(k): int(v) for k, v in df[TARGET_COLUMN].value_counts().to_dict().items()},
        "numericSummary": df[["ssc_p", "hsc_p", "degree_p", "etest_p", "mba_p"]].describe().round(2).to_dict(),
        "categoricalCounts": {
            col: {str(k): int(v) for k, v in df[col].value_counts().to_dict().items()}
            for col in ["hsc_s", "degree_t", "workex", "specialisation"]
        },
        "modeledFeatures": FEATURE_COLUMNS,
        "excludedColumns": EXCLUDED_COLUMNS,
    }
    print(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    inspect_dataset()
