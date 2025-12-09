// frontend/src/pages/admin/AdminProducts.jsx
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import adminProductApi from '../../api/admin/adminProductApi';
import categoryApi from '../../api/admin/adminCategoryApi';
import MediaUpload from '../../components/admin/MediaUpload';
import './css/AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount: 0,
    stock: '',
    categoryId: '',
    brand: '',
    attributes: {},
    isActive: true,
  });
  
  const [media, setMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        adminProductApi.getAllProducts(),
        categoryApi.getAll()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        discount: product.discount || 0,
        stock: product.stock,
        categoryId: product.categoryId?._id || '',
        brand: product.brand || '',
        attributes: product.attributes || {},
        isActive: product.isActive,
      });
      setMedia(product.images?.map(url => ({ url, type: 'image' })) || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        discount: 0,
        stock: '',
        categoryId: '',
        brand: '',
        attributes: {},
        isActive: true,
      });
      setMedia([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    if (media.length === 0) {
      setError('Vui lòng tải lên ít nhất 1 hình ảnh');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'attributes') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append media files
      media.forEach((item, index) => {
        if (item.file) {
          formDataToSend.append('media', item.file);
        } else if (item.url) {
          // Existing media (for update)
          formDataToSend.append('existingMedia', item.url);
        }
      });

      if (editingProduct) {
        await adminProductApi.updateProduct(editingProduct._id, formDataToSend);
        setSuccess('Cập nhật sản phẩm thành công!');
      } else {
        await adminProductApi.createProduct(formDataToSend);
        setSuccess('Thêm sản phẩm thành công!');
      }
      
      await loadData();
      handleCloseModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await adminProductApi.deleteProduct(id);
      setSuccess('Xóa sản phẩm thành công!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminProductApi.toggleProductStatus(id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      {/* Header */}
      <div className="page-header mb-4">
        <div>
          <h2>Quản lý sản phẩm</h2>
          <p className="text-muted">Tổng số: {products.length} sản phẩm</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Products Table */}
      <div className="card">
        <Table responsive hover>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Giảm giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th style={{ width: '150px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  <img 
                    src={product.images?.[0] || '/placeholder.jpg'} 
                    alt={product.name}
                    className="product-thumb"
                  />
                </td>
                <td>
                  <strong>{product.name}</strong>
                  <br />
                  <small className="text-muted">{product.brand}</small>
                </td>
                <td>{product.categoryId?.name}</td>
                <td>
                  <strong className="text-danger">
                    {product.finalPrice?.toLocaleString('vi-VN')}đ
                  </strong>
                  {product.discount > 0 && (
                    <>
                      <br />
                      <small className="text-muted text-decoration-line-through">
                        {product.price?.toLocaleString('vi-VN')}đ
                      </small>
                    </>
                  )}
                </td>
                <td>
                  {product.discount > 0 && (
                    <Badge bg="danger">-{product.discount}%</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                    {product.stock}
                  </Badge>
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={product.isActive}
                    onChange={() => handleToggleStatus(product._id)}
                  />
                </td>
                <td>
                  <div className="btn-group-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleOpenModal(product)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Product Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <h6 className="mb-3">Thông tin cơ bản</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="slug-san-pham"
                required
              />
              <Form.Text className="text-muted">
                Tự động tạo từ tên sản phẩm
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết sản phẩm"
              />
            </Form.Group>

            {/* Pricing */}
            <h6 className="mb-3 mt-4">Giá & Tồn kho</h6>
            
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Giá gốc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="100000"
                    required
                    min="0"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Tồn kho <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                    min="0"
                  />
                </Form.Group>
              </div>
            </div>

            {/* Category & Brand */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Thương hiệu</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Apple, Samsung..."
                  />
                </Form.Group>
              </div>
            </div>

            {/* Media Upload */}
            <h6 className="mb-3 mt-4">Hình ảnh & Video</h6>
            <MediaUpload
              media={media}
              onMediaChange={setMedia}
              maxFiles={10}
              acceptVideo={true}
            />

            {/* Status */}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                name="isActive"
                label="Hiển thị sản phẩm"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <i className="bi bi-check me-2"></i>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}