import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/**
 * Helper: polls GET /files/status/:jobId every 500ms until
 * the job is completed or failed. Dispatches progress updates.
 */
const pollJobStatus = (jobId, dispatch) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/files/status/${jobId}`);

        // Dispatch progress update to redux
        dispatch(
          setConversionProgress({
            progress: data.progress,
            stage: data.stage,
          }),
        );

        if (data.status === "completed") {
          clearInterval(interval);
          resolve(data);
        } else if (data.status === "failed") {
          clearInterval(interval);
          reject(new Error(data.error || "Conversion failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 500);
  });
};

// Async Thunk for handling the full conversion lifecycle
export const convertImage = createAsyncThunk(
  "convert/convertImage",
  async ({ file, format }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      // --- Phase 1: Upload file (track upload progress) ---
      dispatch(setUploadPhase());

      const uploadResponse = await api.post("/files/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          dispatch(setUploadProgress(percent));
        },
      });

      const { jobId } = uploadResponse.data;

      // --- Phase 2: Poll for conversion progress ---
      dispatch(setConversionPhase());

      await pollJobStatus(jobId, dispatch);

      // --- Phase 3: Download the result ---
      dispatch(setDownloadPhase());

      const downloadResponse = await api.get(`/files/download/${jobId}`, {
        responseType: "blob",
      });

      // Extract filename from Content-Disposition header
      const disposition = downloadResponse.headers["content-disposition"];
      let filename = `Ezy-Convert_image.${format}`;

      if (disposition && disposition.indexOf("attachment") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition,
        );
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Create a local URL representing the blob data
      const fileUrl = window.URL.createObjectURL(
        new Blob([downloadResponse.data]),
      );

      return { url: fileUrl, filename };
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          return rejectWithValue(json.message || "Conversion failed");
        } catch {
          return rejectWithValue(text || "Conversion failed");
        }
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
    // Progress tracking
    phase: null, // "upload" | "conversion" | "download" | null
    uploadProgress: 0, // 0–100
    conversionProgress: 0, // 0–100
    conversionStage: "", // e.g. "Encoding to PNG"
  },
  reducers: {
    resetConvertState: (state) => {
      state.error = null;
      state.isLoading = false;
      state.phase = null;
      state.uploadProgress = 0;
      state.conversionProgress = 0;
      state.conversionStage = "";
    },
    setUploadPhase: (state) => {
      state.phase = "upload";
      state.uploadProgress = 0;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setConversionPhase: (state) => {
      state.phase = "conversion";
      state.uploadProgress = 100;
      state.conversionProgress = 0;
    },
    setConversionProgress: (state, action) => {
      state.conversionProgress = action.payload.progress;
      state.conversionStage = action.payload.stage;
    },
    setDownloadPhase: (state) => {
      state.phase = "download";
      state.conversionProgress = 100;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(convertImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.phase = null;
        state.uploadProgress = 0;
        state.conversionProgress = 0;
        state.conversionStage = "";
      })
      .addCase(convertImage.fulfilled, (state) => {
        state.isLoading = false;
        state.phase = null;
      })
      .addCase(convertImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.phase = null;
      });
  },
});

export const {
  resetConvertState,
  setUploadPhase,
  setUploadProgress,
  setConversionPhase,
  setConversionProgress,
  setDownloadPhase,
} = convertSlice.actions;
export default convertSlice.reducer;
