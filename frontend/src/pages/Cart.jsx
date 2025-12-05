// frontend/src/pages/Cart.jsx - FIXED
import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/cartSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, updating, error } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, token, navigate]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    console.log('📝 Updating quantity:', { productId, newQuantity });
    
    try {
      await dispatch(updateCartItem({ 
        productId: productId, 
        quantity: newQuantity 
      })).unwrap();
      console.log('✅ Quantity updated');
    } catch (err) {
      console.error('❌ Update failed:', err);
      alert(err || 'Lỗi khi cập nhật giỏ hàng');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await dispatch(removeFromCart(productId)).unwrap();
      } catch (err) {
        alert(err || 'Lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (err) {
        alert(err || 'Lỗi khi xóa giỏ hàng');
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải giỏ hàng...</p>
        </Container>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#ccc' }}></i>
          <h3 className="mt-3">Giỏ hàng trống</h3>
          <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
            <i className="bi bi-arrow-left me-2"></i>
            Tiếp tục mua sắm
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-4 cart-page">
        {error && (
          <Alert variant="danger" dismissible>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-cart3 me-2"></i>
            Giỏ hàng của bạn
          </h2>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={handleClearCart} 
            disabled={updating}
          >
            <i className="bi bi-trash me-1"></i>
            Xóa tất cả
          </Button>
        </div>

        <Row>
          <Col lg={8}>
            {cart.items.map((item) => {
              const productId = item.productId?._id || item.productId;
              
              return (
                <Card key={item._id} className="mb-3 cart-item-card">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs={3} md={2}>
                        <Image
                          src={item.productImage || 'https://via.placeholder.com/100'}
                          rounded
                          style={{ width: '100%', maxWidth: '100px', cursor: 'pointer' }}
                          onClick={() => navigate(`/product/${productId}`)}
                        />
                      </Col>
                      <Col xs={9} md={4}>
                        <h6 
                          className="mb-1 product-name"
                          onClick={() => navigate(`/product/${productId}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.productName}
                        </h6>
                        <div className="text-danger fw-bold">
                          {item.finalPrice.toLocaleString('vi-VN')}đ
                        </div>
                        {item.price > item.finalPrice && (
                          <small className="text-muted text-decoration-line-through">
                            {item.price.toLocaleString('vi-VN')}đ
                          </small>
                        )}
                      </Col>
                      <Col xs={6} md={3} className="mt-2 mt-md-0">
                        <div className="quantity-controls d-flex align-items-center gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </Button>
                          <span className="fw-bold px-2">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                            disabled={updating}
                          >
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                      </Col>
                      <Col xs={4} md={2} className="text-end mt-2 mt-md-0">
                        <div className="fw-bold text-primary">
                          {(item.finalPrice * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </Col>
                      <Col xs={2} md={1} className="text-end mt-2 mt-md-0">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(productId)}
                          disabled={updating}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </Col>

          <Col lg={4}>
            <Card className="sticky-top cart-summary" style={{ top: '100px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Thông tin đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng sản phẩm:</span>
                  <strong>{cart.totalQuantity}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <strong>{cart.totalPrice.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong className="text-success">30,000đ</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h5>Tổng cộng:</h5>
                  <h5 className="text-danger">
                    {(cart.totalPrice + 30000).toLocaleString('vi-VN')}đ
                  </h5>
                </div>
                <Button
                  variant="danger"
                  size="lg"
                  className="w-100 mb-2"
                  onClick={handleCheckout}
                  disabled={updating}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Tiến hành thanh toán
                </Button>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => navigate('/products')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Tiếp tục mua sắm
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}