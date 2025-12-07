// frontend/src/api/loyaltyApi.js
const loyaltyApi = {
    // Get loyalty points
    getLoyaltyPoints: () => axios.get('/loyalty'),
    
    // Get points history
    getPointsHistory: (page = 1, limit = 20) =>
        axios.get('/loyalty/history', { params: { page, limit } }),
};

export default loyaltyApi;