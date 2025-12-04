import Product from "../models/Product.js";

// LẤY TẤT CẢ SẢN PHẨM
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY CHI TIẾT SẢN PHẨM (Tự động tăng lượt xem)
export const getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        // Tăng lượt xem
        product.views += 1;
        await product.save();

        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 1. SẢN PHẨM BÁN CHẠY NHẤT (Top 8 theo lượt bán)
export const getBestSellingProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ sold: -1 })
            .limit(8);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. SẢN PHẨM MỚI NHẤT (Top 8 theo ngày tạo)
export const getNewestProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(8);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. SẢN PHẨM XEM NHIỀU NHẤT (Top 8 theo lượt xem)
export const getMostViewedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ views: -1 })
            .limit(8);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. SẢN PHẨM GIẢM GIÁ CAO NHẤT (Top 8 theo % giảm giá)
export const getHighestDiscountProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ discount: -1 })
            .limit(8);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- ADMIN CRUD OPERATIONS ---

export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        res.json({ success: true, product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        res.json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
