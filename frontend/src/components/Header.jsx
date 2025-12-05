import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, NavDropdown, Form, Button, Badge, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { fetchCart } from '../redux/cartSlice';
import { fetchCategories } from '../redux/categorySlice'; // ✅ ADD
import './css/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);
  const { categories } = useSelector((s) => s.category); // ✅ ADD
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ✅ Fetch cart khi user đăng nhập
  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleCartClick = () => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatar && user.avatar.includes('cloudinary.com')) {
      return user.avatar;
    }
    return 'https://via.placeholder.com/40?text=U';
  };

  const cartItemCount = cart?.totalQuantity || 0;

  return (
    <header className="header-main">
      <div className="top-bar">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-telephone-fill me-2"></i>
              Hotline: 1900 xxxx
              <span className="mx-3">|</span>
              <i className="bi bi-envelope-fill me-2"></i>
              support@uteshop.com
            </div>
            <div>
              <i className="bi bi-truck me-2"></i>
              Miễn phí vận chuyển cho đơn hàng từ 500K
            </div>
          </div>
        </Container>
      </div>

      <Navbar bg="white" expand="lg" className="shadow-sm main-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <i className="bi bi-shop text-primary me-1"></i>
            <span className="brand-text">UTE Shop</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />
          
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto category-nav-inline">
              <Nav.Link as={Link} to="/" className="category-link">
                <i className="bi bi-house-door me-1"></i>Trang chủ
              </Nav.Link>
              
              <Nav.Link as={Link} to="/products" className="category-link">
                <i className="bi bi-box-seam me-1"></i>Sản phẩm
              </Nav.Link>
              
              <Nav.Link as={Link} to="/about" className="category-link">
                <i className="bi bi-info-circle me-1"></i>Giới thiệu
              </Nav.Link>
              
              {/* ✅ DYNAMIC CATEGORIES DROPDOWN */}
              <NavDropdown 
                title={<span><i className="bi bi-grid me-1"></i>Danh mục</span>} 
                id="category-dropdown" 
                className="category-link"
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <NavDropdown.Item 
                      key={category._id}
                      as={Link} 
                      to={`/category/${category._id}`}
                    >
                      <i className="bi bi-tag me-2"></i>
                      {category.name}
                    </NavDropdown.Item>
                  ))
                ) : (
                  <NavDropdown.Item disabled>
                    Đang tải danh mục...
                  </NavDropdown.Item>
                )}
              </NavDropdown>
            </Nav>

            <Form className="search-form" onSubmit={handleSearch}>
              <div className="input-group">
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button variant="primary" type="submit" className="search-btn">
                  <i className="bi bi-search"></i>
                </Button>
              </div>
            </Form>

            <Nav className="ms-auto align-items-center">
              <Nav.Link onClick={handleCartClick} className="position-relative me-3 cart-link">
                <i className="bi bi-cart3 fs-5"></i>
                <Badge bg="danger" pill className="cart-badge">
                  {cartItemCount}
                </Badge>
              </Nav.Link>

              {token ? (
                <NavDropdown 
                  title={
                    <div className="d-flex align-items-center">
                      <Image
                        src={getAvatarUrl()}
                        roundedCircle
                        style={{ 
                          width: '35px', 
                          height: '35px', 
                          objectFit: 'cover',
                          marginRight: '8px',
                          border: '2px solid #0d6efd'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40?text=U';
                        }}
                      />
                      <span className="d-none d-md-inline">{user?.name || 'User'}</span>
                    </div>
                  }
                  id="user-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/review-profile">
                    <i className="bi bi-person me-2"></i>Hồ sơ
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    <i className="bi bi-box-seam me-2"></i>Đơn hàng
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline-primary" size="sm" className="me-2 rounded-pill">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="sm" className="rounded-pill">
                    <i className="bi bi-person-plus me-1"></i>Đăng ký
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}