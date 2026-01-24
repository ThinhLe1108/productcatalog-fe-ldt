import './ManagerProduct.css';
import axios from 'axios';

const ManagerProduct = ({
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  stockQuantity,
  setStockQuantity,
  categoryId,
  setCategoryId,
  image,
  setImage,
  categories,

  editing,          // boolean (khuyên truyền !!prodEditing)
  startCreate,      // reset form
  loading,
  setLoading,
  message,
  setMessage,

  productId,        // id khi update
  existingImageUrl, // url ảnh cũ khi update
  fetchProducts,
}) => {
  // ====== ENDPOINTS ======
  const CREATE_PRODUCT_URL = '/api/admin/products';                 // POST multipart
  const UPLOAD_IMAGE_URL = '/api/admin/products/upload-image';      // POST multipart -> {imageUrl}
  const UPDATE_PRODUCT_URL = (id) => `/api/admin/products/${id}`;   // PUT json

  // ====== AUTH ======
  const getAuthHeader = () => {
    const rawToken = localStorage.getItem('token') || '';
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isFile = (v) =>
    v &&
    typeof v === 'object' &&
    typeof v.name === 'string' &&
    typeof v.size === 'number' &&
    typeof v.type === 'string';

  const getBeMessage = (err) => {
    const data = err?.response?.data;
    return (
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.defaultMessage ||
      (typeof data === 'string' ? data : null)
    );
  };

  // ====== UPLOAD IMAGE FOR UPDATE ======
  const uploadImageAndGetUrl = async (file) => {
    const fd = new FormData();
    fd.append('image', file); // BE: @RequestParam("image")

    const res = await axios.post(UPLOAD_IMAGE_URL, fd, {
      headers: {
        ...getAuthHeader(),
      },
    });

    return res.data?.imageUrl || '';
  };

  // ====== CREATE PRODUCT (multipart) ======
  const handleCreate = async () => {
    try {
      setLoading?.(true);
      setMessage?.('');

      const n = (name || '').trim();
      const p = Number(price);
      const q = Number(stockQuantity);

      if (!n) return setMessage?.('Tên sản phẩm không được trống.');
      if (!Number.isFinite(p) || p < 0) return setMessage?.('Giá không hợp lệ.');
      if (!Number.isInteger(q) || q < 0) return setMessage?.('Số lượng không hợp lệ.');
      if (!categoryId) return setMessage?.('Vui lòng chọn danh mục.');
      if (!isFile(image)) return setMessage?.('Vui lòng chọn ảnh.');

      const fd = new FormData();
      // các key phải trùng tên field trong ProductRequest
      fd.append('name', n);
      fd.append('description', (description || '').trim());
      fd.append('price', String(p));
      fd.append('stockQuantity', String(q));
      fd.append('categoryId', String(Number(categoryId)));
      fd.append('image', image); // key 'image' theo BE

      await axios.post(CREATE_PRODUCT_URL, fd, {
        headers: {
          ...getAuthHeader(),
        },
      });

      setMessage?.('Tạo sản phẩm thành công');
      await fetchProducts?.();
      startCreate?.();
      setImage?.(null);
    } catch (err) {
      console.error('Create error:', err?.response?.data || err);
      setMessage?.(getBeMessage(err) || 'Tạo sản phẩm thất bại');
    } finally {
      setLoading?.(false);
    }
  };

  // ====== UPDATE PRODUCT (upload-image -> PUT json) ======
  const handleUpdate = async () => {
    try {
      setLoading?.(true);
      setMessage?.('');

      if (!productId) return setMessage?.('Thiếu productId để cập nhật.');

      const n = (name || '').trim();
      const p = Number(price);
      const q = Number(stockQuantity);

      if (!n) return setMessage?.('Tên sản phẩm không được trống.');
      if (!Number.isFinite(p) || p < 0) return setMessage?.('Giá không hợp lệ.');
      if (!Number.isInteger(q) || q < 0) return setMessage?.('Số lượng không hợp lệ.');
      if (!categoryId) return setMessage?.('Vui lòng chọn danh mục.');

      let imageUrlToSave = existingImageUrl || '';

      if (isFile(image)) {
        const uploadedUrl = await uploadImageAndGetUrl(image);
        if (!uploadedUrl) return setMessage?.('Upload ảnh thất bại (không nhận được imageUrl).');
        imageUrlToSave = uploadedUrl;
      }

      const payload = {
        name: n,
        description: (description || '').trim() || null,
        price: p,
        stockQuantity: q,
        categoryId: Number(categoryId),
        imageUrl: imageUrlToSave,
      };

      await axios.put(UPDATE_PRODUCT_URL(productId), payload, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      setMessage?.('Cập nhật thành công');
      await fetchProducts?.();
      startCreate?.();
      setImage?.(null);
    } catch (err) {
      console.error('Update error:', err?.response?.data || err);
      setMessage?.(getBeMessage(err) || 'Cập nhật thất bại');
    } finally {
      setLoading?.(false);
    }
  };

  return (
    <div className="mp-wrap">
      <div className="mp-card">
        <div className="mp-top">
          <div>
            <h3 className="mp-title">Quản lý sản phẩm</h3>
            <div className="mp-subtitle">Tạo hoặc chỉnh sửa sản phẩm.</div>
          </div>
          <div className="mp-top-actions">
            <button className="mp-btn tiny" onClick={startCreate} type="button">
              Tạo mới
            </button>
          </div>
        </div>

        <div className="mp-form">
          <div className="mp-form-row">
            <div className="mp-field">
              <label>Tên sản phẩm *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mp-field">
              <label>Giá *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="mp-form-row">
            <div className="mp-field">
              <label>Số lượng *</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
            <div className="mp-field">
              <label>Danh mục *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mp-field">
            <label>Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          <div className="mp-field">
            <label>Ảnh {editing ? '' : '*'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            {isFile(image) && <small className="mp-file-name">{image.name}</small>}

            {editing && !isFile(image) && existingImageUrl && (
              <small className="mp-file-name">Ảnh hiện tại: {existingImageUrl}</small>
            )}
          </div>

          <div className="mp-form-actions">
            {editing ? (
              <button
                className="mp-btn primary"
                onClick={handleUpdate}
                disabled={loading}
                type="button"
              >
                {loading ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            ) : (
              <button
                className="mp-btn primary"
                onClick={handleCreate}
                disabled={loading}
                type="button"
              >
                {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </button>
            )}

            {message && (
              <div className={`mp-alert ${message.includes('thành công') ? 'ok' : 'err'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="mp-note">
          <small>Danh sách sản phẩm hiển thị ở phần dưới.</small>
        </div>
      </div>
    </div>
  );
};

export default ManagerProduct;
