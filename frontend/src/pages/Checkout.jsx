// frontend/src/pages/Checkout.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';
import orderApi from '../api/orderApi';
import addressApi from '../api/addressApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });

  const shippingFee = 30000;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
    loadAddresses();
  }, [dispatch, token, navigate]);

  const loadAddresses = async () => {
    try {
      const response = await addressApi.getAddresses();
      const addressList = response.data.addresses;
      setAddresses(addressList);
      
      // Tự động chọn địa chỉ mặc định
      const defaultAddr = addressList.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0]._id);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine || 
          !newAddress.ward || !newAddress.district || !newAddress.city) {
        alert('Vui lòng điền đầy đủ thông tin địa chỉ');
        return;
      }

      setLoading(true);
      await addressApi.createAddress(newAddress);
      await loadAddresses();
      setShowAddressModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await orderApi.createOrder({
        addressId: selectedAddress,
        notes,
        shippingFee
      });

      if (response.data.success) {
        alert('Đặt hàng thành công!');
        navigate(`/orders/${response.data.order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải...</p>
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
          <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
            Tiếp tục mua sắm
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const selectedAddressData = addresses.find(addr => addr._id === selectedAddress);

  return (
    <>
      <Header />
      <Container className="py-4 checkout-page">
        <h2 className="mb-4">
          <i className="bi bi-credit-card me-2"></i>
          Thanh toán đơn hàng
        </h2>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Row>
          <Col lg={8}>
            {/* Địa chỉ giao hàng */}
            <Card className="mb-3">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Địa chỉ giao hàng
                </h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowAddressModal(true)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Thêm địa chỉ mới
                </Button>
              </Card.Header>
              <Card.Body>
                {addresses.length === 0 ? (
                  <p className="text-muted text-center">
                    Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.
                  </p>
                ) : (
                  <>
                    {addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        className={`address-item p-3 mb-2 border rounded ${selectedAddress === addr._id ? 'border-primary bg-light' : ''}`}
                        onClick={() => setSelectedAddress(addr._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Form.Check
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)}
                          label={
                            <div>
                              <strong>{addr.fullName}</strong> | {addr.phone}
                              {addr.isDefault && (
                                <span className="badge bg-success ms-2">Mặc định</span>
                              )}
                              <div className="text-muted mt-1">
                                {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                              </div>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>

            {/* Sản phẩm */}
            <Card className="mb-3">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-box-seam me-2"></i>
                  Sản phẩm ({cart.totalQuantity})
                </h5>
              </Card.Header>
              <Card.Body>
                {cart.items.map((item) => (
                  <div key={item._id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img 
                      src={item.productImage || 'https://via.placeholder.com/80'} 
                      alt={item.productName}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">{item.productName}</h6>
                      <div className="text-danger fw-bold">
                        {item.finalPrice.toLocaleString('vi-VN')}đ x {item.quantity}
                      </div>
                    </div>
                    <div className="text-end">
                      <strong className="text-primary">
                        {(item.finalPrice * item.quantity).toLocaleString('vi-VN')}đ
                      </strong>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Ghi chú */}
            <Card className="mb-3">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Ghi chú đơn hàng
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ghi chú cho người bán..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="sticky-top" style={{ top: '100px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Tóm tắt đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <strong>{cart.totalPrice.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong>{shippingFee.toLocaleString('vi-VN')}đ</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h5>Tổng cộng:</h5>
                  <h5 className="text-danger">
                    {(cart.totalPrice + shippingFee).toLocaleString('vi-VN')}đ
                  </h5>
                </div>

                {selectedAddressData && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <small className="text-muted">Giao đến:</small>
                    <div className="mt-1">
                      <strong>{selectedAddressData.fullName}</strong>
                      <div className="text-muted small">
                        {selectedAddressData.phone}
                      </div>
                    </div>
                  </div>
                )}

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>Thanh toán khi nhận hàng (COD)</small>
                </div>

                <Button
                  variant="danger"
                  size="lg"
                  className="w-100"
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Đặt hàng
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal thêm địa chỉ */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm địa chỉ mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                    placeholder="Nhập họ và tên"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ cụ thể <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={newAddress.addressLine}
                onChange={(e) => setNewAddress({...newAddress, addressLine: e.target.value})}
                placeholder="Số nhà, tên đường..."
              />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.ward}
                    onChange={(e) => setNewAddress({...newAddress, ward: e.target.value})}
                    placeholder="Phường/Xã"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                    placeholder="Quận/Huyện"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    placeholder="Tỉnh/Thành phố"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Check
              type="checkbox"
              label="Đặt làm địa chỉ mặc định"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddAddress} disabled={loading}>
            {loading ? 'Đang thêm...' : 'Thêm địa chỉ'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}