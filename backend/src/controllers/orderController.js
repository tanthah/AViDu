// backend/src/controllers/orderController.js
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';

// TẠO ĐỘN HÀNG COD
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, notes, shippingFee = 30000 } = req.body;

        // Kiểm tra địa chỉ
        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ giao hàng' });
        }

        // Lấy giỏ hàng
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }

        // Kiểm tra tồn kho và chuẩn bị items
        const orderItems = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.productId._id);
            
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Sản phẩm ${item.productName} không tồn tại` 
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho` 
                });
            }

            // Trừ tồn kho
            product.stock -= item.quantity;
            product.sold += item.quantity;
            await product.save();

            orderItems.push({
                productId: product._id,
                quantity: item.quantity,
                price: item.finalPrice
            });
        }

        // Tạo mã đơn hàng
        const orderCode = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Tính tổng tiền
        const totalPrice = cart.totalPrice + shippingFee;

        // Tạo đơn hàng
        const order = await Order.create({
            orderCode,
            userId,
            items: orderItems,
            totalPrice,
            shippingFee,
            status: 'pending',
            paymentStatus: 'unpaid',
            paymentMethod: 'COD',
            addressId,
            notes
        });

        // Xóa giỏ hàng
        cart.items = [];
        cart.totalQuantity = 0;
        cart.totalPrice = 0;
        await cart.save();

        // Populate thông tin đơn hàng
        await order.populate(['items.productId', 'addressId']);

        res.status(201).json({ 
            success: true, 
            order,
            message: 'Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY TẤT CẢ ĐƠN HÀNG CỦA USER
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId })
            .populate(['items.productId', 'addressId'])
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY CHI TIẾT ĐƠN HÀNG
export const getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, userId })
            .populate(['items.productId', 'addressId']);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// HỦY ĐƠN HÀNG
export const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { cancelReason } = req.body;

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' 
            });
        }

        // Hoàn lại tồn kho
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                product.sold -= item.quantity;
                await product.save();
            }
        }

        order.status = 'cancelled';
        order.cancelReason = cancelReason || 'Khách hàng hủy đơn';
        await order.save();

        res.json({ success: true, order, message: 'Đã hủy đơn hàng thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};