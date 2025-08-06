const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const initialStore = () => {
  return {
    message: null,
    user: null,
    token: localStorage.getItem("token"),
    products: [],
    categories: [],
    cartItems: [],
    orders: [],
    users: [],
    loading: false,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "set_user":
      return {
        ...store,
        user: action.payload,
      };

    case "set_token":
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
      return {
        ...store,
        token: action.payload,
      };

    case "logout":
      localStorage.removeItem("token");
      return {
        ...store,
        user: null,
        token: null,
        cartItems: [],
      };

    case "set_products":
      return {
        ...store,
        products: action.payload,
      };

    case "remove_product":
      return {
        ...store,
        products: store.products.filter(product => product.id !== action.payload),
      };

    case "set_categories":
      return {
        ...store,
        categories: action.payload,
      };

    case "set_cart_items":
      return {
        ...store,
        cartItems: action.payload,
      };

    case "set_orders":
      return {
        ...store,
        orders: action.payload,
      };

    case "set_users":
      return {
        ...store,
        users: action.payload,
      };

    case "set_loading":
      return {
        ...store,
        loading: action.payload,
      };

    default:
      throw Error("Unknown action.");
  }
}
