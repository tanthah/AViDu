import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productApi from '../api/productApi'

// Fetch latest products (8 sản phẩm mới nhất)
export const fetchLatestProducts = createAsyncThunk(
    'products/fetchLatest',
    async (_, { rejectWithValue }) => {
        try {
            const resp = await productApi.getNewest()
            return resp.data.products
        } catch (err) {
            const message = err?.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm mới'
            return rejectWithValue(message)
        }
    }
)

// Fetch best sellers (8 sản phẩm bán chạy)
export const fetchBestSellers = createAsyncThunk(
    'products/fetchBestSellers',
    async (_, { rejectWithValue }) => {
        try {
            const resp = await productApi.getBestSelling()
            return resp.data.products
        } catch (err) {
            const message = err?.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm bán chạy'
            return rejectWithValue(message)
        }
    }
)

// Fetch most viewed (8 sản phẩm xem nhiều)
export const fetchMostViewed = createAsyncThunk(
    'products/fetchMostViewed',
    async (_, { rejectWithValue }) => {
        try {
            const resp = await productApi.getMostViewed()
            return resp.data.products
        } catch (err) {
            const message = err?.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm xem nhiều'
            return rejectWithValue(message)
        }
    }
)

// Fetch top discounts (8 sản phẩm khuyến mãi cao)
export const fetchTopDiscounts = createAsyncThunk(
    'products/fetchTopDiscounts',
    async (_, { rejectWithValue }) => {
        try {
            const resp = await productApi.getHighestDiscount()
            return resp.data.products
        } catch (err) {
            const message = err?.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm khuyến mãi'
            return rejectWithValue(message)
        }
    }
)

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
    'products/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const resp = await productApi.getDetail(id)
            return resp.data.product
        } catch (err) {
            const message = err?.response?.data?.message || err.message || 'Lỗi khi tải thông tin sản phẩm'
            return rejectWithValue(message)
        }
    }
)

// Increment view count (Removed - handled by getProductDetail)
// export const incrementProductView = ...

const initialState = {
    latest: [],
    bestSellers: [],
    mostViewed: [],
    topDiscounts: [],
    currentProduct: null,
    loading: false,
    error: null,
}

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearCurrentProduct(state) {
            state.currentProduct = null
            state.error = null
        },
        clearError(state) {
            state.error = null
        },
    },
    extraReducers(builder) {
        builder
            // Fetch Latest
            .addCase(fetchLatestProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLatestProducts.fulfilled, (state, action) => {
                state.loading = false
                state.latest = action.payload
            })
            .addCase(fetchLatestProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch Best Sellers
            .addCase(fetchBestSellers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchBestSellers.fulfilled, (state, action) => {
                state.loading = false
                state.bestSellers = action.payload
            })
            .addCase(fetchBestSellers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch Most Viewed
            .addCase(fetchMostViewed.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMostViewed.fulfilled, (state, action) => {
                state.loading = false
                state.mostViewed = action.payload
            })
            .addCase(fetchMostViewed.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch Top Discounts
            .addCase(fetchTopDiscounts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchTopDiscounts.fulfilled, (state, action) => {
                state.loading = false
                state.topDiscounts = action.payload
            })
            .addCase(fetchTopDiscounts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch Product By ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true
                state.error = null
                state.currentProduct = null
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false
                state.currentProduct = action.payload
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })


    },
})

export const { clearCurrentProduct, clearError } = productSlice.actions
export default productSlice.reducer
