// frontend/src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import orderApi from '../api/orderApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Orders.css';

export default function Orders() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [token, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders();
      setOrders(response.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'Chờ xử lý' },
      paid: { bg: 'info', text: 'Đã thanh toán' },
      shipping: { bg: 'primary', text: 'Đang giao' },
      completed: { bg: 'success', text: 'Hoàn thành' },
      cancelled: { bg: 'danger', text: 'Đã hủy' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      unpaid: { bg: 'warning', text: 'Chưa thanh toán' },
      paid: { bg: 'success', text: 'Đã thanh toán' },
      refunded: { bg: 'secondary', text: 'Đã hoàn tiền' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải đơn hàng...</p>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-4 orders-page">
        <h2 className="mb-4">
          <i className="bi bi-box-seam me-2"></i>
          Đơn hàng của tôi
        </h2>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '5rem', color: '#ccc' }}></i>
            <h4 className="mt-3">Bạn chưa có đơn hàng nào</h4>
            <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
              <i className="bi bi-arrow-left me-2"></i>
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            {orders.map((order) => (
              <Card key={order._id} className="mb-3 order-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Mã đơn: {order.orderCode}</strong>
                    <span className="text-muted ms-3">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                    <span className="ms-2">{getPaymentStatusBadge(order.paymentStatus)}</span>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="order-items mb-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item._id} className="d-flex align-items-center mb-2">
                        <img 
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/60'} 
                          alt={item.productId?.name || 'Product'}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div className="flex-grow-1 ms-3">
                          <div>{item.productId?.name || 'Sản phẩm đã bị xóa'}</div>
                          <small className="text-muted">
                            x{item.quantity} | {item.price.toLocaleString('vi-VN')}đ
                          </small>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <small className="text-muted">
                        và {order.items.length - 2} sản phẩm khác...
                      </small>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Tổng tiền:</strong>{' '}
                      <span className="text-danger fs-5">
                        {order.totalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}