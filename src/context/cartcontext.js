
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children, customerId }) => {

  // Separate storage for each customer and guest
  const cartKey = customerId
    ? `konfiz_cart_${customerId}`
    : "konfiz_cart_guest";

  const [cart, setCart] = useState([]);
  const [taxType, setTaxType] = useState("intra");
  const [loadedKey, setLoadedKey] = useState(null);

  // =====================================
  // LOAD CART
  // =====================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(cartKey);
      const parsedCart = savedCart
        ? JSON.parse(savedCart)
        : [];

      setCart(Array.isArray(parsedCart) ? parsedCart : []);
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    }

    setLoadedKey(cartKey);

  }, [cartKey]);

  // =====================================
  // SAVE CART
  // =====================================

  useEffect(() => {

    // Never overwrite storage before loading
    // the correct customer's cart.

    if (loadedKey !== cartKey) return;

    try {
      localStorage.setItem(
        cartKey,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Cart saving error:", error);
    }

  }, [cart, cartKey, loadedKey]);

  // =====================================
  // ADD PRODUCT
  // =====================================

  const addToCart = (product) => {

    if (!product || !product.id) {
      console.error("Invalid product added to cart");
      return;
    }

    setCart((previousCart) => {

      const existingItem = previousCart.find(
        (item) => item.id === product.id
      );

      // Same product + same size + same addons
      if (existingItem) {

        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + 1
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          cartItemId: product.id,
          quantity: 1
        }
      ];

    });
  };

  // =====================================
  // REMOVE PRODUCT
  // =====================================

  const removeFromCart = (id) => {

    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    );

  };

  // =====================================
  // UPDATE QUANTITY
  // =====================================

  const updateQuantity = (id, quantity) => {

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? { ...item, quantity: qty }
          : item
      )
    );

  };

  // =====================================
  // INCREASE QUANTITY
  // =====================================

  const increaseQuantity = (id) => {

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number(item.quantity || 0) + 1
            }
          : item
      )
    );

  };

  // =====================================
  // DECREASE QUANTITY
  // =====================================

  const decreaseQuantity = (id) => {

    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Number(item.quantity || 0) - 1
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

  };

  // =====================================
  // CLEAR CART
  // =====================================

  const clearCart = () => {
    setCart([]);
  };

  // =====================================
  // TOTAL QUANTITY
  // =====================================

  const totalQuantity = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  // Navbar cart count
  const cartCount = totalQuantity;

  // =====================================
  // SUBTOTAL
  // =====================================

  const subTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );

  // =====================================
  // GST CALCULATION
  // =====================================

  const totalTax = cart.reduce((sum, item) => {

    const gstRate = Number(item.gstRate || 0);

    const taxableAmount =
      Number(item.price || 0) *
      Number(item.quantity || 0);

    return sum + (taxableAmount * gstRate) / 100;

  }, 0);

  const cgst = taxType === "intra"
    ? totalTax / 2
    : 0;

  const sgst = taxType === "intra"
    ? totalTax / 2
    : 0;

  const igst = taxType === "inter"
    ? totalTax
    : 0;

  // =====================================
  // GRAND TOTAL
  // =====================================

  const grandTotal = subTotal + totalTax;

  // =====================================
  // CONTEXT PROVIDER
  // =====================================

  return (
    <CartContext.Provider
      value={{

        cart,
        taxType,
        setTaxType,

        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
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

// =====================================
// CUSTOM CART HOOK
// =====================================

export const useCart = () => {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};
