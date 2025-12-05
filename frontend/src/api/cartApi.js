// frontend/src/api/cartApi.js
import axiosClient from './axios'

const cartApi = {
    getCart: () => {
        return axiosClient.get('/cart')
    },
    addToCart: (productId, quantity = 1) => {
        return axiosClient.post('/cart/add', { productId, quantity })
    },
    updateCartItem: (productId, quantity) => {
        return axiosClient.put('/cart/update', { productId, quantity })
    },
    removeFromCart: (productId) => {
        return axiosClient.delete(`/cart/remove/${productId}`)
    },
    clearCart: () => {
        return axiosClient.delete('/cart/clear')
    }
}

export default cartApi