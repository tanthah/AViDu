import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Pagination, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import productApi from '../api/productApi';
import './css/Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const productsPerPage = 16;

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'newest';
    setCurrentPage(page);
    setSortBy(sort);
    fetchProducts(page, sort);
  }, [searchParams]);

  const fetchProducts = async (page, sort) => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Lấy tất cả sản phẩm
      const response = await productApi.getAll();
      let allProducts = response.data.products || [];

      // ✅ Sort products theo tiêu chí
      switch (sort) {
        case 'newest':
          allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'price-asc':
          allProducts.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
          break;
        case 'price-desc':
          allProducts.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
          break;
        case 'best-selling':
          allProducts.sort((a, b) => (b.sold || 0) - (a.sold || 0));
          break;
        case 'discount':
          allProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
          break;
        case 'name-asc':
          allProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          allProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }

      // ✅ Client-side pagination
      const totalItems = allProducts.length;
      const totalPagesCalc = Math.ceil(totalItems / productsPerPage);
      setTotalPages(totalPagesCalc);
      setTotalProducts(totalItems);

      const startIndex = (page - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setSearchParams({ page: pageNumber, sort: sortBy });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    setSearchParams({ page: 1, sort: newSort });
  };

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    if (startPage > 1) {
      items.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />
      );
    }

    // Previous button
    if (currentPage > 1) {
      items.push(
        <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />
      );
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} />
      );
    }

    // Last page button
    if (endPage < totalPages) {
      items.push(
        <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} />
      );
    }

    return items;
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
                  Hiển thị {products.length > 0 ? ((currentPage - 1) * productsPerPage + 1) : 0} - {Math.min(currentPage * productsPerPage, totalProducts)} / {totalProducts} sản phẩm
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <Row className="g-3 mb-4">
              {products.map((product) => (
                <Col key={product._id} xs={6} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  {renderPagination()}
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
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