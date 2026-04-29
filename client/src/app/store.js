import { configureStore } from "@reduxjs/toolkit";
import converterReducer from "../features/converter/converterSlice";

export const store = configureStore({
  reducer: {
    convert: converterReducer,
  },
});
