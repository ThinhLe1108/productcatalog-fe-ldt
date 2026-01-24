import { useEffect, useMemo, useState } from "react";
import "./HomePage.css";
import reactLogo from "../assets/react.svg";
import ManagerCategory from "../components/ManagerCategory";
import ManagerProduct from "../components/ManagerProduct";


const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [errorCategories, setErrorCategories] = useState("");
    const [errorProducts, setErrorProducts] = useState("");

    // Chuẩn hóa token - loại bỏ prefix "Bearer " nếu có
    const rawToken = localStorage.getItem("token") || "";
    const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        setName(localStorage.getItem("fullName") || "");
        setRole(localStorage.getItem("roleName") || "");
    }, []);




    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        setErrorCategories("");
        try {
            const res = await fetch("/api/categories", {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error((await res.text()) || "Không lấy được category");
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (e) {
            setErrorCategories(e.message || "Lỗi tải category");
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => { fetchCategories(); }, [token]);

    // Quản lí danh mục state
    const [managerTab, setManagerTab] = useState('category'); // 'category' hoặc 'product'

    // Manager form state (lifted up so sidebar can trigger edits)
    const [mgrName, setMgrName] = useState('');
    const [mgrDescription, setMgrDescription] = useState('');
    const [editing, setEditing] = useState(null);
    const [mgrLoading, setMgrLoading] = useState(false);
    const [mgrMessage, setMgrMessage] = useState('');

    // Product form state
    const [prodName, setProdName] = useState('');
    const [prodDescription, setProdDescription] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodStockQuantity, setProdStockQuantity] = useState('');
    const [prodCategoryId, setProdCategoryId] = useState('');
    const [prodImage, setProdImage] = useState(null);
    const [prodEditing, setProdEditing] = useState(null);
    const [prodLoading, setProdLoading] = useState(false);
    const [prodMessage, setProdMessage] = useState('');

    const startCreate = () => {
        setEditing(null);
        setMgrName('');
        setMgrDescription('');
        setMgrMessage('');
    };

    const startEdit = (c) => {
        setEditing(c);
        setMgrName(c.name || '');
        setMgrDescription(c.description || '');
        setMgrMessage('');
    };

    const createCategory = async () => {
        setMgrLoading(true);
        setMgrMessage('');
        try {
            const res = await fetch('/api/categories/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ name: mgrName, description: mgrDescription }),
            });
            if (!res.ok) throw new Error((await res.text()) || 'Tạo thất bại');
            setMgrMessage('Tạo thành công');
            await fetchCategories();
            startCreate();
        } catch (e) {
            setMgrMessage(e.message || 'Lỗi tạo');
        } finally {
            setMgrLoading(false);
        }
    };

    const updateCategory = async () => {
        if (!editing) return;
        setMgrLoading(true);
        setMgrMessage('');
        try {
            const res = await fetch(`/api/categories/id/${encodeURIComponent(editing.id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ name: mgrName, description: mgrDescription }),
            });
            if (!res.ok) throw new Error((await res.text()) || 'Cập nhật thất bại');
            setMgrMessage('Cập nhật thành công');
            await fetchCategories();
            startCreate();
        } catch (e) {
            setMgrMessage(e.message || 'Lỗi cập nhật');
        } finally {
            setMgrLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return;
        try {
            const res = await fetch(`/api/categories/id/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error((await res.text()) || 'Xoá thất bại');
            await fetchCategories();
            // if deleted currently editing item, reset form
            if (editing && editing.id === id) startCreate();
        } catch (e) {
            alert(e.message || 'Lỗi xoá');
        }
    };

    // Product management handlers
    const startCreateProduct = () => {
        setProdEditing(null);
        setProdName('');
        setProdDescription('');
        setProdPrice('');
        setProdStockQuantity('');
        setProdCategoryId('');
        setProdImage(null);
        setProdMessage('');
    };

    const startEditProduct = (p) => {
        setProdEditing(p);
        setProdName(p.name || '');
        setProdDescription(p.description || '');
        setProdPrice(p.price || '');
        setProdStockQuantity(p.stockQuantity || '');
        setProdCategoryId(p.categoryId || '');
        setProdImage(null);
        setProdMessage('');
    };

    const fetchProducts = async () => {
        setLoadingProducts(true);
        setErrorProducts("");
        try {
            let url = "/api/products";
            if (selectedCategoryId != null) {
                url = `/api/products/category/${encodeURIComponent(selectedCategoryId)}`;
            }

            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error((await res.text()) || "Không lấy được product");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (e) {
            setErrorProducts(e.message || "Lỗi tải product");
        } finally {
            setLoadingProducts(false);
        }
    };

    // createProduct và updateProduct đã được chuyển sang ManagerProduct component

    const deleteProduct = async (id) => {
        if (!confirm('Bạn có chắc muốn xoá sản phẩm này?')) return;
        try {
            const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error((await res.text()) || 'Xoá thất bại');
            await fetchProducts();
            if (prodEditing && prodEditing.id === id) startCreateProduct();
        } catch (e) {
            alert(e.message || 'Lỗi xoá');
        }
    };

    useEffect(() => { fetchProducts(); }, [token, selectedCategoryId]);


    const sortedProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        const inStock = products.filter((p) => !p.outOfStock);
        const outStock = products.filter((p) => p.outOfStock);
        return [...inStock, ...outStock];
    }, [products]);



    return (
        <div className="hp-page">
            {/* HEADER */}
            <header className="hp-header">
                <div className="hp-header-left" />

                <div className="hp-header-center">
                    <img className="hp-logo" src={reactLogo} alt="React logo" />
                    <span className="hp-brand">Catalog</span>
                </div>

                <div className="hp-header-right">
                    {name ? (
                        <div className="hp-greeting">Xin Chào {name}</div>
                    ) : null}

                    <button className="hp-logout" onClick={logout}>
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* BODY */}
            <div className="hp-body">
                {/* CATEGORY */}
                <aside className="hp-sidebar">
                    <div className="hp-sidebar-title">Danh mục</div>

                    <button
                        className={`hp-cat-btn ${selectedCategoryId === null ? "active" : ""}`}
                        onClick={() => setSelectedCategoryId(null)}
                    >
                        Tất cả sản phẩm
                    </button>

                    {loadingCategories && <div className="hp-info">Đang tải danh mục...</div>}
                    {errorCategories && <div className="hp-error">{errorCategories}</div>}

                    {!loadingCategories && !errorCategories && categories.length === 0 && (
                        <div className="hp-info">Chưa có danh mục nào.</div>
                    )}

                    <div className="hp-cat-list">
                        {categories.map((c) => (
                            <div key={c.id} className={`hp-cat-item ${selectedCategoryId === c.id ? "active" : ""}`}>

                                <button
                                    className="hp-cat-select"
                                    onClick={() => setSelectedCategoryId(c.id)}
                                    title={c.description || ""}
                                >
                                    <div className="hp-cat-name">{c.name}</div>
                                    {c.description ? <div className="hp-cat-desc">{c.description}</div> : null}
                                </button>

                                {role === 'ADMIN' && (
                                    <div className="hp-cat-actions">
                                        <button
                                            className="hp-cat-action edit"
                                            onClick={(e) => { e.stopPropagation();setManagerTab('category'); startEdit(c); }}
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            className="hp-cat-action delete"
                                            onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* PRODUCTS */}
                <main className="hp-main">
                    {/* Manager UI only visible to ADMIN */}
                    {role === 'ADMIN' && (
                        <div className="hp-manager-tabs">
                            <button 
                                className={`hp-tab ${managerTab === 'category' ? 'active' : ''}`}
                                onClick={() => setManagerTab('category')}
                            >
                                Quản lý Danh mục
                            </button>
                            <button 
                                className={`hp-tab ${managerTab === 'product' ? 'active' : ''}`}
                                onClick={() => setManagerTab('product')}
                            >
                                Quản lý Sản phẩm
                            </button>
                        </div>
                    )}

                    {role === 'ADMIN' && managerTab === 'category' && (
                        <ManagerCategory
                            name={mgrName}
                            setName={setMgrName}
                            description={mgrDescription}
                            setDescription={setMgrDescription}
                            editing={editing}
                            startCreate={startCreate}
                            createCategory={createCategory}
                            updateCategory={updateCategory}
                            loading={mgrLoading}
                            message={mgrMessage}
                        />
                    )}

                    {role === 'ADMIN' && managerTab === 'product' && (
                        <ManagerProduct
                            name={prodName}
                            setName={setProdName}
                            description={prodDescription}
                            setDescription={setProdDescription}
                            price={prodPrice}
                            setPrice={setProdPrice}
                            stockQuantity={prodStockQuantity}
                            setStockQuantity={setProdStockQuantity}
                            categoryId={prodCategoryId}
                            setCategoryId={setProdCategoryId}
                            image={prodImage}
                            setImage={setProdImage}
                            categories={categories}
                            editing={!!prodEditing}
                            productId={prodEditing?.id}
                            existingImageUrl={prodEditing?.imageUrl}
                            startCreate={startCreateProduct}
                            loading={prodLoading}
                            setLoading={setProdLoading}
                            message={prodMessage}
                            setMessage={setProdMessage}
                            fetchProducts={fetchProducts}
                        />
                    )}
                    {/* Top tools (optional: search/sort sau này) */}
                    <div className="hp-main-top">
                        <div className="hp-main-heading">Sản phẩm</div>
                        <div className="hp-main-count">
                            {loadingProducts ? "..." : `${sortedProducts.length} sản phẩm`}
                        </div>
                    </div>

                    {loadingProducts && <div className="hp-info">Đang tải sản phẩm...</div>}
                    {errorProducts && <div className="hp-error">{errorProducts}</div>}

                    {!loadingProducts && !errorProducts && sortedProducts.length === 0 && (
                        <div className="hp-empty">
                            Không có sản phẩm nào trong danh mục này.
                        </div>
                    )}

                    <div className="hp-grid">
                        {sortedProducts.map((p) => (
                            <div className={`hp-card ${p.outOfStock ? "out-of-stock" : ""}`} key={p.id}>
                                <div className="hp-card-img">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.name} />
                                    ) : (
                                        <div className="hp-noimg">No Image</div>
                                    )}
                                </div>

                                <div className="hp-card-body">
                                    <div className="hp-card-title" title={p.name}>
                                        {p.name}
                                    </div>
                                    <div className="hp-card-meta">
                                        <span className="hp-chip">{p.categoryName || "No category"}</span>
                                        <span className={`hp-stock ${p.outOfStock ? "out" : "in"}`}>
                                            {p.outOfStock ? "Hết hàng" : `Còn ${p.stockQuantity ?? 0}`}
                                        </span>
                                    </div>

                                    {p.description ? (
                                        <div className="hp-card-desc">{p.description}</div>
                                    ) : (
                                        <div className="hp-card-desc muted">Chưa có mô tả</div>
                                    )}

                                    <div className="hp-card-footer">
                                        <div className="hp-price">
                                            {typeof p.price === "number"
                                                ? p.price.toLocaleString("vi-VN") + " ₫"
                                                : "—"}
                                        </div>

                                        {role === 'ADMIN' && (
                                            <div className="hp-card-actions">
                                                <button 
                                                    className="hp-card-btn edit"
                                                    onClick={() => { setManagerTab('product'); startEditProduct(p); }}
                                                >
                                                    Sửa
                                                </button>
                                                <button 
                                                    className="hp-card-btn delete"
                                                    onClick={() => deleteProduct(p.id)}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;
