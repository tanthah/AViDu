import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.cart);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải giỏ hàng');
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:4000/api/cart/update',
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật');
    }
    setUpdating(false);
  };

  const removeItem = async (productId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:4000/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
    setUpdating(false);
  };

  const clearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        'http://localhost:4000/api/cart/clear',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa giỏ hàng');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Đang tải giỏ hàng...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#ccc' }}></i>
        <h3 className="mt-3">Giỏ hàng trống</h3>
        <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
          Tiếp tục mua sắm
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-cart3 me-2"></i>Giỏ hàng của bạn</h2>
        <Button variant="outline-danger" size="sm" onClick={clearCart} disabled={updating}>
          <i className="bi bi-trash me-1"></i>Xóa tất cả
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          {cart.items.map((item) => (
            <Card key={item._id} className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={3} md={2}>
                    <Image
                      src={item.productImage || 'https://via.placeholder.com/100'}
                      rounded
                      style={{ width: '100%', maxWidth: '100px' }}
                    />
                  </Col>
                  <Col xs={5} md={4}>
                    <h6 className="mb-1">{item.productName}</h6>
                    <div className="text-danger fw-bold">
                      {item.finalPrice.toLocaleString('vi-VN')}đ
                    </div>
                  </Col>
                  <Col xs={4} md={3}>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="fw-bold">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                        disabled={updating}
                      >
                        +
                      </Button>
                    </div>
                  </Col>
                  <Col xs={6} md={2} className="text-end">
                    <div className="fw-bold text-primary">
                      {(item.finalPrice * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </Col>
                  <Col xs={6} md={1} className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeItem(item.productId._id)}
                      disabled={updating}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
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
                className="w-100"
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-credit-card me-2"></i>
                Tiến hành thanh toán
              </Button>
              <Button
                variant="outline-primary"
                className="w-100 mt-2"
                onClick={() => navigate('/products')}
              >
                Tiếp tục mua sắm
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}