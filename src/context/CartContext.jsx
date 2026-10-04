import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const getAddedProductsLog = () => {
  try {
    return JSON.parse(localStorage.getItem("shopEaseAddedProducts") ?? "[]");
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopEaseCart") ?? "[]");
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("shopEaseCart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      const nextCart = existing
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { ...product, quantity: 1 }];

      const productLog = getAddedProductsLog();
      const currentUserName =
        user?.displayName ||
        [user?.name?.firstname, user?.name?.lastname]
          .filter(Boolean)
          .join(" ") ||
        user?.username ||
        "guest";
      const currentUserPhone = user?.phone || "N/A";

      const existingLogProduct = productLog.find(
        (item) => item.id === product.id,
      );
      const updatedLog = existingLogProduct
        ? productLog.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  addedBy: currentUserName,
                  userPhone: currentUserPhone,
                  customerPhone: currentUserPhone,
                  phone: currentUserPhone,
                }
              : item,
          )
        : [
            ...productLog,
            {
              ...product,
              quantity: 1,
              addedBy: currentUserName,
              userPhone: currentUserPhone,
              customerPhone: currentUserPhone,
              phone: currentUserPhone,
              addedAt: new Date().toISOString(),
            },
          ];

      localStorage.setItem("shopEaseAddedProducts", JSON.stringify(updatedLog));
      return nextCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
          : item,
      ),
    );
  };

  const clearCart = () => setCart([]);
  const closeCart = () => setDrawerOpen(false);
  const openCart = () => setDrawerOpen(true);
  const toggleCart = () => setDrawerOpen((open) => !open);

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      drawerOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [cart, itemCount, subtotal, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
