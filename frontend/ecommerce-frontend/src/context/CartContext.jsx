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
        setCart(res.data || []);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Failed to load cart:", err);
        }
        setCart([]);
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
      (item) => item.productId === product.id
    );

    const tempId = Date.now();

    // Optimistic UI - use flat structure matching backend response
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: tempId,
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity,
        },
      ]);
    }

    try {
      const res = await api.post("/cart", {
        productId: product.id,
        quantity,
      });

      // Replace temp ID with backend ID, but KEEP product details
      setCart((prev) =>
        prev.map((item) =>
          item.id === tempId || item.productId === product.id
            ? {
                ...item,
                id: res.data.id,
                quantity: res.data.quantity,
              }
            : item
        )
      );
    } catch (err) {
      // Rollback
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item.productId === product.id
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

  // ➕ INCREASE QUANTITY
  const increaseQuantity = async (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;

    const oldQuantity = item.quantity;

    // Optimistic UI
    setCart((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

    try {
      await api.put(`/cart/increase/${itemId}`);
    } catch {
      // Rollback
      setCart((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: oldQuantity } : i
        )
      );
    }
  };

  // ➖ DECREASE QUANTITY
  const decreaseQuantity = async (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item || item.quantity <= 1) return;

    const oldQuantity = item.quantity;

    // Optimistic UI
    setCart((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      )
    );

    try {
      await api.put(`/cart/decrease/${itemId}`);
    } catch {
      // Rollback
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
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
