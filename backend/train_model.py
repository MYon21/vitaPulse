"""Train a classifier on the synthetic VitaPulse table and save it.

The saved score is the model's estimated probability of the synthetic
heart_disease label. It is not a clinical risk and not a diagnosis.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from schema import CATEGORICAL_COLUMNS, MODEL_FEATURES, NUMERIC_COLUMNS, TARGET

ROOT = Path(__file__).resolve().parent
DEFAULT_DATA = ROOT / "data" / "heart_disease_synthetic.csv"
DEFAULT_MODEL = ROOT / "models" / "heart_disease_model.joblib"
DEFAULT_META = ROOT / "models" / "heart_disease_model.json"


def build_pipeline() -> Pipeline:
    transform = ColumnTransformer(
        transformers=[
            ("number", StandardScaler(), list(NUMERIC_COLUMNS)),
            (
                "category",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                list(CATEGORICAL_COLUMNS),
            ),
        ]
    )
    return Pipeline(
        steps=[
            ("prepare", transform),
            (
                "model",
                LogisticRegression(max_iter=500),
            ),
        ]
    )


def train(frame: pd.DataFrame, seed: int = 7) -> tuple[Pipeline, float]:
    missing = [column for column in (*MODEL_FEATURES, TARGET) if column not in frame.columns]
    if missing:
        raise ValueError(f"Training table is missing columns: {', '.join(missing)}")

    features = frame.loc[:, list(MODEL_FEATURES)]
    labels = frame[TARGET].astype(int)
    train_x, test_x, train_y, test_y = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=seed,
        stratify=labels,
    )
    pipeline = build_pipeline()
    pipeline.fit(train_x, train_y)
    held_out = pipeline.predict_proba(test_x)[:, 1]
    auc = float(roc_auc_score(test_y, held_out))
    return pipeline, auc


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the synthetic heart-disease model.")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    parser.add_argument("--seed", type=int, default=7)
    args = parser.parse_args()

    frame = pd.read_csv(args.data)
    pipeline, auc = train(frame, args.seed)
    args.model.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, args.model)
    meta = {
        "features": list(MODEL_FEATURES),
        "target": TARGET,
        "score": "predict_proba for heart_disease, between 0 and 1",
        "held_out_roc_auc": round(auc, 4),
        "rows": int(len(frame)),
        "disclaimer": "Trained only on synthetic rows. Not a clinical model and not a diagnosis.",
    }
    DEFAULT_META.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"Saved model to {args.model}")
    print(f"Held-out ROC AUC on synthetic data: {auc:.3f}")


if __name__ == "__main__":
    main()
