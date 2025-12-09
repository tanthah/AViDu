// frontend/src/pages/Wishlist.jsx
import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../redux/wishlistSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { wishlist, loading, error } = useSelector((s) => s.wishlist);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, token, navigate]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
    } catch (err) {
      alert(err);
    }
  };

  if (loading) {
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

  return (
    <>
      <Header />
      <Container className="py-4">
        <h2 className="mb-4">
          <i className="bi bi-heart me-2"></i>
          Sản phẩm yêu thích ({wishlist?.products?.length || 0})
        </h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {!wishlist || wishlist.products.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-heart" style={{ fontSize: '5rem', color: '#ccc' }}></i>
            <h4 className="mt-3">Chưa có sản phẩm yêu thích</h4>
            <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <Row className="g-3">
            {wishlist.products.map((item) => (
              <Col key={item._id} xs={6} sm={6} md={4} lg={3}>
                <Card className="h-100">
                  <Card.Img 
                    variant="top" 
                    src={item.productId?.images?.[0]} 
                    style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${item.productId._id}`)}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="small" style={{ height: '40px', overflow: 'hidden' }}>
                      {item.productId?.name}
                    </Card.Title>
                    <div className="text-danger fw-bold mb-2">
                      {item.productId?.finalPrice?.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="w-100 mb-2"
                        onClick={() => handleRemove(item.productId._id)}
                      >
                        <i className="bi bi-heart-fill me-1"></i>
                        Bỏ yêu thích
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      <Footer />
    </>
  );
}