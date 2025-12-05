import axiosClient from './axios'

const productApi = {
    getAll: () => {
        return axiosClient.get('/products')
    },
    // ✅ THÊM: Random products với pagination
    getRandom: (page = 1, limit = 16) => {
        return axiosClient.get('/products/random', {
            params: { page, limit }
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