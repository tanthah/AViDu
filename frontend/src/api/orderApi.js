// frontend/src/api/orderApi.js
import axiosClient from './axios'

const orderApi = {
    createOrder: (data) => {
        return axiosClient.post('/orders/create', data)
    },
    getUserOrders: () => {
        return axiosClient.get('/orders')
    },
    getOrderDetail: (orderId) => {
        return axiosClient.get(`/orders/${orderId}`)
    },
    cancelOrder: (orderId, cancelReason) => {
        return axiosClient.put(`/orders/${orderId}/cancel`, { cancelReason })
    }
}

export default orderApi