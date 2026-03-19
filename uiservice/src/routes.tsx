import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Menu from "./screens/Menu";
import Cart from "./screens/Cart";
import Payment from "./screens/Payment";
import OrderTracking from "./screens/OrderTracking";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
    </Routes>
  );

  
}
