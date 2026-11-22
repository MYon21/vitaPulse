export type EvidenceStat = {
  id: string;
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  detail: string;
  source: string;
};

export type EvidenceBar = {
  id: string;
  label: string;
  value: number;
  definition: string;
  source: string;
};

export const evidenceStats: EvidenceStat[] = [
  {
    id: "deaths",
    value: 17.9,
    decimals: 1,
    suffix: "M",
    label: "Deaths each year",
    detail: "Estimated cardiovascular deaths worldwide.",
    source: "World Health Organization cardiovascular diseases fact sheet.",
  },
  {
    id: "interval",
    value: 33,
    decimals: 0,
    suffix: "s",
    label: "One death every 33 seconds",
    detail: "Published U.S. interval between cardiovascular deaths.",
    source: "U.S. Centers for Disease Control and Prevention, Heart Disease Facts.",
  },
  {
    id: "pressure",
    value: 47.7,
    decimals: 1,
    suffix: "%",
    label: "U.S. adults with hypertension",
    detail: "Measured high blood pressure or blood-pressure medication.",
    source: "NCHS Data Brief 511, NHANES, August 2021–August 2023.",
  },
  {
    id: "prevent",
    value: 80,
    decimals: 0,
    suffix: "%",
    label: "Premature cases considered preventable",
    detail: "WHO estimate for premature heart disease and stroke.",
    source: "World Health Organization, cardiovascular disease prevention statements.",
  },
];

export const evidenceBars: EvidenceBar[] = [
  {
    id: "pressure",
    label: "High blood pressure",
    value: 47.7,
    definition: "Adults age 18+ with measured hypertension, August 2021–August 2023.",
    source: "NCHS Data Brief 511",
  },
  {
    id: "obesity",
    label: "Obesity",
    value: 40.3,
    definition: "Adults age 20+ with obesity, a BMI of 30 or higher, August 2021–August 2023.",
    source: "NCHS Data Brief 508",
  },
  {
    id: "drugs",
    label: "Illicit drug use",
    value: 23.5,
    definition: "Adults age 26+ with any illicit drug use in the past year, 2025.",
    source: "NSDUH 2025",
  },
  {
    id: "sugar",
    label: "Total diabetes",
    value: 15.8,
    definition: "Adults with diagnosed or undiagnosed diabetes, August 2021–August 2023.",
    source: "NCHS Data Brief 516",
  },
  {
    id: "smoking",
    label: "Cigarette smoking",
    value: 9.1,
    definition: "Adults age 18+ who currently smoke cigarettes, full-year 2025 early release.",
    source: "NCHS, National Health Interview Survey",
  },
  {
    id: "alcohol",
    label: "Heavy alcohol use",
    value: 5.3,
    definition: "Adults age 26+ with heavy alcohol use in the past month, 2025.",
    source: "NSDUH 2025",
  },
];

export const evidenceNote =
  "These bars come from different surveys, years, and age groups. They describe separate public figures. They are not one comparable risk model.";
