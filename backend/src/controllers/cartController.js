// backend/src/controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// LẤY GIỎ HÀNG CỦA USER
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let cart = await Cart.findOne({ userId }).populate('items.productId');
        
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        // Tính toán lại tổng tiền
        const totalPrice = cart.items.reduce((sum, item) => {
            return sum + (item.finalPrice * item.quantity);
        }, 0);

        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        cart.totalPrice = totalPrice;
        cart.totalQuantity = totalQuantity;
        await cart.save();

        res.json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// THÊM SẢN PHẨM VÀO GIỎ
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Không đủ hàng trong kho' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Cập nhật số lượng
            cart.items[existingItemIndex].quantity += quantity;
            
            if (cart.items[existingItemIndex].quantity > product.stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Vượt quá số lượng tồn kho' 
                });
            }
        } else {
            // Thêm mới
            cart.items.push({
                productId,
                quantity,
                price: product.price,
                finalPrice: product.finalPrice,
                productName: product.name,
                productImage: product.images[0] || ''
            });
        }

        // Tính tổng
        cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

        await cart.save();
        await cart.populate('items.productId');

        res.json({ success: true, cart, message: 'Đã thêm vào giỏ hàng' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// CẬP NHẬT SỐ LƯỢNG
export const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Số lượng phải lớn hơn 0' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
        }

        const product = await Product.findById(productId);
        if (quantity > product.stock) {
            return res.status(400).json({ 
                success: false, 
                message: `Chỉ còn ${product.stock} sản phẩm trong kho` 
            });
        }

        cart.items[itemIndex].quantity = quantity;

        // Tính lại tổng
        cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

        await cart.save();
        await cart.populate('items.productId');

        res.json({ success: true, cart, message: 'Đã cập nhật giỏ hàng' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// XÓA SẢN PHẨM KHỎI GIỎ
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        // Tính lại tổng
        cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

        await cart.save();
        await cart.populate('items.productId');

        res.json({ success: true, cart, message: 'Đã xóa sản phẩm' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// XÓA TOÀN BỘ GIỎ HÀNG
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
        }

        cart.items = [];
        cart.totalQuantity = 0;
        cart.totalPrice = 0;

        await cart.save();

        res.json({ success: true, cart, message: 'Đã xóa toàn bộ giỏ hàng' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};