"""Build a synthetic heart-disease table that matches the VitaPulse form.

The heart_disease column is drawn from an invented logistic process so a
model has a pattern to learn. The weights are not a clinical equation, and
the rows are not real patients.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from schema import BMI_CATEGORY, TARGET

ROOT = Path(__file__).resolve().parent
DEFAULT_PATH = ROOT / "data" / "heart_disease_synthetic.csv"


def bmi_category(bmi: np.ndarray) -> np.ndarray:
    labels = np.empty(bmi.shape, dtype=object)
    labels[bmi < 18.5] = "underweight"
    labels[(bmi >= 18.5) & (bmi < 25)] = "healthy"
    labels[(bmi >= 25) & (bmi < 30)] = "overweight"
    labels[bmi >= 30] = "obesity"
    return labels


def _sigmoid(values: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-values))


def generate(n: int = 10000, seed: int = 7) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    age = np.clip(rng.normal(52, 16, n), 18, 100).round().astype(int)
    sex = rng.choice(["female", "male"], size=n, p=[0.52, 0.48])

    bmi = np.clip(rng.normal(27, 5.4, n) + 0.03 * (age - 50), 16, 48).round(1)
    category = bmi_category(bmi)

    family_history = rng.choice(["yes", "no", "unknown"], size=n, p=[0.24, 0.66, 0.10])
    alcohol = rng.choice(["none", "occasional", "frequent"], size=n, p=[0.42, 0.44, 0.14])
    smoking = rng.choice(["never", "former", "current"], size=n, p=[0.62, 0.24, 0.14])
    drug_use = rng.choice(["none", "past", "current"], size=n, p=[0.74, 0.18, 0.08])

    systolic = np.clip(
        rng.normal(118, 15, n) + 0.38 * (age - 50) + 0.45 * (bmi - 25),
        70,
        250,
    ).round().astype(int)
    diastolic = np.clip(
        rng.normal(76, 9, n) + 0.12 * (age - 50) + 0.18 * (bmi - 25),
        40,
        150,
    ).round().astype(int)
    too_high = diastolic >= systolic
    diastolic[too_high] = np.maximum(40, systolic[too_high] - rng.integers(8, 25, too_high.sum()))

    glucose = np.clip(
        rng.normal(96, 20, n) + 0.55 * (bmi - 25) + np.where(age >= 60, 8, 0),
        40,
        400,
    ).round().astype(int)

    # Invented log-odds. Directions follow widely described risk patterns.
    # Magnitudes exist only so this synthetic label is learnable.
    logit = (
        -3.15
        + 0.042 * (age - 45)
        + np.where(sex == "male", 0.32, 0.0)
        + np.where(systolic >= 160, 1.15, np.where(systolic >= 140, 0.72, np.where(systolic >= 130, 0.32, 0.0)))
        + np.where(diastolic >= 100, 0.45, np.where(diastolic >= 90, 0.25, 0.0))
        + np.where(glucose >= 180, 0.95, np.where(glucose >= 126, 0.62, np.where(glucose >= 100, 0.22, 0.0)))
        + np.select(
            [category == "underweight", category == "overweight", category == "obesity"],
            [-0.05, 0.28, 0.72],
            default=0.0,
        )
        + np.select([family_history == "yes", family_history == "unknown"], [0.55, 0.12], default=0.0)
        + np.select([alcohol == "occasional", alcohol == "frequent"], [0.08, 0.42], default=0.0)
        + np.select([smoking == "former", smoking == "current"], [0.22, 0.78], default=0.0)
        + np.select([drug_use == "past", drug_use == "current"], [0.18, 0.55], default=0.0)
        + rng.normal(0, 0.55, n)
    )
    probability = _sigmoid(logit)
    heart_disease = rng.binomial(1, probability)

    frame = pd.DataFrame(
        {
            "sex": sex,
            "age": age,
            "bmi": bmi,
            "bmi_category": category,
            "family_history": family_history,
            "alcohol": alcohol,
            "smoking": smoking,
            "drug_use": drug_use,
            "systolic": systolic,
            "diastolic": diastolic,
            "glucose": glucose,
            TARGET: heart_disease,
        }
    )
    unknown = ~frame["bmi_category"].isin(BMI_CATEGORY)
    if unknown.any():
        raise RuntimeError("BMI category fell outside the form options.")
    return frame


def main() -> None:
    parser = argparse.ArgumentParser(description="Write the synthetic VitaPulse heart-disease CSV.")
    parser.add_argument("--rows", type=int, default=10000)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--out", type=Path, default=DEFAULT_PATH)
    args = parser.parse_args()

    frame = generate(args.rows, args.seed)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(args.out, index=False)
    rate = frame[TARGET].mean()
    print(f"Wrote {len(frame)} synthetic rows to {args.out}")
    print(f"Synthetic heart_disease rate: {rate:.3f}")


if __name__ == "__main__":
    main()
