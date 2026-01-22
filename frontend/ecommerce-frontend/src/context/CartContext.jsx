import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import { getToken } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated, loading } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // 🔁 Load cart ONLY after auth is ready
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
        // 1️⃣ Get cart items (productId + quantity)
        const res = await api.get("/cart");

        // 2️⃣ Hydrate product details for each cart item
        const hydratedCart = await Promise.all(
          (res.data || []).map(async (item) => {
            const productRes = await api.get(
              `/products/${item.productId}`
            );

            return {
              id: item.id,
              quantity: item.quantity,
              product: productRes.data, // FULL product
            };
          })
        );

        setCart(hydratedCart);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, loading]);

  // 🛒 ADD TO CART (OPTIMISTIC + CONSISTENT SHAPE)
  const addToCart = async (product, quantity = 1) => {
    const token = getToken();
    if (!token) {
      throw new Error("LOGIN_REQUIRED");
    }

    const tempId = Date.now();

    const existing = cart.find(
      (item) => item.product.id === product.id
    );

    // 🔥 Optimistic update
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id
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

      // Replace temp item with backend item
      setCart((prev) =>
        prev.map((item) =>
          item.id === tempId || item.product.id === product.id
            ? {
                id: res.data.id,
                quantity: res.data.quantity,
                product,
              }
            : item
        )
      );
    } catch (err) {
      // 🔙 Rollback
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item.product.id === product.id
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

  // 🧹 CLEAR CART
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
