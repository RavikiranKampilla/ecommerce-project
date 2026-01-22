import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated, loading } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // 🔁 Load cart ONLY after auth is ready
  useEffect(() => {
    if (loading) return; // wait for auth init

    const loadCart = async () => {
      if (!isAuthenticated) {
        setCart([]);
        setCartLoading(false);
        return;
      }

      setCartLoading(true);
      try {
        const res = await api.get("/cart");
        setCart(res.data || []);
      } catch {
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, loading]);

  // 🛒 ADD TO CART (OPTIMISTIC + SAFE)
  const addToCart = async (product, quantity = 1) => {
    if (loading) return; // prevent false LOGIN_REQUIRED

    if (!isAuthenticated) {
      throw new Error("LOGIN_REQUIRED");
    }

    const tempId = Date.now();
    const existing = cart.find(
      (item) => item.productId === product.id
    );

    // 🔥 Optimistic UI update
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
          quantity,
          stock: product.stock,
        },
      ]);
    }

    try {
      const res = await api.post("/cart/add", {
        productId: product.id,
        quantity,
      });

      // ✅ Replace optimistic item with backend item
      setCart((prev) =>
        prev.map((item) =>
          item.id === tempId || item.productId === product.id
            ? res.data
            : item
        )
      );
    } catch (err) {
      // 🔙 Rollback on failure
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

  // 🧹 CLEAR CART (LOGOUT / ORDER)
  const clearCart = async () => {
    const backup = cart;
    setCart([]);

    try {
      await api.delete("/cart/clear");
    } catch {
      setCart(backup);
    }
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
