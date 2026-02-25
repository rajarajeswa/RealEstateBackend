import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const CartContext = createContext(null);

const CART_KEY = 'kara_saaram_cart';

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    // Decrement stock on server when adding to cart
    const addToCart = async (product, qty = 1) => {
        const quantity = product.quantity || qty;
        
        // Update local cart
        setCart(prev => {
            const existing = prev.find(p => p.productId === product.id);
            if (existing) {
                return prev.map(p =>
                    p.productId === product.id
                        ? { ...p, quantity: p.quantity + quantity }
                        : p
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: quantity
            }];
        });

        // Decrement stock on server
        try {
            await apiFetch(`/api/products/${product.id}/decrement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
        } catch (err) {
            console.error('Failed to decrement stock:', err);
        }
    };

    // Increment stock on server when removing from cart
    const removeFromCart = async (productId) => {
        const item = cart.find(p => p.productId === productId);
        
        // Update local cart
        setCart(prev => prev.filter(p => p.productId !== productId));

        // Increment stock on server
        if (item) {
            try {
                await apiFetch(`/api/products/${productId}/increment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: item.quantity })
                });
            } catch (err) {
                console.error('Failed to increment stock:', err);
            }
        }
    };

    // Update quantity - handle stock changes
    const updateQuantity = async (productId, newQuantity) => {
        const item = cart.find(p => p.productId === productId);
        if (!item) return;

        const diff = newQuantity - item.quantity;

        if (newQuantity < 1) {
            await removeFromCart(productId);
            return;
        }

        // Update local cart
        setCart(prev => prev.map(p =>
            p.productId === productId ? { ...p, quantity: newQuantity } : p
        ));

        // Update stock on server
        try {
            if (diff > 0) {
                // Decreasing cart quantity means incrementing stock
                await apiFetch(`/api/products/${productId}/decrement`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: diff })
                });
            } else if (diff < 0) {
                // Increasing cart quantity means decrementing stock
                await apiFetch(`/api/products/${productId}/increment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: Math.abs(diff) })
                });
            }
        } catch (err) {
            console.error('Failed to update stock:', err);
        }
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((sum, p) => sum + p.quantity, 0);
    const cartTotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
