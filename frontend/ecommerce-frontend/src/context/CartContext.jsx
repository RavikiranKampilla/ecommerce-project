import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import { getToken } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { loading } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // 🔁 Load cart after auth
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

        // ✅ HYDRATE product fields so Cart.jsx works
        const hydrated = await Promise.all(
          (res.data || []).map(async (item) => {
            const productRes = await api.get(
              `/products/${item.productId}`
            );

            return {
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              name: productRes.data.name,
              price: productRes.data.price,
              imageUrl: productRes.data.imageUrl,
              stock: productRes.data.stock,
            };
          })
        );

        setCart(hydrated);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();
  }, [loading]);

  // 🛒 ADD TO CART (KEEP PRODUCT FIELDS)
  const addToCart = async (product, quantity = 1) => {
    const token = getToken();
    if (!token) throw new Error("LOGIN_REQUIRED");

    const existing = cart.find(
      (item) => item.productId === product.id
    );

    const tempId = Date.now();

    // ✅ Optimistic insert (FULL SHAPE)
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

    const res = await api.post("/cart", {
      productId: product.id,
      quantity,
    });

    // ✅ DO NOT overwrite product fields
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

  const clearCart = () => setCart([]);

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
