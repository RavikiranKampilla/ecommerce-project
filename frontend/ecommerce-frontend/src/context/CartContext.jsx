import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import { getToken } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load cart only once on mount (after auth is ready)
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCart([]);
        setCartLoading(false);
        setInitialized(true);
        return;
      }

      setCartLoading(true);
      try {
        const res = await api.get("/cart");
        setCart(res.data);
      } catch {
        setCart([]);
      } finally {
        setCartLoading(false);
        setInitialized(true);
      }
    };

    // Only load on initial mount, not on every auth change
    if (!initialized) {
      loadCart();
    }
  }, [isAuthenticated, initialized]);

  // Reload cart manually (for logout or explicit refresh)
  const reloadCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    setCartLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch {
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  };

  // ✅ ADD TO CART (OPTIMISTIC + API SYNC)
  const addToCart = async (product, quantity = 1) => {
    // Check token directly to avoid auth state race condition
    const token = getToken();
    if (!token) {
      throw new Error("LOGIN_REQUIRED");
    }

    // 🔥 instant UI update (optimistic)
    const tempId = Date.now();
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      // Optimistically increase quantity
      setCart((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Optimistically add new item
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
      // Call API and get actual cart item from backend
      const res = await api.post("/cart/add", {
        productId: product.id,
        quantity,
      });

      // Update cart with actual backend response (real ID and data)
      setCart((prev) => {
        if (existing) {
          // Update existing item with backend data
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, ...res.data, id: res.data.id }
              : item
          );
        } else {
          // Replace temp item with real backend data
          return prev.map((item) =>
            item.id === tempId ? { ...res.data } : item
          );
        }
      });
    } catch (err) {
      // Rollback on failure
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity - quantity }
              : item
          )
        );
      } else {
        setCart((prev) => prev.filter((item) => item.id !== tempId));
      }
      throw err;
    }
  };

  // ✅ UPDATE QUANTITY (INCREASE/DECREASE)
  const updateQuantity = async (itemId, newQuantity) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;

    // Validate quantity
    if (newQuantity < 1 || newQuantity > item.stock) return;

    const oldQuantity = item.quantity;

    // Optimistic update
    setCart((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );

    try {
      const endpoint = newQuantity > oldQuantity ? 'increase' : 'decrease';
      await api.put(`/cart/${endpoint}/${itemId}`);
    } catch {
      // Rollback on failure
      setCart((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: oldQuantity } : i
        )
      );
    }
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = async (itemId) => {
    const backup = cart;

    setCart((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await api.delete(`/cart/${itemId}`);
    } catch {
      setCart(backup);
    }
  };

  // ✅ CLEAR CART
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
        reloadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
