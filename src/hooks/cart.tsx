import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const increment = useCallback(
    async (id: string) => {
      const productExists = products.find(p => p.id === id);

      if (productExists) {
        setProducts(
          products.map(p =>
            p.id === id ? { ...productExists, quantity: p.quantity + 1 } : p,
          ),
        );
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      const productExists = products.find(p => p.id === id);

      if (productExists && productExists.quantity === 1) {
        setProducts(products.filter(prod => prod.id !== id));
      } else if (productExists) {
        setProducts(
          products.map(p =>
            p.id === id ? { ...productExists, quantity: p.quantity - 1 } : p,
          ),
        );
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // check if product exists
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      console.log("ASYNC STORAGE LOAD");
      const prods = await AsyncStorage.getItem('@GoMarketplace:products');
      console.log(prods);
      if (prods) setProducts(JSON.parse(prods));
    }
    loadProducts();
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
