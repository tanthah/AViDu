// backend/src/routes/productRoutes.js - UPDATED
import express from 'express'
import {
    getAllProducts,
    getAllProductsWithPagination, // ✅ NEW
    getProductDetail,
    getBestSellingProducts,
    getNewestProducts,
    getMostViewedProducts,
    getHighestDiscountProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js'

const router = express.Router()

// Public routes
router.get('/', getAllProducts) // Simple all products
router.get('/paginated', getAllProductsWithPagination) // ✅ NEW: Lazy loading
router.get('/best-selling', getBestSellingProducts)
router.get('/newest', getNewestProducts)
router.get('/most-viewed', getMostViewedProducts)
router.get('/highest-discount', getHighestDiscountProducts)

// Product detail
router.get('/:id', getProductDetail)

// Admin routes - TODO: Add authentication middleware
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router