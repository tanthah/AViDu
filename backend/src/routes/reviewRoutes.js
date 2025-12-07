// backend/src/routes/reviewRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
  createReview,
  getPendingReviews,
  getUserReviews,
  getProductReviews,
  updateReview,
  deleteReview,
  replyToReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Customer routes
router.use(authenticateToken);

router.post('/create', createReview);
router.get('/pending', getPendingReviews);
router.get('/user', getUserReviews);
router.get('/product/:productId', getProductReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

// Admin routes
router.post('/:reviewId/reply', authorize('admin'), replyToReview);

export default router;

// backend/src/routes/wishlistRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);

export default router;

// backend/src/routes/viewedProductRoutes.js
import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import {
  trackView,
  getViewedProducts,
  clearViewedHistory
} from '../controllers/viewedProductController.js';

const router = express.Router();

router.post('/track', optionalAuth, trackView);
router.get('/', authenticateToken, getViewedProducts);
router.delete('/clear', authenticateToken, clearViewedHistory);

export default router;

// backend/src/routes/loyaltyRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getLoyaltyPoints,
  getPointsHistory
} from '../controllers/loyaltyController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLoyaltyPoints);
router.get('/history', getPointsHistory);

export default router;

// backend/src/routes/couponRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
  getUserCoupons,
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Customer routes
router.use(authenticateToken);

router.get('/user', getUserCoupons);
router.post('/validate', validateCoupon);

// Admin routes
router.post('/create', authorize('admin'), createCoupon);
router.get('/all', authorize('admin'), getAllCoupons);
router.put('/:couponId', authorize('admin'), updateCoupon);
router.delete('/:couponId', authorize('admin'), deleteCoupon);

export default router;