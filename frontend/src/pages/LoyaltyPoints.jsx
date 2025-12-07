// frontend/src/pages/LoyaltyPoints.jsx
export function LoyaltyPoints() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { loyaltyPoints, history, loading } = useSelector((s) => s.loyalty);
  const { coupons } = useSelector((s) => s.coupon);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchLoyaltyPoints());
    dispatch(fetchPointsHistory({ page: 1, limit: 20 }));
    dispatch(fetchUserCoupons('active'));
  }, [dispatch, token, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
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
          <i className="bi bi-coin me-2"></i>
          Điểm tích lũy & Ưu đãi
        </h2>

        {/* Points Summary */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center bg-primary text-white">
              <Card.Body>
                <h3>{loyaltyPoints?.availablePoints || 0}</h3>
                <small>Điểm khả dụng</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <h3>{loyaltyPoints?.totalPoints || 0}</h3>
                <small>Tổng điểm tích lũy</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-warning text-white">
              <Card.Body>
                <h3>{coupons?.length || 0}</h3>
                <small>Mã giảm giá</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Coupons */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-ticket-perforated me-2"></i>
              Mã giảm giá của tôi
            </h5>
          </Card.Header>
          <Card.Body>
            {coupons && coupons.length > 0 ? (
              <Row>
                {coupons.map((coupon) => (
                  <Col key={coupon._id} md={6} className="mb-3">
                    <Card className="border-success">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{coupon.code}</h5>
                            <p className="mb-1">
                              Giảm {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value.toLocaleString('vi-VN')}đ`}
                            </p>
                            <small className="text-muted">
                              HSD: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                            </small>
                          </div>
                          <Button variant="outline-primary" size="sm">
                            Sao chép
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted text-center">Bạn chưa có mã giảm giá nào</p>
            )}
          </Card.Body>
        </Card>

        {/* Points History */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Lịch sử điểm
            </h5>
          </Card.Header>
          <Card.Body>
            {history && history.length > 0 ? (
              <div>
                {history.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                      <strong>{item.description}</strong>
                      <div className="text-muted small">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className={`fw-bold ${item.type === 'earn' ? 'text-success' : 'text-danger'}`}>
                      {item.type === 'earn' ? '+' : '-'}{Math.abs(item.points)} điểm
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center">Chưa có lịch sử điểm</p>
            )}
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
