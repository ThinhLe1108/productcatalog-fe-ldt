import { useState, useRef } from "react";
import "./ProductSearch.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ProductSearch = ({ token, onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const getAuthHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const searchProducts = async (query) => {
    if (!query.trim()) {
      onSearchResults?.([], "");
      return;
    }

    setLoading(true);

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(
        `${API_BASE_URL}/api/products/search?name=${encodedQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Tìm kiếm thất bại: ${response.status}`);
      }

      const data = await response.json();
      const results = data || [];
      
      onSearchResults?.(
        results,
        results.length === 0 ? "Không tìm thấy sản phẩm nào" : ""
      );
    } catch (err) {
      onSearchResults?.([], err.message || "Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Tự động search khi gõ (debounce có thể thêm sau)
    if (value.trim()) {
      searchProducts(value);
    } else {
      onSearchResults?.([], "");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearchResults?.([], "");
  };

  return (
    <div className="product-search-box">
      <div className="search-input-container-long">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Tìm kiếm sản phẩm..."
          className="search-input-long"
        />
        {searchQuery && (
          <button 
            className="search-clear-btn-inside" 
            onClick={handleClear}
            title="Xóa tìm kiếm"
          >
            ×
          </button>
        )}
        {loading && <div className="search-loading-inside">...</div>}
      </div>
      <button 
        className="search-icon-btn-outside" 
        onClick={() => inputRef.current?.focus()}
        title="Tìm kiếm sản phẩm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="21 21l-4.35-4.35"/>
        </svg>
      </button>
    </div>
  );
};

export default ProductSearch;
