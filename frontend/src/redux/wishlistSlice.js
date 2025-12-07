// frontend/src/redux/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistApi from '../api/wishlistApi';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.getWishlist();
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải wishlist');
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.addToWishlist(productId);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi thêm');
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.removeFromWishlist(productId);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi xóa');
        }
    }
);

const initialState = {
    wishlist: null,
    loading: false,
    error: null,
    successMessage: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload.wishlist;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Add to wishlist
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.wishlist = action.payload.wishlist;
                state.successMessage = action.payload.message;
            })
            
            // Remove from wishlist
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.wishlist = action.payload.wishlist;
                state.successMessage = action.payload.message;
            });
    },
});

export const { clearError, clearSuccess } = wishlistSlice.actions;
export default wishlistSlice.reducer;