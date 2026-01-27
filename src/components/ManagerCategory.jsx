import { useEffect, useState } from "react";
import "./ManagerCategory.css";

const ManagerCategory = ({
  apiBaseUrl,
  token,

  editingCategory,     // object hoặc null
  clearEditing,        // () => void

  deleteRequestId,     // id hoặc null
  clearDeleteRequest,  // () => void

  onChanged,           // () => reload categories
}) => {
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getAuthHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const startCreate = () => {
    clearEditing?.();
    setName("");
    setMessage("");
  };

  // Đổ form khi HomePage chọn "Sửa"
  useEffect(() => {
    if (!editingCategory) return;
    setName(editingCategory.name || "");
    setMessage("");
  }, [editingCategory]);

  const createCategory = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/categories/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ name}),
      });
      if (!res.ok) throw new Error((await res.text()) || "Tạo thất bại");

      setMessage("Tạo thành công");
      await onChanged?.();
      startCreate();
    } catch (e) {
      setMessage(e.message || "Lỗi tạo");
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async () => {
    if (!editingCategory?.id) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/categories/id/${encodeURIComponent(editingCategory.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ name}),
        }
      );
      if (!res.ok) throw new Error((await res.text()) || "Cập nhật thất bại");

      setMessage("Cập nhật thành công");
      await onChanged?.();
      startCreate();
    } catch (e) {
      setMessage(e.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!id) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/categories/id/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      if (!res.ok) throw new Error((await res.text()) || "Xoá thất bại");

      setMessage("Xóa thành công");
      await onChanged?.();

      if (editingCategory?.id === id) startCreate();
    } catch (e) {
      setMessage(e.message || "Lỗi xoá");
    } finally {
      setLoading(false);
    }
  };

  // Auto-handle delete request từ HomePage
  useEffect(() => {
    if (!deleteRequestId) return;
    deleteCategory(deleteRequestId).finally(() => clearDeleteRequest?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteRequestId]);

  return (
    <div className="mc-wrap">
      <div className="mc-card">
        <div className="mc-top">
          <div>
            <h3 className="mc-title">Quản lý danh mục</h3>
            <div className="mc-subtitle">Tạo hoặc chỉnh sửa danh mục.</div>
          </div>
          <div className="mc-top-actions">
            <button className="mc-btn tiny" onClick={startCreate} type="button">
              Tạo mới
            </button>
          </div>
        </div>

        <div className="mc-form">
          <div className="mc-form-row">
            <div className="mc-field">
              <label>Tên danh mục</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="mc-form-actions">
            {editingCategory ? (
              <button className="mc-btn primary" onClick={updateCategory} disabled={loading} type="button">
                {loading ? "Đang lưu..." : "Cập nhật"}
              </button>
            ) : (
              <button className="mc-btn primary" onClick={createCategory} disabled={loading} type="button">
                {loading ? "Đang tạo..." : "Tạo"}
              </button>
            )}

            {message && (
              <div className={`mc-alert ${message.includes("thành công") ? "ok" : "err"}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCategory;
