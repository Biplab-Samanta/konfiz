
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children, customerId }) => {

  const cartKey = customerId
    ? `konfiz_cart_${customerId}`
    : "konfiz_cart_guest";

  const [cart, setCart] = useState([]);

  const [taxType, setTaxType] = useState("intra");

  // LOAD CUSTOMER CART
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(cartKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    }
  }, [cartKey]);

  // SAVE CUSTOMER CART
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

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
    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  // CALCULATIONS
  const totalQuantity = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const subTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const totalTax = cart.reduce((sum, item) => {
    const gstRate = Number(item.gstRate || 0);
    const taxableAmount =
      Number(item.price || 0) * Number(item.quantity || 0);

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
        decreaseQuantity,
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

export const useCart = () => {
  const context = useContext(CartContext);
  

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};
