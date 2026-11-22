"""Score one VitaPulse form submission with the trained synthetic model.

Example:
    python predict.py --json "{\"sex\":\"female\",\"age\":56,\"bmiCategory\":\"obesity\",\"familyHistory\":\"no\",\"alcohol\":\"occasional\",\"smoking\":\"never\",\"drugUse\":\"past\",\"systolic\":128,\"diastolic\":82,\"sugar\":104}"
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd

from schema import (
    ALCOHOL,
    ALCOHOL_ALIASES,
    BMI_CATEGORY,
    BMI_CATEGORY_MIDPOINT,
    DRUG_USE,
    DRUG_USE_ALIASES,
    FAMILY_HISTORY,
    FORM_KEYS,
    MODEL_FEATURES,
    NUMERIC_RANGES,
    SEX,
    SMOKING,
)

ROOT = Path(__file__).resolve().parent
DEFAULT_MODEL = ROOT / "models" / "heart_disease_model.joblib"
_PIPELINES: dict[str, object] = {}

CHOICES = {
    "sex": SEX,
    "bmi_category": BMI_CATEGORY,
    "family_history": FAMILY_HISTORY,
    "alcohol": ALCOHOL,
    "smoking": SMOKING,
    "drug_use": DRUG_USE,
}


def _normalize(raw: dict) -> dict:
    person: dict = {}
    for key, value in raw.items():
        column = FORM_KEYS.get(key)
        if column is None or value is None or value == "":
            continue
        person[column] = value

    if "alcohol" in person:
        person["alcohol"] = ALCOHOL_ALIASES.get(str(person["alcohol"]), person["alcohol"])
    if "drug_use" in person:
        person["drug_use"] = DRUG_USE_ALIASES.get(str(person["drug_use"]), person["drug_use"])

    errors: list[str] = []
    for column, options in CHOICES.items():
        value = person.get(column)
        if value not in options:
            errors.append(f"{column} must be one of: {', '.join(options)}")

    for column, (low, high) in NUMERIC_RANGES.items():
        try:
            number = int(person[column])
        except (KeyError, TypeError, ValueError):
            errors.append(f"{column} must be an integer from {low} to {high}")
            continue
        if number < low or number > high:
            errors.append(f"{column} must be from {low} to {high}")
        person[column] = number

    if "systolic" in person and "diastolic" in person and person["diastolic"] >= person["systolic"]:
        errors.append("diastolic must be lower than systolic")

    bmi = person.get("bmi")
    if bmi in (None, ""):
        category = person.get("bmi_category")
        person["bmi"] = BMI_CATEGORY_MIDPOINT.get(category)
    else:
        try:
            person["bmi"] = float(bmi)
        except (TypeError, ValueError):
            errors.append("bmi must be a number")
        else:
            if not 10 <= person["bmi"] <= 80:
                errors.append("bmi must be from 10 to 80")

    if errors:
        raise ValueError("; ".join(errors))
    return person


def load_model(model_path: Path = DEFAULT_MODEL):
    """Load the trained pipeline once and reuse it."""
    if not model_path.exists():
        raise FileNotFoundError(f"Train the model first. Missing {model_path}")
    key = str(model_path.resolve())
    pipeline = _PIPELINES.get(key)
    if pipeline is None:
        pipeline = joblib.load(model_path)
        _PIPELINES[key] = pipeline
    return pipeline


def score_person(raw: dict, model_path: Path = DEFAULT_MODEL) -> float:
    """Return the synthetic model's probability, from 0 to 1."""
    person = _normalize(raw)
    frame = pd.DataFrame([{feature: person[feature] for feature in MODEL_FEATURES}])
    pipeline = load_model(model_path)
    probability = float(pipeline.predict_proba(frame)[0, 1])
    return max(0.0, min(1.0, probability))


def main() -> None:
    parser = argparse.ArgumentParser(description="Score one form submission from 0 to 1.")
    parser.add_argument("--json", required=True, help="Form fields as a JSON object.")
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    args = parser.parse_args()
    raw = json.loads(args.json)
    probability = score_person(raw, args.model)
    print(json.dumps({"score": round(probability, 4), "source": "synthetic model, not a diagnosis"}))


if __name__ == "__main__":
    main()
