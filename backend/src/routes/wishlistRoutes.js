// backend/src/routes/wishlistRoutes.js
// ========================================
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