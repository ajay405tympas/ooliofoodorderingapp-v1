import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setProcessingId(itemId);
      await updateQuantity(itemId, newQuantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setProcessingId(itemId);
      await removeFromCart(itemId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear the entire cart?")) {
      clearCart();
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateSubtotal = () => {
    return calculateTotal();
  };

  const tax = calculateSubtotal() * 0.1; // 10% tax
  const total = calculateSubtotal() + tax;

  if (loading && cart.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/menu")}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-4 flex gap-4"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                    <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2 border rounded">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={processingId === item.id || loading}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={processingId === item.id || loading}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={processingId === item.id || loading}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-700 font-semibold text-sm"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-2 border-b pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate("/payment")}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 font-semibold"
                >
                  Proceed to Payment
                </button>

                <button
                  onClick={() => navigate("/menu")}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded hover:bg-gray-300 font-semibold mt-2"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}