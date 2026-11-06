
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("konfiz_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // GST type
  const [taxType, setTaxType] = useState("intra");
  // intra = CGST + SGST
  // inter = IGST

  // Save cart in localStorage
  useEffect(() => {
    localStorage.setItem("konfiz_cart", JSON.stringify(cart));
  }, [cart]);

  // ADD PRODUCT
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  };

  // REMOVE PRODUCT
  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== id)
    );
  };

  // UPDATE QUANTITY
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Number(quantity) }
          : item
      )
    );
  };

  // CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  // CALCULATIONS

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalTax = cart.reduce((sum, item) => {
    const gstRate = Number(item.gstRate || 0);
    const taxableAmount = item.price * item.quantity;

    return sum + (taxableAmount * gstRate) / 100;
  }, 0);

  const cgst = taxType === "intra" ? totalTax / 2 : 0;
  const sgst = taxType === "intra" ? totalTax / 2 : 0;
  const igst = taxType === "inter" ? totalTax : 0;

  const grandTotal = subTotal + totalTax;

  const cartCount = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        taxType,
        setTaxType,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        totalQuantity,
        cartCount,
        subTotal,
        totalTax,
        cgst,
        sgst,
        igst,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// CUSTOM HOOK
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};
