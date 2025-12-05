// backend/src/controllers/productController.js - UPDATED

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

// LẤY SẢN PHẨM VỚI PHÂN TRANG VÀ RANDOM
export const getRandomProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const skip = (page - 1) * limit;

        // Lấy tổng số sản phẩm
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy sản phẩm random bằng aggregation
        const products = await Product.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: totalProducts } }, // Random toàn bộ
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $addFields: {
                    categoryId: { $arrayElemAt: ['$categoryInfo', 0] }
                }
            },
            { $project: { categoryInfo: 0 } }
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                productsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
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

        product.views += 1;
        await product.save();

        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM BÁN CHẠY NHẤT
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

// SẢN PHẨM MỚI NHẤT
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

// SẢN PHẨM XEM NHIỀU NHẤT
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

// SẢN PHẨM GIẢM GIÁ CAO NHẤT
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

// ADMIN CRUD
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