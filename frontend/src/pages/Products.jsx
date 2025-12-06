// frontend/src/pages/Products.jsx - WITH LAZY LOADING
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import productApi from '../api/productApi';
import './css/Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const limit = 16;

  const observer = useRef();
  const lastProductRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('📜 Loading more products...');
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset when sort changes
  useEffect(() => {
    const sort = searchParams.get('sort') || 'newest';
    if (sort !== sortBy) {
      setSortBy(sort);
      setProducts([]);
      setPage(1);
      setHasMore(true);
    }
  }, [searchParams]);

  // Fetch products when page or sort changes
  useEffect(() => {
    fetchProducts();
  }, [page, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productApi.getPaginated(page, limit, sortBy);
      const newProducts = response.data.products || [];
      const pagination = response.data.pagination;

      // Append new products
      setProducts(prev => [...prev, ...newProducts]);
      setHasMore(pagination.hasNextPage);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSearchParams({ sort: newSort });
  };

  return (
    <div className="products-page">
      <Header />

      <Container className="py-4">
        {/* Page Header */}
        <div className="page-header mb-4">
          <h1 className="page-title">
            <i className="bi bi-box-seam me-2"></i>
            Tất cả sản phẩm
          </h1>
          <p className="text-muted">Khám phá toàn bộ sản phẩm của UTE Shop</p>
        </div>

        {/* Filters and Sort */}
        <div className="filters-section mb-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <span className="text-muted me-3">
                  Hiển thị {products.length} sản phẩm
                </span>
              </div>
            </Col>
            <Col md={4}>
              <Form.Select 
                value={sortBy} 
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="newest">Mới nhất</option>
                <option value="best-selling">Bán chạy nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="discount">Giảm giá nhiều nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <Row className="g-3 mb-4">
            {products.map((product, index) => {
              // Attach ref to last product for infinite scroll
              if (index === products.length - 1) {
                return (
                  <Col key={product._id} xs={6} sm={6} md={4} lg={3} ref={lastProductRef}>
                    <ProductCard product={product} />
                  </Col>
                );
              }
              
              return (
                <Col key={product._id} xs={6} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Col>
              );
            })}
          </Row>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
          </div>
        )}

        {/* No More Products */}
        {!loading && !hasMore && products.length > 0 && (
          <div className="text-center py-4">
            <p className="text-muted">
              <i className="bi bi-check-circle me-2"></i>
              Đã hiển thị tất cả sản phẩm
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="empty-state text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h3 className="mt-4">Không có sản phẩm nào</h3>
            <p className="text-muted">Vui lòng thử lại sau</p>
          </div>
        )}
      </Container>

      <Footer />
    </div>
  );
}