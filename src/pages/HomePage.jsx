import { useEffect, useMemo, useState, useRef } from "react";
import "./HomePage.css";
import reactLogo from "../assets/react.svg";
import ManagerCategory from "../components/ManagerCategory";
import ManagerProduct from "../components/ManagerProduct";
import ProductSearch from "../components/ProductSearch";
import Cart from "../components/Cart";
import API_BASE_URL from "../config.js";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [errorCategories, setErrorCategories] = useState("");
  const [errorProducts, setErrorProducts] = useState("");

  // Token
  const rawToken = localStorage.getItem("token") || "";
  const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  // Tabs
  const [managerTab, setManagerTab] = useState("category"); // 'category' | 'product'

  // Editing objects (HomePage chỉ giữ object đang edit để bấm "Sửa" ở UI list/card)
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete requests (HomePage chỉ phát tín hiệu xóa, Manager sẽ tự gọi API xóa)
  const [deleteCategoryRequestId, setDeleteCategoryRequestId] = useState(null);
  const [deleteProductRequestId, setDeleteProductRequestId] = useState(null);

  // Search results
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [sortType, setSortType] = useState(""); // "", "asc", "desc"

  // Cart
  const cartRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [qtyByProduct, setQtyByProduct] = useState({});

  useEffect(() => {
    setName(localStorage.getItem("fullName") || "");
    setRole(localStorage.getItem("roleName") || "");
  }, []);

  const handleSearchResults = (results, error) => {
    setSearchResults(results);
    setSearchError(error);
    setIsSearchMode(results.length > 0 || error);
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (productId, productName, quantity) => {
    setAddingToCart(productId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        // Bắt lỗi không đủ hàng tồn kho
        if (res.status === 400 && errorText.toLowerCase().includes("not enough stock")) {
          throw new Error(`Không đủ số lượng hàng tồn kho cho "${productName}"`);
        }
        throw new Error(errorText || "Không thể thêm vào giỏ hàng");
      }
      showToast(`Đã thêm "${productName}" (x${quantity}) vào giỏ hàng!`);
      // Refresh cart component
      if (cartRef.current) {
        cartRef.current.fetchCart();
      }
    } catch (e) {
      showToast(e.message || "Lỗi thêm vào giỏ hàng", true);
    } finally {
      setAddingToCart(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: authHeaders(),
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

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts("");
    try {
      let url = `${API_BASE_URL}/api/products`;
      if (selectedCategoryId != null) {
        url = `${API_BASE_URL}/api/products/category/${encodeURIComponent(selectedCategoryId)}`;
      }

      const res = await fetch(url, {
        headers: authHeaders(),
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

  useEffect(() => {
    fetchCategories();
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [token, selectedCategoryId]);

  const sortedProducts = useMemo(() => {
    const base = isSearchMode ? searchResults : products;
    if (!Array.isArray(base)) return [];

    const inStock = base.filter((p) => !p.outOfStock);
    const outStock = base.filter((p) => p.outOfStock);

    const sortByPrice = (arr) => {
      if (sortType === "asc") {
        return [...arr].sort((a, b) => a.price - b.price);
      }
      if (sortType === "desc") {
        return [...arr].sort((a, b) => b.price - a.price);
      }
      return arr;
    };

    return [
      ...sortByPrice(inStock),
      ...sortByPrice(outStock),
    ];
  }, [products, searchResults, isSearchMode, sortType]);


  const displayProducts = sortedProducts;
  const displayError = isSearchMode ? searchError : errorProducts;
  const displayLoading = isSearchMode ? false : loadingProducts;

  // ====== UI actions (HomePage chỉ set state) ======
  const startEditCategoryFromSidebar = (c) => {
    setManagerTab("category");
    setEditingCategory(c);
  };

  const requestDeleteCategoryFromSidebar = (id) => {
    if (!confirm("Bạn có chắc muốn xoá danh mục này?")) return;
    setManagerTab("category");
    setDeleteCategoryRequestId(id);
  };

  const startEditProductFromCard = (p) => {
    setManagerTab("product");
    setEditingProduct(p);
  };

  const requestDeleteProductFromCard = (id) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    setManagerTab("product");
    setDeleteProductRequestId(id);
  };

  return (
    <div className="hp-page">
      {/* HEADER */}
      <header className="hp-header">
        <div className="hp-header-left" />

        <div className="hp-header-center">
          <img className="hp-logo" src={reactLogo} alt="React logo" />
          <span className="hp-brand">Catalog</span>
        </div>

        <div className="hp-header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {name ? <div className="hp-greeting">Xin Chào {name}</div> : null}
          {role !== "ADMIN" && (
            <Cart
              ref={cartRef}
              token={token}
            />
          )}
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
              <div
                key={c.id}
                className={`hp-cat-item ${selectedCategoryId === c.id ? "active" : ""}`}
              >
                <button
                  className="hp-cat-select"
                  onClick={() => setSelectedCategoryId(c.id)}
                  title={c.description || ""}
                >
                  <div className="hp-cat-name">{c.name}</div>
                  {c.description ? <div className="hp-cat-desc">{c.description}</div> : null}
                </button>

                {role === "ADMIN" && (
                  <div className="hp-cat-actions">
                    <button
                      className="hp-cat-action edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditCategoryFromSidebar(c);
                      }}
                    >
                      Sửa
                    </button>

                    <button
                      className="hp-cat-action delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteCategoryFromSidebar(c.id);
                      }}
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
          {/* Manager UI and Search */}
          <div className="hp-manager-tabs">
            {role === "ADMIN" && (
              <>
                <button
                  className={`hp-tab ${managerTab === "category" ? "active" : ""}`}
                  onClick={() => setManagerTab("category")}
                >
                  Quản lý Danh mục
                </button>
                <button
                  className={`hp-tab ${managerTab === "product" ? "active" : ""}`}
                  onClick={() => setManagerTab("product")}
                >
                  Quản lý Sản phẩm
                </button>
              </>
            )}
          </div>

          {role === "ADMIN" && managerTab === "category" && (
            <ManagerCategory
              token={token}
              editingCategory={editingCategory}
              clearEditing={() => setEditingCategory(null)}
              deleteRequestId={deleteCategoryRequestId}
              clearDeleteRequest={() => setDeleteCategoryRequestId(null)}
              onChanged={async () => {
                await fetchCategories();
                await fetchProducts();
              }}
            />
          )}

          {role === "ADMIN" && managerTab === "product" && (
            <ManagerProduct
              token={token}
              categories={categories}
              editingProduct={editingProduct}
              clearEditing={() => setEditingProduct(null)}
              deleteRequestId={deleteProductRequestId}
              clearDeleteRequest={() => setDeleteProductRequestId(null)}
              onChanged={async () => {
                await fetchProducts();
                await fetchCategories();
              }}
            />
          )}

          {/* Products list */}
          <div className="hp-main-top">
            <div className="hp-main-heading">Sản phẩm</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="hp-main-count">
                {displayLoading ? "..." : `${displayProducts.length} sản phẩm`}
              </div>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="hp-sort"
              >
                <option value="">Không sắp xếp</option>
                <option value="asc">Giá tăng dần</option>
                <option value="desc">Giá giảm dần</option>
              </select>
              <ProductSearch
                token={token}
                onSearchResults={handleSearchResults}
              />
            </div>
          </div>

          {displayLoading && <div className="hp-info">Đang tải sản phẩm...</div>}
          {displayError && <div className="hp-error">{displayError}</div>}

          {!displayLoading && !displayError && displayProducts.length === 0 && (
            <div className="hp-empty">{isSearchMode ? "Không tìm thấy sản phẩm nào." : "Không có sản phẩm nào trong danh mục này."}</div>
          )}

          <div className="hp-grid">
            {displayProducts.map((p) => (
              <div className={`hp-card ${p.outOfStock ? "out-of-stock" : ""}`} key={p.id}>
                <div className="hp-card-img">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className="hp-noimg">No Image</div>}
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
                      {typeof p.price === "number" ? p.price.toLocaleString("vi-VN") + "₫" : "—"}
                    </div>

                    <div className="hp-card-actions">
                      {!p.outOfStock && role !== "ADMIN" && (
                        <>
                          <input
                            type="number"
                            min={1}
                            value={qtyByProduct[p.id] ?? 1}
                            onChange={(e) => {
                              const raw = e.target.value;

                              // cho phép xóa trắng để nhập số khác
                              if (raw === "") {
                                setQtyByProduct((prev) => ({ ...prev, [p.id]: "" }));
                                return;
                              }

                              const n = Number(raw);
                              if (!Number.isFinite(n)) return;

                              setQtyByProduct((prev) => ({ ...prev, [p.id]: n }));
                            }}
                            onBlur={() => {
                              // rời ô thì ép tối thiểu là 1
                              setQtyByProduct((prev) => {
                                const v = prev[p.id];
                                const n = Number(v);
                                return { ...prev, [p.id]: Number.isFinite(n) && n >= 1 ? n : 1 };
                              });
                            }}
                            className="hp-qty"
                          />
                          <button
                            className="hp-card-btn add-cart"
                            onClick={() => handleAddToCart(p.id, p.name, qtyByProduct[p.id] ?? 1)}
                            disabled={addingToCart === p.id}
                          >
                            {addingToCart === p.id ? "Đang thêm..." : "🛒 Thêm"}
                          </button>
                        </>
                      )}
                      {role === "ADMIN" && (
                        <>
                          <button
                            className="hp-card-btn edit"
                            onClick={() => startEditProductFromCard(p)}
                          >
                            Sửa
                          </button>
                          <button
                            className="hp-card-btn delete"
                            onClick={() => requestDeleteProductFromCard(p.id)}
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`cart-toast ${toast.isError ? "error" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default HomePage;
