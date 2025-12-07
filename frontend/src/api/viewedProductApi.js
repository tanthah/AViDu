// frontend/src/api/viewedProductApi.js
const viewedProductApi = {
    // Track product view
    trackView: (productId) => axios.post('/viewed/track', { productId }),
    
    // Get viewed products
    getViewedProducts: (limit = 20) => 
        axios.get('/viewed', { params: { limit } }),
    
    // Clear viewed history
    clearViewedHistory: () => axios.delete('/viewed/clear'),
};

export default viewedProductApi;