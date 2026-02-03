import { useEffect, useRef, useState } from "react";
import "./ManagerCategory.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ManagerCategory = ({
  token,

  editingCategory,     // object hoặc null
  clearEditing,        // () => void

  deleteRequestId,     // id hoặc null
  clearDeleteRequest,  // () => void

  onChanged,           // () => reload categories
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert state tách riêng
  const [alert, setAlert] = useState({ type: "", text: "" });
  const alertTimerRef = useRef(null);

  const getAuthHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const clearAlert = () => setAlert({ type: "", text: "" });

  const showAlert = (type, text) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);

    setAlert({ type, text });

    alertTimerRef.current = setTimeout(() => {
      setAlert({ type: "", text: "" });
      alertTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  const startCreate = (options = { keepAlert: false }) => {
    clearEditing?.();
    setName("");

    if (!options.keepAlert) clearAlert();
  };

  // Đổ form khi HomePage chọn "Sửa"
  useEffect(() => {
    if (!editingCategory) return;
    setName(editingCategory.name || "");
    clearAlert();
  }, [editingCategory]);

  const validateName = () => {
    if (!name || name.trim() === "") {
      showAlert("err", "Tên danh mục không được để trống");
      return false;
    }
    return true;
  };

  const createCategory = async () => {
    if (!validateName()) return;

    setLoading(true);
    clearAlert();
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error((await res.text()) || "Tạo thất bại");

      showAlert("ok", "Tạo thành công");
      await onChanged?.();
      startCreate({ keepAlert: true });
    } catch (e) {
      showAlert("err", e.message || "Lỗi tạo");
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async () => {
    if (!editingCategory?.id) return;
    if (!validateName()) return;

    setLoading(true);
    clearAlert();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/categories/id/${encodeURIComponent(editingCategory.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ name: name.trim() }),
        }
      );

      if (!res.ok) throw new Error((await res.text()) || "Cập nhật thất bại");

      showAlert("ok", "Cập nhật thành công");
      await onChanged?.();
      startCreate({ keepAlert: true });
    } catch (e) {
      showAlert("err", e.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!id) return;
    setLoading(true);
    clearAlert();
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/id/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!res.ok) throw new Error((await res.text()) || "Xoá thất bại");

      showAlert("ok", "Xóa thành công");
      await onChanged?.();

      if (editingCategory?.id === id) startCreate({ keepAlert: true });
    } catch (e) {
      showAlert("err", e.message || "Lỗi xoá");
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

          {/* TÁCH RIÊNG: Actions và Alert */}
          <div className="mc-footer">
            <div className="mc-form-actions">
              {editingCategory ? (
                <button
                  className="mc-btn primary"
                  onClick={updateCategory}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Đang lưu..." : "Cập nhật"}
                </button>
              ) : (
                <button
                  className="mc-btn primary"
                  onClick={createCategory}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Đang tạo..." : "Tạo"}
                </button>
              )}
            </div>

            <div className="mc-alert-slot" aria-live="polite">
              {alert.text ? (
                <div className={`mc-alert ${alert.type === "ok" ? "ok" : "err"}`}>
                  {alert.text}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCategory;