import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { cart } = useCart();
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch featured items
        try {
          const featuredRes = await API.get("/home/featured");
          setFeatured(featuredRes.data || []);
        } catch (err) {
          console.warn("Failed to fetch featured items:", err);
          // Mock featured data
          setFeatured([
            {
              id: "1",
              name: "Special Burger",
              description: "Chef's signature burger with special sauce",
              price: 12.99,
            },
            {
              id: "2",
              name: "Premium Pizza",
              description: "Loaded with toppings and fresh mozzarella",
              price: 14.99,
            },
            {
              id: "3",
              name: "Pasta Deluxe",
              description: "Creamy pasta with premium ingredients",
              price: 11.99,
            },
          ]);
        }

        // Fetch user profile if logged in
        if (token) {
          try {
            const profileRes = await API.get("/home/profile");
            setProfile(profileRes.data);
          } catch (err) {
            console.warn("Failed to fetch profile:", err);
          }
        }
      } catch (err) {
        console.error("Error loading home data:", err);
        setError("Failed to load home data");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [token]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">🍔 Food Order App</h1>
            <div className="flex gap-4 items-center">
              {token ? (
                <>
                  <button
                    onClick={() => navigate("/cart")}
                    className="relative bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    🛒 Cart
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {cart.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 mb-8">
          {token && profile ? (
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome, {profile.name}! 👋</h2>
              <p className="text-lg opacity-90">Phone: {profile.phone}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Our Food Order App!</h2>
              <p className="text-lg opacity-90">
                Discover delicious food, order easily, and enjoy fast delivery
              </p>
            </div>
          )}
        </section>

        {/* Quick Action Buttons */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/menu")}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-2">🍽️</div>
            <h3 className="text-xl font-bold">Browse Menu</h3>
            <p className="text-gray-600">View all our delicious dishes</p>
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition relative"
          >
            <div className="text-4xl mb-2">🛒</div>
            <h3 className="text-xl font-bold">My Cart</h3>
            <p className="text-gray-600">
              {cart.length > 0 ? `${cart.length} items in cart` : "Your cart is empty"}
            </p>
            {cart.length > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>

          {token && (
            <button
              onClick={() => navigate("/payment")}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition"
            >
              <div className="text-4xl mb-2">💳</div>
              <h3 className="text-xl font-bold">Checkout</h3>
              <p className="text-gray-600">Complete your order</p>
            </button>
          )}
        </section>

        {/* Featured Items Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🌟 Featured Items</h2>
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-600">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => navigate("/menu")}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No featured items available</p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-bold mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">Get your order delivered quickly</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-bold mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">Safe and secure payment methods</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="font-bold mb-2">Quality Food</h3>
            <p className="text-gray-600 text-sm">Fresh and delicious meals</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 Food Order App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}