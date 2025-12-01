// frontend/src/redux/registerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Send OTP
export const sendRegisterOtp = createAsyncThunk(
  "register/sendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/register/send-register-otp`, {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể gửi OTP"
      );
    }
  }
);

// Verify OTP
export const verifyRegisterOtp = createAsyncThunk(
  "register/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/register/verify-register-otp`,
        { email, otp }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Xác thực OTP thất bại"
      );
    }
  }
);

// Complete Registration (WITH AVATAR)
export const completeRegistration = createAsyncThunk(
  "register/complete",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const { imageFile } = getState().register;
      
      // Create FormData để gửi file
      const data = new FormData();
      
      // Append user info
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('confirmPassword', formData.confirmPassword);
      data.append('otp', formData.otp);
      
      // Optional fields
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.dateOfBirth) data.append('dateOfBirth', formData.dateOfBirth);
      if (formData.gender) data.append('gender', formData.gender);
      
      // Append avatar nếu có
      if (imageFile) {
        data.append('avatar', imageFile);
      }

      const response = await axios.post(
        `${API_URL}/api/register/complete-register`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Lưu token và user info vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Đăng ký thất bại"
      );
    }
  }
);

const registerSlice = createSlice({
  name: "register",
  initialState: {
    loading: false,
    error: null,
    message: null,
    imageFile: null,
    imagePreview: null,
    otpSent: false,
    otpVerified: false,
    registrationComplete: false,
    step: 1, // 1: Form, 2: OTP, 3: Success
  },
  reducers: {
    setImageFile: (state, action) => {
      state.imageFile = action.payload;
      state.imagePreview = URL.createObjectURL(action.payload);
    },
    clearImage: (state) => {
      if (state.imagePreview) {
        URL.revokeObjectURL(state.imagePreview);
      }
      state.imageFile = null;
      state.imagePreview = null;
    },
    resetRegisterState: (state) => {
      if (state.imagePreview) {
        URL.revokeObjectURL(state.imagePreview);
      }
      state.loading = false;
      state.error = null;
      state.message = null;
      state.imageFile = null;
      state.imagePreview = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationComplete = false;
      state.step = 1;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(sendRegisterOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.step = 2;
        state.message = action.payload.message;
      })
      .addCase(sendRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.message = action.payload.message;
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Complete Registration
    builder
      .addCase(completeRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationComplete = true;
        state.step = 3;
        state.message = action.payload.message;
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setImageFile, clearImage, resetRegisterState, setStep } =
  registerSlice.actions;

export default registerSlice.reducer;