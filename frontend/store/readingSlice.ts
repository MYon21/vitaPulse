import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assess, type ReadingInput, type ReadingResult } from "@/lib/assess";

type ReadingState = {
  status: "idle" | "reading" | "ready";
  result: ReadingResult | null;
};

const initialState: ReadingState = {
  status: "idle",
  result: null,
};

export const runReading = createAsyncThunk("reading/run", async (input: ReadingInput) => {
  await new Promise((resolve) => setTimeout(resolve, 2400));
  return assess(input);
});

const readingSlice = createSlice({
  name: "reading",
  initialState,
  reducers: {
    resetReading(state) {
      state.status = "idle";
      state.result = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(runReading.pending, (state) => {
        state.status = "reading";
        state.result = null;
      })
      .addCase(runReading.fulfilled, (state, action) => {
        state.status = "ready";
        state.result = action.payload;
      })
      .addCase(runReading.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const { resetReading } = readingSlice.actions;
export default readingSlice.reducer;
