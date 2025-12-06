// frontend/src/api/productApi.js - UPDATED
import axiosClient from './axios'

const productApi = {
    getAll: () => {
        return axiosClient.get('/products')
    },
    // ✅ NEW: Get products with pagination for lazy loading
    getPaginated: (page = 1, limit = 16, sort = 'newest') => {
        return axiosClient.get('/products/paginated', {
            params: { page, limit, sort }
        })
    },
    getDetail: (id) => {
        return axiosClient.get(`/products/${id}`)
    },
    getBestSelling: () => {
        return axiosClient.get('/products/best-selling')
    },
    getNewest: () => {
        return axiosClient.get('/products/newest')
    },
    getMostViewed: () => {
        return axiosClient.get('/products/most-viewed')
    },
    getHighestDiscount: () => {
        return axiosClient.get('/products/highest-discount')
    }
}

export default productApi