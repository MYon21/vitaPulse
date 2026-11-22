import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SectionId = "signal" | "method" | "evidence";

export type Step = {
  id: string;
  index: string;
  title: string;
  body: string;
  tags: string[];
  panel: "profile" | "vitals" | "prediction";
};

export type Stat = {
  id: string;
  index: string;
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  detail: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

type LandingState = {
  activeSection: SectionId;
  menuOpen: boolean;
  headerCondensed: boolean;
  revealed: {
    method: boolean;
    evidence: boolean;
  };
  steps: Step[];
  stats: Stat[];
  chart: ChartPoint[];
  chartTitle: string;
  chartNote: string;
  source: string;
};

const initialState: LandingState = {
  activeSection: "signal",
  menuOpen: false,
  headerCondensed: false,
  revealed: {
    method: false,
    evidence: false,
  },
  steps: [
    {
      id: "profile",
      index: "01",
      title: "Enter the profile",
      body: "Sex, age, alcohol status, and drug use give the model a person rather than a single lab value. They set the baseline the clinical numbers are read against.",
      tags: ["Sex", "Age", "Alcohol status", "Drug use"],
      panel: "profile",
    },
    {
      id: "vitals",
      index: "02",
      title: "Add the vitals",
      body: "Blood pressure and blood sugar describe force on the arteries and metabolic load. Both are entered in the units a routine checkup already uses.",
      tags: ["Blood pressure", "Blood sugar"],
      panel: "vitals",
    },
    {
      id: "prediction",
      index: "03",
      title: "Receive the prediction",
      body: "All six signals are scored as one pattern. VitaPulse returns a heart-disease risk band and the inputs that moved it, early enough to take into a clinical conversation.",
      tags: ["Six-signal model", "Risk band"],
      panel: "prediction",
    },
  ],
  stats: [
    {
      id: "deaths",
      index: "01",
      value: 17.9,
      decimals: 1,
      suffix: "m",
      label: "Deaths each year",
      detail: "People lost to cardiovascular disease worldwide.",
    },
    {
      id: "interval",
      index: "02",
      value: 33,
      decimals: 0,
      suffix: "s",
      label: "In the United States",
      detail: "Average interval between cardiovascular deaths.",
    },
    {
      id: "pressure",
      index: "03",
      value: 48,
      decimals: 0,
      suffix: "%",
      label: "High blood pressure",
      detail: "Share of U.S. adults living with hypertension.",
    },
    {
      id: "prevent",
      index: "04",
      value: 80,
      decimals: 0,
      suffix: "%",
      label: "Still preventable",
      detail: "Premature heart disease and stroke tied to risks that can change.",
    },
  ],
  chart: [
    { label: "20–39", value: 0.9 },
    { label: "40–49", value: 3.4 },
    { label: "50–59", value: 7.4 },
    { label: "60–69", value: 15.2 },
    { label: "70–79", value: 23.1 },
    { label: "80+", value: 32.4 },
  ],
  chartTitle: "Coronary heart disease by age",
  chartNote: "Illustrative share of U.S. adults",
  source:
    "Death and prevention figures follow World Health Organization cardiovascular summaries. The 33-second interval and the hypertension share follow U.S. CDC public figures. The age curve illustrates the established rise in coronary disease with age. It is not a live clinical dataset.",
};

const landingSlice = createSlice({
  name: "landing",
  initialState,
  reducers: {
    setActiveSection(state, action: PayloadAction<SectionId>) {
      state.activeSection = action.payload;
    },
    setMenuOpen(state, action: PayloadAction<boolean>) {
      state.menuOpen = action.payload;
    },
    setHeaderCondensed(state, action: PayloadAction<boolean>) {
      state.headerCondensed = action.payload;
    },
    reveal(state, action: PayloadAction<"method" | "evidence">) {
      state.revealed[action.payload] = true;
    },
  },
});

export const { setActiveSection, setMenuOpen, setHeaderCondensed, reveal } =
  landingSlice.actions;

export default landingSlice.reducer;
