import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunk for handling the file conversion
export const convertImage = createAsyncThunk(
  "convert/convertImage",
  async ({ file, format }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      const response = await api.post("/files/convert", formData, {
        // CRITICAL: Tells Axios to handle the binary file properly
        responseType: "blob",
        // Override content-type for this specific request
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Attempt to extract the filename from the Content-Disposition header
      const disposition = response.headers["content-disposition"];
      let filename = `converted_image.${format}`;

      if (disposition && disposition.indexOf("attachment") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition,
        );
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Create a local URL representing the blob data
      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));

      return { url: fileUrl, filename };
    } catch (error) {
      // If the backend sends a JSON error even on a blob endpoint, we need to read it
      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        return rejectWithValue(json.message || "Conversion failed");
      }
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  },
);

const convertSlice = createSlice({
  name: "convert",
  initialState: {
    isLoading: false,
    error: null,
  },
  reducers: {
    resetConvertState: (state) => {
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(convertImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(convertImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetConvertState } = convertSlice.actions;
export default convertSlice.reducer;
