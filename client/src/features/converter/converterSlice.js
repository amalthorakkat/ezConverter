import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/**
 * Helper to map technical errors to user-friendly messages.
 */
const getFriendlyErrorMessage = (error) => {
  if (!error.response) {
    if (error.request) return "Network error. Please check your internet connection.";
    return "An unexpected error occurred. Please try again.";
  }

  const status = error.response.status;
  const message = error.response.data?.message;

  switch (status) {
    case 400:
      return message || "Invalid file or format. Please try again.";
    case 404:
      return "Oops! We couldn't find your conversion. It might have expired (10 min limit).";
    case 413:
      return "File is too large! Please upload a file under 10MB.";
    case 429:
      return "You're converting files too fast! Please wait a few minutes.";
    case 500:
      return "Our server is having a moment. Please try again shortly.";
    default:
      return message || "Something went wrong. Let's try that again.";
  }
};

/**
 * Helper: polls GET /files/status/:jobId every 500ms until
 * the job is completed or failed. Dispatches progress updates.
 */
const pollJobStatus = (jobId, dispatch) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/files/status/${jobId}`);

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
          reject(new Error(data.error || "The conversion process failed."));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 500);
  });
};

export const downloadJobResult = createAsyncThunk(
  "convert/downloadJobResult",
  async ({ jobId, format }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/files/download/${jobId}`, {
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"];
      let filename = `Ezy-Convert_image.${format}`;

      if (disposition && disposition.indexOf("attachment") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition,
        );
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      localStorage.removeItem("activeJobId");

      return { url: fileUrl, filename };
    } catch (error) {
      return rejectWithValue(getFriendlyErrorMessage(error));
    }
  },
);

export const recoverJob = createAsyncThunk(
  "convert/recoverJob",
  async (jobId, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/files/status/${jobId}`);

      dispatch(
        setRecoveredJob({
          jobId,
          originalName: data.originalName,
          format: data.format,
          createdAt: data.createdAt,
        }),
      );

      if (data.status === "processing" || data.status === "pending") {
        dispatch(setConversionPhase());
        await pollJobStatus(jobId, dispatch);
        dispatch(setDownloadPhase());
      } else if (data.status === "completed") {
        dispatch(setDownloadPhase());
      } else if (data.status === "failed") {
        localStorage.removeItem("activeJobId");
        return rejectWithValue(data.error || "The previous conversion failed.");
      }

      return data;
    } catch (error) {
      localStorage.removeItem("activeJobId");
      return rejectWithValue(getFriendlyErrorMessage(error));
    }
  },
);

export const convertImage = createAsyncThunk(
  "convert/convertImage",
  async ({ file, format }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

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
      localStorage.setItem("activeJobId", jobId);
      dispatch(setActiveJobId(jobId));

      dispatch(setConversionPhase());
      await pollJobStatus(jobId, dispatch);
      dispatch(setDownloadPhase());

      return { jobId, format };
    } catch (error) {
      localStorage.removeItem("activeJobId");
      return rejectWithValue(getFriendlyErrorMessage(error));
    }
  },
);

const convertSlice = createSlice({
  name: "convert",
  initialState: {
    isLoading: false,
    error: null,
    activeJobId: null,
    originalName: null,
    recoveredFormat: null,
    createdAt: null,
    phase: null,
    uploadProgress: 0,
    conversionProgress: 0,
    conversionStage: "",
  },
  reducers: {
    resetConvertState: (state) => {
      state.error = null;
      state.isLoading = false;
      state.activeJobId = null;
      state.originalName = null;
      state.recoveredFormat = null;
      state.createdAt = null;
      state.phase = null;
      state.uploadProgress = 0;
      state.conversionProgress = 0;
      state.conversionStage = "";
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveJobId: (state, action) => {
      state.activeJobId = action.payload;
      state.createdAt = Date.now();
    },
    setRecoveredJob: (state, action) => {
      state.activeJobId = action.payload.jobId;
      state.originalName = action.payload.originalName;
      state.recoveredFormat = action.payload.format;
      state.createdAt = action.payload.createdAt;
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
      })
      .addCase(convertImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(convertImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.phase = null;
      })
      .addCase(recoverJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recoverJob.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(recoverJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.activeJobId = null;
        state.originalName = null;
        state.recoveredFormat = null;
        state.createdAt = null;
        state.phase = null;
      })
      .addCase(downloadJobResult.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(downloadJobResult.fulfilled, (state) => {
        state.isLoading = false;
        state.phase = null;
        state.activeJobId = null;
      })
      .addCase(downloadJobResult.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.activeJobId = null;
        state.originalName = null;
        state.recoveredFormat = null;
        state.createdAt = null;
        state.phase = null;
      });
  },
});

export const {
  resetConvertState,
  clearError,
  setActiveJobId,
  setRecoveredJob,
  setUploadPhase,
  setUploadProgress,
  setConversionPhase,
  setConversionProgress,
  setDownloadPhase,
} = convertSlice.actions;
export default convertSlice.reducer;
