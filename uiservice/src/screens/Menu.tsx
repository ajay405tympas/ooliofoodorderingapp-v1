import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useCart } from "../context/CartContext";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await API.get("/menu");
        setMenuItems(response.data);
        setError(null);
      } catch (err) {
        console.warn("Failed to fetch menu:", err);
        setError("Unable to load menu. Backend service may not be running.");
        // Set mock data for development
        setMenuItems([
          { id: "1", name: "Burger", description: "Delicious beef burger", price: 8.99 },
          { id: "2", name: "Pizza", description: "Cheese pizza", price: 10.99 },
          { id: "3", name: "Pasta", description: "Italian pasta", price: 9.99 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAddToCart = async (itemId: string, itemName: string) => {
    try {
      await addToCart(itemId);
      alert(`${itemName} added to cart!`);
    } catch (err) {
      console.warn("Failed to add to cart:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 mb-4 rounded">
          {error}
        </div>
      )}

      {loading && <div className="text-center">Loading menu...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 shadow">
            {item.image && <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded mb-2" />}
            <h2 className="text-lg font-semibold">{item.name}</h2>
            {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
              <button
                onClick={() => handleAddToCart(item.id, item.name)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}