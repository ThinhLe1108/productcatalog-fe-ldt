import './ManagerCategory.css';

const ManagerCategory = ({
    name,
    setName,
    description,
    setDescription,
    editing,
    startCreate,
    createCategory,
    updateCategory,
    loading,
    message,
}) => {
    return (
        <div className="mc-wrap">
            <div className="mc-card">
                <div className="mc-top">
                    <div>
                        <h3 className="mc-title">Quản lý danh mục</h3>
                        <div className="mc-subtitle">Tạo hoặc chỉnh sửa danh mục.</div>
                    </div>
                    <div className="mc-top-actions">
                        <button className="mc-btn tiny" onClick={startCreate}>Tạo mới</button>
                    </div>
                </div>

                <div className="mc-form">
                    <div className="mc-form-row">
                        <div className="mc-field">
                            <label>Tên danh mục</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mc-field">
                            <label>Mô tả</label>
                            <input value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>

                    <div className="mc-form-actions">
                        {editing ? (
                            <button className="mc-btn primary" onClick={updateCategory} disabled={loading}>Cập nhật</button>
                        ) : (
                            <button className="mc-btn primary" onClick={createCategory} disabled={loading}>Tạo</button>
                        )}
                        {message && (
                            <div className={`mc-alert ${message.includes('thành công') ? 'ok' : 'err'}`}>{message}</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManagerCategory;
