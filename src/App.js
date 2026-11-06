
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
// import { CartProvider } from "../src/context/cartcontext";
import Home from "./pages/home";
import Product from "../src/pages/product";

function App() {
  return (
    // <CartProvider>
     
    // </CartProvider>
     <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Product />} />

        </Routes>
      </BrowserRouter>

  );
}

export default App;
