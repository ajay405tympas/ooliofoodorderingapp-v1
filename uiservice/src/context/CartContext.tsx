import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
}

export interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (itemId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/cart");
      setCart(res.data || []);
    } catch (err) {
      console.warn("Failed to fetch cart:", err);
      setError("Failed to load cart");
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      await API.post("/cart/add", { itemId, quantity });
      await fetchCart();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to add item to cart";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      
      await API.put("/cart/update", { itemId: cartItemId, quantity });
      await fetchCart();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update cart";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      setError(null);
      await API.delete(`/cart/remove`, { data: { itemId: cartItemId } });
      await fetchCart();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to remove item";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cartData");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
