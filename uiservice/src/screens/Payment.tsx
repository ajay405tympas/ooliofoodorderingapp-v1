import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";

export default function Payment() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cart, clearCart } = useCart();
  const { placeOrder, currentOrder, loading, error: orderError, clearError } = useOrder();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const subtotal = calculateTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const validateInputs = () => {
    if (!deliveryAddress.trim()) {
      setLocalError("Please enter delivery address");
      return false;
    }
    if (!paymentMethod) {
      setLocalError("Please select payment method");
      return false;
    }
    if (paymentMethod === "card") {
      if (!cardNumber.trim() || cardNumber.length < 13) {
        setLocalError("Please enter valid card number");
        return false;
      }
      if (!expiryDate.trim()) {
        setLocalError("Please enter card expiry date");
        return false;
      }
      if (!cvv.trim() || cvv.length < 3) {
        setLocalError("Please enter valid CVV");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateInputs() || cart.length === 0) {
      setLocalError("Cart is empty or missing required details");
      return;
    }

    try {
      setLocalError("");
      setProcessingPayment(true);

      // Convert cart items to order items
      const orderItems = cart.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // Place order
      const order = await placeOrder(orderItems, deliveryAddress, paymentMethod);

      setOrderPlaced(true);

      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
        navigate(`/order-tracking/${order.orderId}`);
      }, 2000);
    } catch (err) {
      console.error("Failed to place order:", err);
      setLocalError("Payment processing failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (orderPlaced && currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-2">Order ID: {currentOrder.orderId}</p>
          <p className="text-gray-600 mb-6">Redirecting to tracking page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment & Checkout</h1>

        {(localError || orderError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {localError || orderError}
            <button
              onClick={() => {
                setLocalError("");
                clearError();
              }}
              className="float-right text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {cart.length === 0 && !orderPlaced ? (
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
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500"
                  rows={4}
                  disabled={processingPayment}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      disabled={processingPayment}
                    />
                    <span>Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      disabled={processingPayment}
                    />
                    <span>Digital Wallet</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                      disabled={processingPayment}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Card Details</h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, "").substring(0, 19))}
                      className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500"
                      disabled={processingPayment}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500"
                        disabled={processingPayment}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.substring(0, 4))}
                        className="border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500"
                        disabled={processingPayment}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border-b pb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-b pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
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
                  onClick={handlePlaceOrder}
                  disabled={processingPayment || cart.length === 0}
                  className={`w-full px-4 py-3 rounded font-semibold text-white transition ${
                    processingPayment || cart.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {processingPayment ? "Processing..." : "Place Order"}
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  disabled={processingPayment}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded font-semibold mt-2 hover:bg-gray-300 transition"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}