import { configureStore } from "@reduxjs/toolkit";
import landingReducer from "./landingSlice";
import readingReducer from "./readingSlice";
import challengeReducer from "./challengeSlice";
import heartRiskReducer from "./heartRiskSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      landing: landingReducer,
      reading: readingReducer,
      heartRisk: heartRiskReducer,
      challenge: challengeReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
