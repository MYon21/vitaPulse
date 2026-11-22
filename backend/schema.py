"""Fields the VitaPulse form requires, in the words the form uses.

This schema is for a synthetic training set and a demo model.
It is not a clinical risk definition.
"""

from __future__ import annotations

SEX = ("female", "male")
BMI_CATEGORY = ("underweight", "healthy", "overweight", "obesity")
FAMILY_HISTORY = ("yes", "no", "unknown")
ALCOHOL = ("none", "occasional", "frequent")
SMOKING = ("never", "former", "current")
DRUG_USE = ("none", "past", "current")

# App aliases the old demo scorer used. Accepted on input, stored as the form values.
ALCOHOL_ALIASES = {"regular": "frequent"}
DRUG_USE_ALIASES = {"former": "past"}

NUMERIC_RANGES = {
    "age": (18, 100),
    "systolic": (70, 250),
    "diastolic": (40, 150),
    "glucose": (40, 400),
}

# Representative adult BMI used only when the form sends a category and no measured BMI.
BMI_CATEGORY_MIDPOINT = {
    "underweight": 17.5,
    "healthy": 21.7,
    "overweight": 27.5,
    "obesity": 34.0,
}

CATEGORICAL_COLUMNS = (
    "sex",
    "bmi_category",
    "family_history",
    "alcohol",
    "smoking",
    "drug_use",
)

NUMERIC_COLUMNS = ("age", "systolic", "diastolic", "glucose", "bmi")

MODEL_FEATURES = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS

TARGET = "heart_disease"

# JSON keys the React form already uses, mapped onto the training columns.
FORM_KEYS = {
    "sex": "sex",
    "age": "age",
    "bmiCategory": "bmi_category",
    "bmi_category": "bmi_category",
    "bmi": "bmi",
    "bmiValue": "bmi",
    "familyHistory": "family_history",
    "family_history": "family_history",
    "alcohol": "alcohol",
    "smoking": "smoking",
    "drugUse": "drug_use",
    "drug_use": "drug_use",
    "systolic": "systolic",
    "diastolic": "diastolic",
    "sugar": "glucose",
    "glucose": "glucose",
}
