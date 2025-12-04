import React, { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown, Form, Button, Badge, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import './css/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleCartClick = () => {
    if (!token) {
      // Nếu chưa đăng nhập, chuyển đến trang login
      navigate('/login');
    } else {
      // Nếu đã đăng nhập, chuyển đến trang giỏ hàng
      navigate('/cart');
    }
  };

  // Get avatar URL - prioritize Cloudinary URLs
  const getAvatarUrl = () => {
    if (user?.avatar && user.avatar.includes('cloudinary.com')) {
      return user.avatar;
    }
    return 'https://via.placeholder.com/40?text=U';
  };

  return (
    <header className="header-main">
      {/* Top Bar */}
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

      {/* Main Header */}
      <Navbar bg="white" expand="lg" className="shadow-sm main-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/dashboard" className="brand-logo">
            <i className="bi bi-shop text-primary me-1"></i>
            <span className="brand-text">UTE Shop</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />
          
          <Navbar.Collapse id="main-navbar">
            {/* Category Navigation */}
            <Nav className="me-auto category-nav-inline">
              <Nav.Link as={Link} to="/dashboard" className="category-link">
                <i className="bi bi-house-door me-1"></i>Trang chủ
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="category-link">
                <i className="bi bi-info-circle me-1"></i>Giới thiệu
              </Nav.Link>
              <NavDropdown title={<span><i className="bi bi-grid me-1"></i>Danh mục</span>} id="category-dropdown" className="category-link">
                <NavDropdown.Item as={Link} to="/category/dien-thoai">
                  <i className="bi bi-phone me-2"></i>Điện thoại
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/laptop">
                  <i className="bi bi-laptop me-2"></i>Laptop
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/tablet">
                  <i className="bi bi-tablet me-2"></i>Tablet
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/tai-nghe">
                  <i className="bi bi-headphones me-2"></i>Tai nghe
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/phu-kien">
                  <i className="bi bi-plug me-2"></i>Phụ kiện
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            {/* Search Bar */}
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

            {/* Right Menu */}
            <Nav className="ms-auto align-items-center">
              {/* Cart Icon - Always visible */}
              <Nav.Link onClick={handleCartClick} className="position-relative me-3 cart-link">
                <i className="bi bi-cart3 fs-5"></i>
                <Badge bg="danger" pill className="cart-badge">0</Badge>
              </Nav.Link>

              {token ? (
                /* Logged in - Show user avatar and dropdown */
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
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
                    </span>
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
                /* Not logged in - Show login and register buttons */
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