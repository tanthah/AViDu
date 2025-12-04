// frontend/src/pages/ProductDetail.jsx - FIXED VERSION
import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearCurrentProduct } from '../redux/productSlice'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import Header from '../components/Header'
import Footer from '../components/Footer'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import './css/ProductDetail.css'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { currentProduct, loading, error } = useSelector((s) => s.products)
    const [quantity, setQuantity] = useState(1)
    const [thumbsSwiper, setThumbsSwiper] = useState(null)

    // Fetch product only when ID changes
    useEffect(() => {
        if (id) {
            // Clear previous product
            dispatch(clearCurrentProduct())
            // Fetch new product
            dispatch(fetchProductById(id))
        }

        // Cleanup when unmounting or ID changes
        return () => {
            dispatch(clearCurrentProduct())
        }
    }, [id, dispatch])

    const handleIncrease = () => {
        if (currentProduct && quantity < currentProduct.stock) {
            setQuantity(q => q + 1)
        }
    }

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1)
        }
    }

    const handleAddToCart = () => {
        // TODO: Add to cart functionality
        alert(`Thêm ${quantity} sản phẩm vào giỏ hàng!`)
    }

    if (loading) {
        return (
            <>
                <Header />
                <Container className="py-5 text-center">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
                </Container>
                <Footer />
            </>
        )
    }

    if (error) {
        return (
            <>
                <Header />
                <Container className="py-5">
                    <Alert variant="danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        <i className="bi bi-house me-2"></i>
                        Về trang chủ
                    </Button>
                </Container>
                <Footer />
            </>
        )
    }

    if (!currentProduct) {
        return (
            <>
                <Header />
                <Container className="py-5 text-center">
                    <h3>Không tìm thấy sản phẩm</h3>
                    <Button variant="primary" onClick={() => navigate('/')} className="mt-3">
                        <i className="bi bi-house me-2"></i>
                        Về trang chủ
                    </Button>
                </Container>
                <Footer />
            </>
        )
    }

    const product = currentProduct
    const isOutOfStock = product.stock === 0
    const images = product.images && product.images.length > 0
        ? product.images
        : ['/placeholder-product.jpg']

    return (
        <div className="product-detail-page">
            <Header />

            <Container className="py-4">
                <div className="mb-3">
                    <Button
                        variant="link"
                        onClick={() => navigate('/')}
                        className="back-button p-0"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Quay lại trang chủ
                    </Button>
                </div>

                <Row className="g-4">
                    {/* Left Column - Images */}
                    <Col lg={5}>
                        <div className="product-images-section">
                            {/* Main Swiper */}
                            <Swiper
                                modules={[Navigation, Pagination, Thumbs]}
                                navigation
                                pagination={{ clickable: true }}
                                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                className="main-swiper mb-3"
                                spaceBetween={10}
                            >
                                {images.map((img, idx) => (
                                    <SwiperSlide key={idx}>
                                        <div className="main-image-wrapper">
                                            <img src={img} alt={`${product.name} ${idx + 1}`} />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Thumbnails Swiper */}
                            {images.length > 1 && (
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    watchSlidesProgress
                                    className="thumbs-swiper"
                                >
                                    {images.map((img, idx) => (
                                        <SwiperSlide key={idx}>
                                            <div className="thumb-image-wrapper">
                                                <img src={img} alt={`Thumb ${idx + 1}`} />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>
                    </Col>

                    {/* Right Column - Info */}
                    <Col lg={7}>
                        <div className="product-info-section">
                            {/* Product Name */}
                            <h1 className="product-title">{product.name}</h1>

                            {/* Category */}
                            {product.categoryId && (
                                <div className="mb-3">
                                    <Badge bg="secondary" className="category-badge">
                                        <i className="bi bi-tag me-1"></i>
                                        {product.categoryId.name}
                                    </Badge>
                                </div>
                            )}

                            {/* Price Section */}
                            <div className="price-box">
                                {product.discount > 0 && product.price && (
                                    <>
                                        <div className="original-price">
                                            {product.price.toLocaleString('vi-VN')}đ
                                        </div>
                                        <Badge bg="danger" className="discount-badge-detail ms-2">
                                            -{product.discount}%
                                        </Badge>
                                    </>
                                )}
                                <div className="final-price">
                                    {(product.finalPrice || product.price || 0).toLocaleString('vi-VN')}đ
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="stock-section my-3">
                                <strong className="me-2">Tình trạng:</strong>
                                {isOutOfStock ? (
                                    <Badge bg="danger">
                                        <i className="bi bi-x-circle me-1"></i>
                                        Hết hàng
                                    </Badge>
                                ) : (
                                    <Badge bg="success">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Còn {product.stock} sản phẩm
                                    </Badge>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="product-stats-detail mb-4">
                                <span className="me-4">
                                    <i className="bi bi-eye text-primary me-2"></i>
                                    <strong>{product.views || 0}</strong> lượt xem
                                </span>
                                <span>
                                    <i className="bi bi-cart-check text-success me-2"></i>
                                    Đã bán <strong>{product.sold || 0}</strong>
                                </span>
                            </div>

                            <hr />

                            {/* Quantity Selector */}
                            <div className="quantity-section my-4">
                                <strong className="me-3">Số lượng:</strong>
                                <div className="quantity-controls">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleDecrease}
                                        disabled={quantity <= 1 || isOutOfStock}
                                    >
                                        <i className="bi bi-dash"></i>
                                    </Button>
                                    <input
                                        type="number"
                                        className="quantity-input"
                                        value={quantity}
                                        readOnly
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleIncrease}
                                        disabled={quantity >= product.stock || isOutOfStock}
                                    >
                                        <i className="bi bi-plus"></i>
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons d-flex gap-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-grow-1"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                >
                                    <i className="bi bi-cart-plus me-2"></i>
                                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="lg"
                                    disabled={isOutOfStock}
                                >
                                    <i className="bi bi-heart"></i>
                                </Button>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="description-section mt-4">
                                    <h5 className="fw-bold mb-3">Mô tả sản phẩm</h5>
                                    <p className="text-muted">{product.description}</p>
                                </div>
                            )}

                            {/* Brand */}
                            {product.brand && (
                                <div className="brand-section mt-3">
                                    <strong>Thương hiệu:</strong>
                                    <span className="ms-2 text-primary">{product.brand}</span>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            <Footer />
        </div>
    )
}