import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext";

const statusSteps = [
  { step: "pending", label: "Order Placed", icon: "📝" },
  { step: "confirmed", label: "Confirmed", icon: "✓" },
  { step: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { step: "ready", label: "Ready", icon: "📦" },
  { step: "delivered", label: "Delivered", icon: "✅" },
];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { trackOrder, currentOrder, loading, error } = useOrder();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      if (orderId) {
        await trackOrder(orderId);
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderDetails();
    setRefreshing(false);
  };

  if (!orderId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No order ID provided</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading && !currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No order data available</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.step === currentOrder.status
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">Order Tracking</h1>
              <p className="text-gray-600">Order ID: {currentOrder.orderId}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded font-semibold text-white transition ${
                refreshing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {refreshing ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Order Date</p>
              <p className="font-semibold">
                {new Date(currentOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estimated Delivery</p>
              <p className="font-semibold">
                {currentOrder.estimatedDelivery
                  ? new Date(currentOrder.estimatedDelivery).toLocaleDateString()
                  : "TBD"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Payment Status</p>
              <p className="font-semibold">
                {currentOrder.paymentStatus === "completed" ? (
                  <span className="text-green-600">✓ Completed</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="font-semibold text-lg">
                ${currentOrder.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Order Status</h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200"></div>

            {/* Timeline steps */}
            <div className="space-y-8">
              {statusSteps.map((statusStep, index) => (
                <div key={statusStep.step} className="relative pl-20">
                  {/* Circle */}
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      index <= currentStatusIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {statusStep.icon}
                  </div>

                  {/* Content */}
                  <div>
                    <h3
                      className={`font-bold ${
                        index <= currentStatusIndex ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {statusStep.label}
                    </h3>
                    {index === currentStatusIndex && (
                      <p className="text-green-600 text-sm">Currently here</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>

          <div className="space-y-3 border-b pb-4 mb-4">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${currentOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {currentOrder.deliveryAddress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📍 Delivery Address</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {currentOrder.deliveryAddress}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded font-semibold hover:bg-gray-300 transition"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/menu")}
            className="bg-blue-500 text-white px-4 py-3 rounded font-semibold hover:bg-blue-600 transition"
          >
            Order More
          </button>
        </div>
      </div>
    </div>
  );
}
