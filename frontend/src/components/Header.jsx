// frontend/src/components/Header.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Button,
  Badge,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { logout } from "../redux/authSlice";
import { fetchCart } from "../redux/cartSlice";
import { fetchCategories } from "../redux/categorySlice";

import "./css/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);
  const { categories } = useSelector((s) => s.category);

  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.role === "admin";
  const cartItemCount = cart?.totalQuantity || 0;

  /* ---------------------- FETCH INITIAL DATA ---------------------- */
  useEffect(() => {
    dispatch(fetchCategories());
    if (token) dispatch(fetchCart());
  }, []); // <--- Không để dispatch vào dependency nữa

  /* ---------------------- HANDLERS ---------------------- */
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/");
  }, [dispatch, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${searchQuery}`);
  };

  const handleCartClick = () => {
    navigate(token ? "/cart" : "/login");
  };

  const getAvatarUrl = () =>
    user?.avatar?.includes("cloudinary.com")
      ? user.avatar
      : "https://via.placeholder.com/40?text=U";

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/40?text=Avatar";
  };

  /* ---------------------- RENDER CATEGORY MENU ---------------------- */
  const renderCategoryMenu = () => {
    if (!categories?.length)
      return <NavDropdown.Item disabled>Đang tải danh mục...</NavDropdown.Item>;

    return categories.map((c) => (
      <NavDropdown.Item key={c._id} as={Link} to={`/category/${c._id}`}>
        <i className="bi bi-tag me-2"></i>
        {c.name}
      </NavDropdown.Item>
    ));
  };

  return (
    <header className="header-main">
      {/* ---------------------- TOP BAR ---------------------- */}
      <div className="top-bar">
        <Container>
          <div className="d-flex justify-content-between">
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

      {/* ---------------------- NAVBAR ---------------------- */}
      <Navbar bg="white" expand="lg" className="shadow-sm main-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <i className="bi bi-shop text-primary me-1"></i>
            <span className="brand-text">TV Shop</span>
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse>
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

              <NavDropdown
                title={
                  <span>
                    <i className="bi bi-grid me-1"></i>Danh mục
                  </span>
                }
                id="category-dropdown"
                className="category-link"
              >
                {renderCategoryMenu()}
              </NavDropdown>
              
            </Nav>

            {/* ---------------------- SEARCH BAR ---------------------- */}
            <Form className="search-form" onSubmit={handleSearch}>
              <div className="input-group">
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button type="submit" className="search-btn">
                  <i className="bi bi-search"></i>
                </Button>
              </div>
            </Form>

            {/* ---------------------- RIGHT MENU ---------------------- */}
            <Nav className="ms-auto align-items-center">
              <Nav.Link
                onClick={handleCartClick}
                className="position-relative me-3 cart-link"
              >
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
                        onError={handleImageError}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          marginRight: "8px",
                          border: "2px solid #0d6efd",
                        }}
                      />
                      <span className="d-none d-md-inline">
                        {user?.name || "User"}
                      </span>
                    </div>
                  }
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/review-profile">
                    <i className="bi bi-person me-2"></i>Hồ sơ
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/orders">
                    <i className="bi bi-box-seam me-2"></i>Đơn hàng
                  </NavDropdown.Item>

                  <NavDropdown.Divider />

                  <NavDropdown.Item as={Link} to="/reviews">
                    <i className="bi bi-star me-2"></i>Đánh giá
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/wishlist">
                    <i className="bi bi-heart me-2"></i>Yêu thích
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/loyalty">
                    <i className="bi bi-coin me-2"></i>Điểm tích lũy
                  </NavDropdown.Item>

                  {isAdmin && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item
                        as={Link}
                        to="/admin/orders"
                        className="text-danger"
                      >
                        <i className="bi bi-shield-check me-2"></i>
                        <strong>Quản lý đơn hàng</strong>
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-primary"
                    size="sm"
                    className="me-2 rounded-pill"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                  </Button>

                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    size="sm"
                    className="rounded-pill"
                  >
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
