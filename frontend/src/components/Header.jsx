import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, NavDropdown, Form, Button, Badge, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { fetchCart } from '../redux/cartSlice'; // ✅ THÊM
import './css/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart); // ✅ THÊM
  const [searchQuery, setSearchQuery] = useState('');

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

  // ✅ Lấy số lượng items trong cart
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
                {/* ✅ Hiển thị số lượng items trong cart */}
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