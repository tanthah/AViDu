// backend/src/routes/orderRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    createOrder,
    getUserOrders,
    getOrderDetail,
    cancelOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập
router.use(authenticateToken);

router.post('/create', createOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderDetail);
router.put('/:orderId/cancel', cancelOrder);

export default router;