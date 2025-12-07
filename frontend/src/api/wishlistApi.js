// frontend/src/api/wishlistApi.js
const wishlistApi = {
    // Get wishlist
    getWishlist: () => axios.get('/wishlist'),
    
    // Add to wishlist
    addToWishlist: (productId) => axios.post('/wishlist/add', { productId }),
    
    // Remove from wishlist
    removeFromWishlist: (productId) => axios.delete(`/wishlist/remove/${productId}`),
    
    // Check if product in wishlist
    checkWishlist: (productId) => axios.get(`/wishlist/check/${productId}`),
};

export default wishlistApi;