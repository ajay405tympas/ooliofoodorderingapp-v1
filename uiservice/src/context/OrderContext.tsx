import React, { createContext, useContext, useState } from "react";
import API from "../services/api";

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentStatus?: "pending" | "completed" | "failed";
}

export interface OrderContextType {
  currentOrder: Order | null;
  orders: Order[];
  loading: boolean;
  error: string | null;
  placeOrder: (items: OrderItem[], deliveryAddress: string, paymentMethod: string) => Promise<Order>;
  trackOrder: (orderId: string) => Promise<Order>;
  getOrders: () => Promise<Order[]>;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};

export const OrderProvider = ({ children }: any) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async (
    items: OrderItem[],
    deliveryAddress: string,
    paymentMethod: string
  ): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.post("/order", {
        items,
        deliveryAddress,
        paymentMethod,
      });

      const order = response.data;
      setCurrentOrder(order);
      setOrders([...orders, order]);
      return order;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to place order";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (orderId: string): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get(`/order/${orderId}`);
      const order = response.data;
      setCurrentOrder(order);
      return order;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to track order";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrders = async (): Promise<Order[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("/orders");
      const orderList = response.data;
      setOrders(orderList);
      return orderList;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to fetch orders";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        orders,
        loading,
        error,
        placeOrder,
        trackOrder,
        getOrders,
        clearError,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
