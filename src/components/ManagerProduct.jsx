import { useEffect, useState } from "react";
import "./ManagerProduct.css";
import axios from "axios";

const ManagerProduct = ({
  apiBaseUrl,
  token,
  categories,

  editingProduct,      // object hoặc null
  clearEditing,        // () => void

  deleteRequestId,     // id hoặc null
  clearDeleteRequest,  // () => void

  onChanged,           // () => reload products
}) => {
  // Form state (đặt trong manager luôn)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ====== ENDPOINTS ======
  const CREATE_PRODUCT_URL = `${apiBaseUrl}/api/admin/products`; // POST multipart
  const UPLOAD_IMAGE_URL = `${apiBaseUrl}/api/admin/products/upload-image`; // POST multipart -> {imageUrl}
  const UPDATE_PRODUCT_URL = (id) => `${apiBaseUrl}/api/admin/products/${encodeURIComponent(id)}`; // PUT json
  const DELETE_PRODUCT_URL = (id) => `${apiBaseUrl}/api/admin/products/${encodeURIComponent(id)}`; // DELETE

  const getAuthHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const isFile = (v) =>
    v &&
    typeof v === "object" &&
    typeof v.name === "string" &&
    typeof v.size === "number" &&
    typeof v.type === "string";

  const getBeMessage = (err) => {
    const data = err?.response?.data;
    return (
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.defaultMessage ||
      (typeof data === "string" ? data : null)
    );
  };

  const startCreate = () => {
    clearEditing?.();
    setName("");
    setDescription("");
    setPrice("");
    setStockQuantity("");
    setCategoryId("");
    setImage(null);
    setMessage("");
  };

  // Đổ form khi HomePage bấm "Sửa" ở card
  useEffect(() => {
    if (!editingProduct) return;
    setName(editingProduct.name || "");
    setDescription(editingProduct.description || "");
    setPrice(editingProduct.price ?? "");
    setStockQuantity(editingProduct.stockQuantity ?? "");
    setCategoryId(editingProduct.categoryId ?? "");
    setImage(null);
    setMessage("");
  }, [editingProduct]);

  const uploadImageAndGetUrl = async (file) => {
    const fd = new FormData();
    fd.append("image", file);

    const res = await axios.post(UPLOAD_IMAGE_URL, fd, {
      headers: {
        ...getAuthHeader(),
      },
    });

    return res.data?.imageUrl || "";
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setMessage("");

      const n = (name || "").trim();
      const p = Number(price);
      const q = Number(stockQuantity);

      if (!n) return setMessage("Tên sản phẩm không được trống.");
      if (!Number.isFinite(p) || p <= 0 || price.trim()=="") return setMessage("Giá không hợp lệ.");
      if (!Number.isInteger(q) || q < 0) return setMessage("Số lượng không hợp lệ.");
      if (!categoryId) return setMessage("Vui lòng chọn danh mục.");
      if (!isFile(image)) return setMessage("Vui lòng chọn ảnh.");

      const fd = new FormData();
      fd.append("name", n);
      fd.append("description", (description || "").trim());
      fd.append("price", String(p));
      fd.append("stockQuantity", String(q));
      fd.append("categoryId", String(Number(categoryId)));
      fd.append("image", image);

      await axios.post(CREATE_PRODUCT_URL, fd, {
        headers: {
          ...getAuthHeader(),
        },
      });

      setMessage("Tạo sản phẩm thành công");
      await onChanged?.();
      startCreate();
    } catch (err) {
      console.error("Create error:", err?.response?.data || err);
      setMessage(getBeMessage(err) || "Tạo sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setMessage("");

      const productId = editingProduct?.id;
      if (!productId) return setMessage("Thiếu productId để cập nhật.");

      const n = (name || "").trim();
      const p = Number(price);
      const q = Number(stockQuantity);

      if (!n) return setMessage("Tên sản phẩm không được trống.");
      if (!Number.isFinite(p) || p <= 0 || price.trim()=="") return setMessage("Giá không hợp lệ.");
      if (!Number.isInteger(q) || q < 0) return setMessage("Số lượng không hợp lệ.");
      if (!categoryId) return setMessage("Vui lòng chọn danh mục.");

      let imageUrlToSave = editingProduct?.imageUrl || "";

      if (isFile(image)) {
        const uploadedUrl = await uploadImageAndGetUrl(image);
        if (!uploadedUrl) return setMessage("Upload ảnh thất bại (không nhận được imageUrl).");
        imageUrlToSave = uploadedUrl;
      }

      const payload = {
        name: n,
        description: (description || "").trim() || null,
        price: p,
        stockQuantity: q,
        categoryId: Number(categoryId),
        imageUrl: imageUrlToSave,
      };

      await axios.put(UPDATE_PRODUCT_URL(productId), payload, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      setMessage("Cập nhật thành công");
      await onChanged?.();
      startCreate();
    } catch (err) {
      console.error("Update error:", err?.response?.data || err);
      setMessage(getBeMessage(err) || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setMessage("");

      await axios.delete(DELETE_PRODUCT_URL(id), {
        headers: { ...getAuthHeader() },
      });

      setMessage("Xóa thành công");
      await onChanged?.();

      if (editingProduct?.id === id) startCreate();
    } catch (err) {
      console.error("Delete error:", err?.response?.data || err);
      setMessage(getBeMessage(err) || "Xoá thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Auto-handle delete request từ HomePage
  useEffect(() => {
    if (!deleteRequestId) return;
    handleDelete(deleteRequestId).finally(() => clearDeleteRequest?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteRequestId]);

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
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          <div className="mp-form-row">
            <div className="mp-field">
              <label>Số lượng </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
            <div className="mp-field">
              <label>Danh mục *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
          </div>

          <div className="mp-field">
            <label>Ảnh {editingProduct ? "" : "*"}</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />

            {isFile(image) && <small className="mp-file-name">{image.name}</small>}

            {editingProduct && !isFile(image) && editingProduct?.imageUrl && (
              <small className="mp-file-name">Ảnh hiện tại: {editingProduct.imageUrl}</small>
            )}
          </div>

          <div className="mp-form-actions">
            {editingProduct ? (
              <button className="mp-btn primary" onClick={handleUpdate} disabled={loading} type="button">
                {loading ? "Đang lưu..." : "Cập nhật"}
              </button>
            ) : (
              <button className="mp-btn primary" onClick={handleCreate} disabled={loading} type="button">
                {loading ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
            )}

            {message && (
              <div className={`mp-alert ${message.includes("thành công") ? "ok" : "err"}`}>
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
