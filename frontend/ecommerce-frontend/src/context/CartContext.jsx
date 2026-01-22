import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import { getToken } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { loading } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // 🔁 Load cart after auth is ready
  useEffect(() => {
    if (loading) return;

    const loadCart = async () => {
      const token = getToken();
      if (!token) {
        setCart([]);
        setCartLoading(false);
        return;
      }

      setCartLoading(true);

      try {
        const res = await api.get("/cart");

        const hydratedCart = await Promise.all(
          (res.data || []).map(async (item) => {
            const productId = item.productId ?? item.product?.id;

            let product = item.product ?? null;

            // 🔒 NEVER drop cart rows
            if (productId) {
              try {
                const productRes = await api.get(`/products/${productId}`);
                product = productRes.data;
              } catch {
                // product fetch failed → KEEP cart item
              }
            }

            return {
              id: item.id,
              quantity: item.quantity,
              product,
            };
          })
        );

        setCart(hydratedCart);
      } catch (err) {
        console.error("Failed to load cart:", err);
        // ❗ DO NOT clear cart on error
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();
  }, [loading]);

  // 🛒 ADD TO CART (OPTIMISTIC & SAFE)
  const addToCart = async (product, quantity = 1) => {
    const token = getToken();
    if (!token) throw new Error("LOGIN_REQUIRED");

    const existing = cart.find(
      (item) => item.product?.id === product.id
    );

    const tempId = Date.now();

    // Optimistic UI
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.product?.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: tempId,
          quantity,
          product,
        },
      ]);
    }

    try {
      const res = await api.post("/cart", {
        productId: product.id,
        quantity,
      });

      // Replace temp row with backend row
      setCart((prev) =>
        prev.map((item) =>
          item.id === tempId || item.product?.id === product.id
            ? {
                id: res.data.id,
                quantity: res.data.quantity,
                product,
              }
            : item
        )
      );
    } catch (err) {
      // Rollback
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item.product?.id === product.id
              ? { ...item, quantity: item.quantity - quantity }
              : item
          )
        );
      } else {
        setCart((prev) =>
          prev.filter((item) => item.id !== tempId)
        );
      }
      throw err;
    }
  };

  // ➕➖ UPDATE QUANTITY
  const updateQuantity = async (itemId, newQuantity) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;

    const oldQuantity = item.quantity;

    setCart((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );

    try {
      const endpoint =
        newQuantity > oldQuantity ? "increase" : "decrease";
      await api.put(`/cart/${endpoint}/${itemId}`);
    } catch {
      setCart((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: oldQuantity } : i
        )
      );
    }
  };

  // ❌ REMOVE ITEM
  const removeFromCart = async (itemId) => {
    const backup = cart;
    setCart((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await api.delete(`/cart/${itemId}`);
    } catch {
      setCart(backup);
    }
  };

  // 🧹 CLEAR CART (logout / checkout)
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
