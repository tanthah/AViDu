import express from 'express'
import {
    getAllProducts,
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
router.get('/', getAllProducts)
router.get('/best-selling', getBestSellingProducts)
router.get('/newest', getNewestProducts)
router.get('/most-viewed', getMostViewedProducts)
router.get('/highest-discount', getHighestDiscountProducts)

// Product detail routes
router.get('/:id', getProductDetail)
// router.post('/:id/view', incrementView) // View increment is now handled in getProductDetail

// Admin routes - TODO: Thêm authMiddleware và check admin role
router.post('/', createProduct)           // CREATE
router.put('/:id', updateProduct)         // UPDATE
router.delete('/:id', deleteProduct)      // DELETE

export default router
