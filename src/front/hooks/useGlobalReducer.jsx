// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"  // Import the reducer and the initial state.
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

console.log('BACKEND_URL configured as:', BACKEND_URL);
console.log('All env vars:', import.meta.env);

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create axios instance with specific configuration for development
const apiClient = axios.create({
    baseURL: BACKEND_URL, // Empty baseURL means relative URLs
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

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
                console.log('Attempting login with axios:', { email, backend: BACKEND_URL });

                const response = await apiClient.post('/api/login', {
                    email,
                    password
                });

                console.log('Axios response:', response);
                console.log('Response data:', response.data);

                if (response.data && response.data.access_token) {
                    dispatch({ type: 'set_token', payload: response.data.access_token });
                    dispatch({ type: 'set_user', payload: response.data.user });
                    return { success: true };
                } else {
                    return { success: false, message: response.data.error || 'Login failed' };
                }
            } catch (error) {
                console.error('Login error with axios:', error);
                console.error('Error response:', error.response);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    response: error.response?.data
                });

                if (error.response) {
                    // Server responded with error status
                    return { success: false, message: error.response.data.error || 'Server error' };
                } else if (error.request) {
                    // Request was made but no response received
                    return { success: false, message: 'No response from server. Make sure backend is running on port 3001.' };
                } else {
                    // Something else happened
                    return { success: false, message: 'Error de conexión: ' + error.message };
                }
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

        changePassword: async (passwordData) => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/change-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${store.token}`
                    },
                    body: JSON.stringify(passwordData)
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
        },

        // Admin actions - CRUD completo para productos
        createProduct: async (productData) => {
            if (!store.token) return { success: false, message: 'Debes iniciar sesión' };

            try {
                const response = await apiClient.post('/api/admin/products', productData, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.data) {
                    return { success: true, data: response.data };
                } else {
                    return { success: false, message: 'Error al crear producto' };
                }
            } catch (error) {
                console.error('Create product error:', error);
                if (error.response) {
                    return { success: false, message: error.response.data.error || 'Error del servidor' };
                } else {
                    return { success: false, message: 'Error de conexión' };
                }
            }
        },

        updateProduct: async (productId, productData) => {
            if (!store.token) return { success: false, message: 'Debes iniciar sesión' };

            try {
                const response = await apiClient.put(`/api/admin/products/${productId}`, productData, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.data) {
                    return { success: true, data: response.data };
                } else {
                    return { success: false, message: 'Error al actualizar producto' };
                }
            } catch (error) {
                console.error('Update product error:', error);
                if (error.response) {
                    return { success: false, message: error.response.data.error || 'Error del servidor' };
                } else {
                    return { success: false, message: 'Error de conexión' };
                }
            }
        },

        deleteProduct: async (productId) => {
            if (!store.token) return { success: false, message: 'Debes iniciar sesión' };

            try {
                console.log('Attempting to delete product:', productId, 'with token:', store.token ? 'Token exists' : 'No token');

                const response = await apiClient.delete(`/api/admin/products/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                console.log('Delete response:', response);

                if (response.data) {
                    // Actualizar la lista de productos localmente
                    dispatch({ type: 'remove_product', payload: productId });
                    return { success: true, message: response.data.message };
                } else {
                    return { success: false, message: 'Error al eliminar producto' };
                }
            } catch (error) {
                console.error('Delete product error:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    response: error.response?.data,
                    status: error.response?.status
                });

                if (error.response) {
                    return { success: false, message: error.response.data.error || `Error del servidor: ${error.response.status}` };
                } else if (error.request) {
                    return { success: false, message: 'No response from server' };
                } else {
                    return { success: false, message: 'Error de conexión: ' + error.message };
                }
            }
        },

        getAllUsers: async () => {
            if (!store.token) return { success: false };

            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const users = await response.json();
                    dispatch({ type: 'set_users', payload: users });
                    return { success: true, data: users };
                }
                return { success: false };
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