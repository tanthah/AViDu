// backend/src/controllers/productController.js - WITH SEARCH

import Product from "../models/Product.js";

// ✅ ENHANCED: LẤY TẤT CẢ SẢN PHẨM VỚI LAZY LOADING VÀ TÌM KIẾM
export const getAllProductsWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'newest';
        const search = req.query.search || '';

        // Build search query
        let searchQuery = { isActive: true };
        
        if (search.trim()) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'newest':
                sortObj = { createdAt: -1 };
                break;
            case 'price-asc':
                sortObj = { finalPrice: 1 };
                break;
            case 'price-desc':
                sortObj = { finalPrice: -1 };
                break;
            case 'best-selling':
                sortObj = { sold: -1 };
                break;
            case 'discount':
                sortObj = { discount: -1 };
                break;
            case 'name-asc':
                sortObj = { name: 1 };
                break;
            case 'name-desc':
                sortObj = { name: -1 };
                break;
            default:
                sortObj = { createdAt: -1 };
        }

        const totalProducts = await Product.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(searchQuery)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('categoryId', 'name slug');

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
            },
            search: search || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ NEW: TÌM KIẾM SẢN PHẨM NÂNG CAO
export const searchProducts = async (req, res) => {
    try {
        const { 
            query = '', 
            category, 
            minPrice, 
            maxPrice, 
            brand,
            sort = 'relevance',
            page = 1,
            limit = 16
        } = req.query;

        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = { isActive: true };

        // Text search
        if (query.trim()) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            searchQuery.categoryId = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            searchQuery.finalPrice = {};
            if (minPrice) searchQuery.finalPrice.$gte = parseFloat(minPrice);
            if (maxPrice) searchQuery.finalPrice.$lte = parseFloat(maxPrice);
        }

        // Brand filter
        if (brand) {
            searchQuery.brand = { $regex: brand, $options: 'i' };
        }

        // Build sort
        let sortObj = {};
        switch (sort) {
            case 'relevance':
                // Sort by match score (if using text index) or newest
                sortObj = { createdAt: -1 };
                break;
            case 'price-asc':
                sortObj = { finalPrice: 1 };
                break;
            case 'price-desc':
                sortObj = { finalPrice: -1 };
                break;
            case 'best-selling':
                sortObj = { sold: -1 };
                break;
            case 'rating':
                sortObj = { rating: -1 };
                break;
            default:
                sortObj = { createdAt: -1 };
        }

        const totalProducts = await Product.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(searchQuery)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('categoryId', 'name slug');

        // Get filter options
        const categories = await Product.distinct('categoryId', { isActive: true });
        const brands = await Product.distinct('brand', { isActive: true });
        const priceRange = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: {
                _id: null,
                minPrice: { $min: '$finalPrice' },
                maxPrice: { $max: '$finalPrice' }
            }}
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                productsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                categories,
                brands: brands.filter(Boolean),
                priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
            },
            searchQuery: {
                query,
                category,
                minPrice,
                maxPrice,
                brand,
                sort
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY TẤT CẢ SẢN PHẨM (Simple - for other uses)
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY CHI TIẾT SẢN PHẨM (Tự động tăng lượt xem)
export const getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId');
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        product.views += 1;
        await product.save();

        res.json({ success: true, product });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM BÁN CHẠY NHẤT
export const getBestSellingProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ sold: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM MỚI NHẤT
export const getNewestProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM XEM NHIỀU NHẤT
export const getMostViewedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ views: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM GIẢM GIÁ CAO NHẤT
export const getHighestDiscountProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ discount: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: err.message });
    }
};

// ADMIN CRUD
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        console.error(err); 
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        res.json({ success: true, product });
    } catch (err) {
        console.error(err); 
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        res.json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: err.message });
    }
};