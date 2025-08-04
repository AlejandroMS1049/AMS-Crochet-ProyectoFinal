// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"  // Import the reducer and the initial state.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext()

// Define a provider component that encapsulates the store and warps it in a context provider to 
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    // Initialize reducer with the initial state.
    const [store, dispatch] = useReducer(storeReducer, initialStore())

    // Actions
    const actions = {
        // Auth actions
        login: async (email, password) => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    dispatch({ type: 'set_token', payload: data.access_token });
                    dispatch({ type: 'set_user', payload: data.user });
                    return { success: true };
                } else {
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        register: async (userData) => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    return { success: true };
                } else {
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        logout: () => {
            dispatch({ type: 'logout' });
        },

        getProfile: async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/profile`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    dispatch({ type: 'set_user', payload: user });
                    return { success: true, data: user };
                }
                return { success: false };
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        updateProfile: async (userData) => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.token}`
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    dispatch({ type: 'set_user', payload: data });
                    return { success: true };
                } else {
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        deleteAccount: async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/profile`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    dispatch({ type: 'logout' });
                    return { success: true };
                } else {
                    const data = await response.json();
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        // Product actions
        getProducts: async (categoryId = null, search = null) => {
            try {
                let url = `${BACKEND_URL}/api/products`;
                const params = new URLSearchParams();
                if (categoryId) params.append('category_id', categoryId);
                if (search) params.append('search', search);
                if (params.toString()) url += `?${params.toString()}`;

                const response = await fetch(url);

                if (response.ok) {
                    const products = await response.json();
                    dispatch({ type: 'set_products', payload: products });
                    return { success: true, data: products };
                }
                return { success: false };
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        getProduct: async (productId) => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/products/${productId}`);

                if (response.ok) {
                    const product = await response.json();
                    return { success: true, data: product };
                } else {
                    return { success: false };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        getCategories: async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/categories`);

                if (response.ok) {
                    const categories = await response.json();
                    dispatch({ type: 'set_categories', payload: categories });
                    return { success: true, data: categories };
                }
                return { success: false };
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        // Cart actions
        getCart: async () => {
            if (!store.token) return { success: false };

            try {
                const response = await fetch(`${BACKEND_URL}/api/cart`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const cartItems = await response.json();
                    dispatch({ type: 'set_cart_items', payload: cartItems });
                    return { success: true, data: cartItems };
                }
                return { success: false };
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        addToCart: async (productId, quantity = 1) => {
            if (!store.token) return { success: false, message: 'Debes iniciar sesión' };

            try {
                const response = await fetch(`${BACKEND_URL}/api/cart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.token}`
                    },
                    body: JSON.stringify({ product_id: productId, quantity })
                });

                if (response.ok) {
                    // Recargar carrito
                    actions.getCart();
                    return { success: true };
                } else {
                    const data = await response.json();
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        updateCartItem: async (itemId, quantity) => {
            if (!store.token) return { success: false };

            try {
                const response = await fetch(`${BACKEND_URL}/api/cart/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.token}`
                    },
                    body: JSON.stringify({ quantity })
                });

                if (response.ok) {
                    // Recargar carrito
                    actions.getCart();
                    return { success: true };
                } else {
                    const data = await response.json();
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },

        removeFromCart: async (itemId) => {
            if (!store.token) return { success: false };

            try {
                const response = await fetch(`${BACKEND_URL}/api/cart/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    // Recargar carrito
                    actions.getCart();
                    return { success: true };
                } else {
                    const data = await response.json();
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },
        
        // Orders actions
        getOrders: async () => {
            if (!store.token) return { success: false };
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/orders`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });
                
                if (response.ok) {
                    const orders = await response.json();
                    dispatch({ type: 'set_orders', payload: orders });
                    return { success: true, data: orders };
                }
                return { success: false };
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },
        
        getOrder: async (orderId) => {
            if (!store.token) return { success: false };
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });
                
                if (response.ok) {
                    const order = await response.json();
                    return { success: true, data: order };
                } else {
                    return { success: false };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        },
        
        checkout: async (checkoutData) => {
            if (!store.token) return { success: false, message: 'Debes iniciar sesión' };
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.token}`
                    },
                    body: JSON.stringify(checkoutData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Limpiar carrito después del checkout exitoso
                    dispatch({ type: 'set_cart_items', payload: [] });
                    // Recargar órdenes
                    actions.getOrders();
                    return { success: true, order: data.order, payment: data.payment };
                } else {
                    return { success: false, message: data.error };
                }
            } catch (error) {
                return { success: false, message: 'Error de conexión' };
            }
        }
    };

    // Provide the store, dispatch method, and actions to all child components.
    return <StoreContext.Provider value={{ store, dispatch, actions }}>
        {children}
    </StoreContext.Provider>
}

// Create Context for easier access
export const Context = StoreContext;

// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store, actions } = useContext(StoreContext)
    return { dispatch, store, actions };
}