import axiosClient from './axios'

const productApi = {
    getAll: () => {
        return axiosClient.get('/products')
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
