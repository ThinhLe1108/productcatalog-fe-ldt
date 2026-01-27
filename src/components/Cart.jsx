import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./Cart.css";

const Cart = forwardRef(({ apiBaseUrl, token, onCartUpdated }, ref) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const authHeaders = () => ({
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const fetchCart = async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${apiBaseUrl}/api/cart`, {
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error((await res.text()) || "Không lấy được giỏ hàng");
            const data = await res.json();
            setCart(data || null);
            if (onCartUpdated) onCartUpdated(data || null);
        } catch (e) {
            setCart(null);
            setError(e?.message || "Lỗi tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        if (!token) return { success: false, error: "Chưa đăng nhập" };

        setError("");
        try {
            const res = await fetch(`${apiBaseUrl}/api/cart/items`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ productId, quantity }),
            });
            if (!res.ok) throw new Error((await res.text()) || "Không thể thêm vào giỏ hàng");
            const data = await res.json();
            setCart(data || null);
            if (onCartUpdated) onCartUpdated(data || null);
            return { success: true, data };
        } catch (e) {
            setError(e?.message || "Lỗi thêm vào giỏ hàng");
            return { success: false, error: e?.message || "Lỗi thêm vào giỏ hàng" };
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (!token) return;

        // BE yêu cầu Long => FE phải đảm bảo có id hợp lệ
        if (cartItemId === undefined || cartItemId === null || cartItemId === "") {
            setError("Không thể xóa: cartItemId bị thiếu (undefined/null).");
            return;
        }

        const idNumber = Number(cartItemId);
        if (!Number.isFinite(idNumber)) {
            setError(`Không thể xóa: cartItemId không hợp lệ (${String(cartItemId)}).`);
            return;
        }

        setError("");
        try {
            const res = await fetch(`${apiBaseUrl}/api/cart/items/${encodeURIComponent(idNumber)}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!res.ok) throw new Error((await res.text()) || "Không thể xóa khỏi giỏ hàng");

            const data = await res.json();
            setCart(data || null);
            if (onCartUpdated) onCartUpdated(data || null);
        } catch (e) {
            setError(e?.message || "Lỗi xóa khỏi giỏ hàng");
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useImperativeHandle(ref, () => ({
        fetchCart,
        addToCart,
    }));

    const totalItems = Array.isArray(cart?.items)
        ? cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
        : 0;

    return (
        <div className="cart-container">
            <button className="cart-toggle" onClick={() => setIsOpen(!isOpen)} type="button">
                <svg
                    className="cart-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="m1 1 4 4h16l-2.5 7.5H7.5"></path>
                    <path d="M6.5 12.5 5 19h14"></path>
                </svg>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {isOpen && (
                <div className="cart-dropdown">
                    <div className="cart-header">
                        <h3>Giỏ hàng</h3>
                        <button className="cart-close" onClick={() => setIsOpen(false)} type="button">
                            x
                        </button>
                    </div>

                    {loading && <div className="cart-loading">Đang tải...</div>}
                    {error && <div className="cart-error">{error}</div>}

                    {!loading && !error && (!cart?.items || cart.items.length === 0) && (
                        <div className="cart-empty">Giỏ hàng trống</div>
                    )}

                    {!loading && Array.isArray(cart?.items) && cart.items.length > 0 && (
                        <>
                            <div className="cart-items">
                                {cart.items.map((item, idx) => {
                                    // BE schema: cartItemId chính là item.id
                                    const cartItemId = item?.Id ?? item?.id;

                                    return (
                                        <div key={cartItemId ?? `row-${idx}`} className="cart-item">
                                            <div className="cart-item-info">
                                                <div className="cart-item-name">{item.productName}</div>
                                                <div className="cart-item-details">
                                                    <span>
                                                        {item.quantity} x {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                                                    </span>
                                                    <span className="cart-item-subtotal">
                                                        = {Number(item.subTotal || 0).toLocaleString("vi-VN")} ₫
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                className="cart-item-remove"
                                                onClick={() => {
                                                    // nếu BE không trả id thì báo rõ + log item để bạn kiểm tra response thực tế
                                                    if (cartItemId === undefined || cartItemId === null) {
                                                        console.log("Cart item missing id:", item);
                                                        setError("Không thể xóa: BE không trả về item.id (cartItemId). Kiểm tra response GET /api/cart.");
                                                        return;
                                                    }
                                                    removeFromCart(cartItemId);
                                                }}
                                                title="Xóa"
                                                type="button"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Tổng cộng:</span>
                                    <span className="cart-total-price">
                                        {Number(cart.totalPrice || 0).toLocaleString("vi-VN")} ₫
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});

export default Cart;