import {
  Bike,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Cookie,
  CreditCard,
  CupSoda,
  Home,
  Leaf,
  LogOut,
  MapPin,
  Milk,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Trash2,
  Truck,
  User,
  Wheat,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cancelOrder, createOrder, getCategories, getMe, getOrders, getProducts, login, register } from "./lib/api";

const categoryIcons = {
  Leaf,
  Milk,
  Cookie,
  CupSoda,
  Wheat,
  Sparkles,
  Home
};

const paymentMethods = ["UPI on delivery", "Card on delivery", "Cash on delivery"];

function money(value) {
  return `Rs. ${Number(value || 0).toFixed(0)}`;
}

function discountPercent(product) {
  if (!product.mrp || product.mrp <= product.price) {
    return 0;
  }

  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}

function mergeProducts(existingProducts, nextProducts) {
  const productsById = new Map(existingProducts.map((product) => [product.id, product]));
  nextProducts.forEach((product) => productsById.set(product.id, product));
  return Array.from(productsById.values());
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function firstName(user) {
  return user?.name?.split(" ")[0] || "Account";
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("rating-desc");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flashcart-cart") || "{}");
    } catch {
      return {};
    }
  });
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flashcart-auth") || "null");
    } catch {
      return null;
    }
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState("idle");

  const token = auth?.token;
  const currentUser = auth?.user;

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => setApiError(error.message));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setApiError("");

      getProducts({
        category: selectedCategory,
        q: searchTerm,
        sort
      })
        .then((data) => {
          setProducts(data);
          setAllProducts((currentProducts) => mergeProducts(currentProducts, data));
        })
        .catch((error) => setApiError(error.message))
        .finally(() => setLoading(false));
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [selectedCategory, searchTerm, sort]);

  useEffect(() => {
    localStorage.setItem("flashcart-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("flashcart-auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("flashcart-auth");
    }
  }, [auth]);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      return undefined;
    }

    let active = true;

    getMe(token)
      .then(({ user }) => {
        if (active) {
          setAuth((currentAuth) => (currentAuth ? { ...currentAuth, user } : currentAuth));
        }
      })
      .catch((error) => {
        if (active) {
          setAuth(null);
          setApiError(error.message);
        }
      });

    loadOrders(token, true);
    const intervalId = window.setInterval(() => loadOrders(token, true), 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const productMap = useMemo(() => {
    return new Map(allProducts.map((product) => [product.id, product]));
  }, [allProducts]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = productMap.get(productId);
        return product ? { ...product, quantity } : null;
      })
      .filter(Boolean);
  }, [cart, productMap]);

  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const savings = cartItems.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0);
    const handlingFee = subtotal > 0 ? 6 : 0;
    const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 25;

    return {
      subtotal,
      savings,
      handlingFee,
      deliveryFee,
      total: subtotal + handlingFee + deliveryFee,
      count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cartItems]);

  const activeCategory = categories.find((category) => category.id === selectedCategory);
  const catalogTitle = searchTerm
    ? `Results for "${searchTerm}"`
    : activeCategory?.name || "All groceries";

  async function loadOrders(tokenValue = token, silent = false) {
    if (!tokenValue) {
      return;
    }

    if (!silent) {
      setOrdersLoading(true);
    }

    try {
      const data = await getOrders(tokenValue);
      setOrders(data);
    } catch (error) {
      setApiError(error.message);
    } finally {
      if (!silent) {
        setOrdersLoading(false);
      }
    }
  }

  function updateCart(productId, nextQuantity) {
    setCart((currentCart) => {
      const updatedCart = { ...currentCart };

      if (nextQuantity <= 0) {
        delete updatedCart[productId];
      } else {
        updatedCart[productId] = nextQuantity;
      }

      return updatedCart;
    });
  }

  function addToCart(product) {
    updateCart(product.id, (cart[product.id] || 0) + 1);
    setCartOpen(true);
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setAuthError("");
    setAuthOpen(true);
  }

  function handleAuthModeChange(mode) {
    setAuthMode(mode);
    setAuthError("");
  }

  function handleLogout() {
    setAuth(null);
    setOrders([]);
    setOrdersOpen(false);
  }

  function openCheckout() {
    if (!token) {
      openAuth("login");
      return;
    }

    setCheckoutOpen(true);
  }

  function openOrders() {
    if (!token) {
      openAuth("login");
      return;
    }

    setOrdersOpen(true);
    loadOrders(token);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setAuthStatus("submitting");
    setApiError("");
    setAuthError("");

    try {
      const payload = {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password")
      };
      const result = authMode === "login" ? await login(payload) : await register(payload);

      setAuth(result);
      setAuthOpen(false);
      setAuthStatus("idle");
      setAuthError("");
      loadOrders(result.token, true);
    } catch (error) {
      setAuthStatus("idle");
      setAuthError(error.message);
      setApiError(error.message);
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();

    if (!token) {
      openAuth("login");
      return;
    }

    const form = new FormData(event.currentTarget);

    setCheckoutStatus("submitting");
    setApiError("");

    try {
      const order = await createOrder(
        {
          customer: {
            name: form.get("name"),
            phone: form.get("phone"),
            address: form.get("address")
          },
          paymentMethod: form.get("paymentMethod"),
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        },
        token
      );

      setConfirmedOrder(order);
      setOrders((currentOrders) => [order, ...currentOrders.filter((item) => item.id !== order.id)]);
      setCart({});
      setCheckoutOpen(false);
      setCartOpen(false);
      setCheckoutStatus("idle");
      loadOrders(token, true);
    } catch (error) {
      setCheckoutStatus("idle");
      setApiError(error.message);
    }
  }

  async function handleCancelOrder(orderId) {
    if (!token) {
      openAuth("login");
      return;
    }

    try {
      const updatedOrder = await cancelOrder(orderId, token);
      setOrders((currentOrders) => currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (error) {
      setApiError(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#catalog" aria-label="FlashCart home">
          <span className="brand-mark">FC</span>
          <span className="brand-name">FlashCart</span>
        </a>

        <button className="location-pill" type="button">
          <MapPin size={18} />
          <span>
            <strong>Deliver to Home</strong>
            <small>Sector 22, near market road</small>
          </span>
        </button>

        <label className="search-box">
          <Search size={19} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for milk, chips, fruits..."
          />
        </label>

        <div className="top-actions">
          <button className="action-button" type="button" onClick={openOrders}>
            <ClipboardList size={19} />
            <span>{orders.length ? `${orders.length} orders` : "Orders"}</span>
          </button>

          {token ? (
            <button className="action-button account-button" type="button" onClick={handleLogout}>
              <User size={18} />
              <span>{firstName(currentUser)}</span>
              <LogOut size={15} />
            </button>
          ) : (
            <button className="action-button account-button" type="button" onClick={() => openAuth("login")}>
              <User size={18} />
              <span>Login</span>
            </button>
          )}

          <button className="cart-button" type="button" onClick={() => setCartOpen(true)}>
            <ShoppingCart size={20} />
            <span>{cartTotals.count ? `${cartTotals.count} items` : "Cart"}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero-band">
          <div className="hero-copy">
            <span className="eyebrow">Open now in your area</span>
            <h1>Daily groceries at your door before the tea cools.</h1>
            <p>Fresh produce, snacks, drinks, staples and home essentials packed from nearby dark stores.</p>

            <div className="hero-actions">
              <a className="primary-link" href="#catalog">
                Shop groceries <ChevronRight size={18} />
              </a>
              <span className="coupon-chip">SAVE20 on first order</span>
            </div>
          </div>

          <div className="hero-image" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=80"
              alt=""
            />
          </div>
        </section>

        <section className="service-strip" aria-label="Service highlights">
          <div>
            <Clock3 size={22} />
            <span>
              <strong>8-12 min</strong>
              <small>average delivery</small>
            </span>
          </div>
          <div>
            <Bike size={22} />
            <span>
              <strong>Free delivery</strong>
              <small>above Rs. 299</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={22} />
            <span>
              <strong>Fresh check</strong>
              <small>packed on order</small>
            </span>
          </div>
          <div>
            <Store size={22} />
            <span>
              <strong>2,000+ items</strong>
              <small>nearby store stock</small>
            </span>
          </div>
        </section>

        <section className="category-rail" aria-label="Product categories">
          <button
            className={selectedCategory === "all" ? "category-pill active" : "category-pill"}
            type="button"
            onClick={() => setSelectedCategory("all")}
          >
            <Sparkles size={18} />
            All
          </button>
          {categories.map((category) => {
            const Icon = categoryIcons[category.icon] || Sparkles;
            return (
              <button
                className={selectedCategory === category.id ? "category-pill active" : "category-pill"}
                key={category.id}
                style={{ "--accent": category.accent }}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon size={18} />
                {category.shortName}
              </button>
            );
          })}
        </section>

        <section className="shop-layout" id="catalog">
          <aside className="filter-panel" aria-label="Catalog controls">
            <div className="panel-heading">
              <span>Sort catalog</span>
              <small>{products.length} visible</small>
            </div>

            <div className="segmented-control">
              <button
                className={sort === "rating-desc" ? "active" : ""}
                type="button"
                onClick={() => setSort("rating-desc")}
              >
                Top rated
              </button>
              <button
                className={sort === "price-asc" ? "active" : ""}
                type="button"
                onClick={() => setSort("price-asc")}
              >
                Low price
              </button>
            </div>

            <div className="mini-offer">
              <strong>Weekend basket</strong>
              <span>Extra Rs. 60 off on snacks and drinks above Rs. 499.</span>
            </div>

            <div className="mini-offer blue">
              <strong>Morning staples</strong>
              <span>Milk, bread, eggs and fruits delivered from 6 AM.</span>
            </div>
          </aside>

          <section className="catalog">
            <div className="catalog-heading">
              <div>
                <span className="eyebrow">Instant store</span>
                <h2>{catalogTitle}</h2>
              </div>
              <span className="result-count">{loading ? "Loading" : `${products.length} items`}</span>
            </div>

            {apiError && <div className="api-alert">{apiError}</div>}

            {loading ? (
              <div className="product-grid" aria-label="Loading products">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className="product-card skeleton" key={index} />
                ))}
              </div>
            ) : products.length ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    cartQuantity={cart[product.id] || 0}
                    key={product.id}
                    onAdd={() => addToCart(product)}
                    onQuantityChange={(quantity) => updateCart(product.id, quantity)}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={26} />
                <h3>No groceries found</h3>
                <p>Try a different search or category.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      {cartOpen && (
        <CartDrawer
          cartItems={cartItems}
          cartTotals={cartTotals}
          requiresLogin={!token}
          onCheckout={openCheckout}
          onClose={() => setCartOpen(false)}
          onQuantityChange={updateCart}
        />
      )}

      {ordersOpen && (
        <OrdersDrawer
          loading={ordersLoading}
          orders={orders}
          onCancel={handleCancelOrder}
          onClose={() => setOrdersOpen(false)}
          onRefresh={() => loadOrders(token)}
        />
      )}

      {authOpen && (
        <AuthModal
          error={authError}
          mode={authMode}
          status={authStatus}
          onClose={() => {
            setAuthOpen(false);
            setAuthError("");
          }}
          onModeChange={handleAuthModeChange}
          onSubmit={handleAuthSubmit}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          cartTotals={cartTotals}
          checkoutStatus={checkoutStatus}
          user={currentUser}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={handleCheckout}
        />
      )}

      {confirmedOrder && (
        <OrderSuccess
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrack={() => {
            setConfirmedOrder(null);
            setOrdersOpen(true);
          }}
        />
      )}
    </div>
  );
}

function ProductCard({ product, cartQuantity, onAdd, onQuantityChange }) {
  const discount = discountPercent(product);

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="discount-badge">{discount}% off</span>}
      </div>

      <div className="product-meta">
        <span>
          <Clock3 size={13} />
          {product.deliveryTime}
        </span>
        <span>
          <Star size={13} />
          {product.rating}
        </span>
      </div>

      <h3>{product.name}</h3>
      <p>{product.weight}</p>

      <div className="product-footer">
        <div>
          <strong>{money(product.price)}</strong>
          {product.mrp > product.price && <small>{money(product.mrp)}</small>}
        </div>

        {cartQuantity ? (
          <div className="quantity-stepper" aria-label={`Quantity for ${product.name}`}>
            <button type="button" onClick={() => onQuantityChange(cartQuantity - 1)} aria-label="Decrease quantity">
              <Minus size={14} />
            </button>
            <span>{cartQuantity}</span>
            <button type="button" onClick={() => onQuantityChange(cartQuantity + 1)} aria-label="Increase quantity">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button className="add-button" type="button" onClick={onAdd}>
            <Plus size={15} />
            Add
          </button>
        )}
      </div>
    </article>
  );
}

function CartDrawer({ cartItems, cartTotals, requiresLogin, onClose, onQuantityChange, onCheckout }) {
  return (
    <div className="overlay">
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Your basket</span>
            <h2>{cartTotals.count ? `${cartTotals.count} items` : "Cart is empty"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {cartItems.length ? (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.weight}</small>
                    <span>{money(item.price * item.quantity)}</span>
                  </div>
                  <div className="quantity-stepper compact">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      aria-label={`Decrease ${item.name}`}
                    >
                      {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {requiresLogin && (
              <div className="signin-note">
                <User size={17} />
                <span>Login to place orders and track delivery status.</span>
              </div>
            )}

            <BillSummary totals={cartTotals} />

            <button className="checkout-button" type="button" onClick={onCheckout}>
              <span>{money(cartTotals.total)}</span>
              <strong>{requiresLogin ? "Login to checkout" : "Checkout"}</strong>
            </button>
          </>
        ) : (
          <div className="empty-cart">
            <ShoppingCart size={34} />
            <h3>Your cart is waiting</h3>
            <p>Add fresh groceries and daily essentials to continue.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function OrdersDrawer({ orders, loading, onClose, onRefresh, onCancel }) {
  return (
    <div className="overlay">
      <aside className="cart-drawer orders-drawer" aria-label="My orders">
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Saved in MongoDB</span>
            <h2>My orders</h2>
          </div>
          <div className="drawer-actions">
            <button className="icon-button" type="button" onClick={onRefresh} aria-label="Refresh orders">
              <PackageCheck size={19} />
            </button>
            <button className="icon-button" type="button" onClick={onClose} aria-label="Close orders">
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-cart">
            <PackageCheck size={34} />
            <h3>Loading orders</h3>
            <p>Fetching your latest status.</p>
          </div>
        ) : orders.length ? (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <strong>{order.id}</strong>
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                  <span className={`status-chip ${order.status}`}>{order.statusLabel}</span>
                </div>

                <div className="order-meta">
                  <span>
                    <Truck size={16} />
                    {order.eta}
                  </span>
                  <span>
                    <ShoppingCart size={16} />
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                  <strong>{money(order.summary.total)}</strong>
                </div>

                <StatusTimeline steps={order.statusSteps || []} />

                <div className="order-products">
                  {order.items.map((item) => (
                    <span key={`${order.id}-${item.productId}`}>
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>

                {["confirmed", "packing"].includes(order.status) && (
                  <button className="cancel-order-button" type="button" onClick={() => onCancel(order.id)}>
                    Cancel order
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-cart">
            <ClipboardList size={34} />
            <h3>No orders yet</h3>
            <p>Place an order and it will stay here with live status.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function BillSummary({ totals }) {
  return (
    <div className="bill-summary">
      <div>
        <span>Item total</span>
        <strong>{money(totals.subtotal)}</strong>
      </div>
      <div>
        <span>Delivery fee</span>
        <strong>{totals.deliveryFee ? money(totals.deliveryFee) : "Free"}</strong>
      </div>
      <div>
        <span>Handling fee</span>
        <strong>{money(totals.handlingFee)}</strong>
      </div>
      {totals.savings > 0 && (
        <div className="savings-row">
          <span>Total savings</span>
          <strong>{money(totals.savings)}</strong>
        </div>
      )}
      <div className="total-row">
        <span>Grand total</span>
        <strong>{money(totals.total)}</strong>
      </div>
    </div>
  );
}

function AuthModal({ error, mode, status, onClose, onModeChange, onSubmit }) {
  const isLogin = mode === "login";

  return (
    <div className="overlay modal-overlay">
      <section className="checkout-modal auth-modal" aria-label={isLogin ? "Login" : "Create account"}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">FlashCart account</span>
            <h2>{isLogin ? "Login" : "Create account"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close account modal">
            <X size={20} />
          </button>
        </div>

        {error && <div className="api-alert auth-alert">{error}</div>}

        <form className="checkout-form" onSubmit={onSubmit}>
          {!isLogin && (
            <>
              <label>
                Full name
                <input name="name" placeholder="Aarav Sharma" required />
              </label>
              <label>
                Phone number
                <input name="phone" placeholder="9876543210" minLength="10" required />
              </label>
            </>
          )}

          <label>
            Email
            <input name="email" placeholder="aarav@example.com" type="email" required />
          </label>
          <label>
            Password
            <input name="password" placeholder="Minimum 6 characters" type="password" minLength="6" required />
          </label>

          <button className="checkout-button" type="submit" disabled={status === "submitting"}>
            <span>{isLogin ? "Welcome back" : "Save account"}</span>
            <strong>{status === "submitting" ? "Please wait" : isLogin ? "Login" : "Register"}</strong>
          </button>
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={() => onModeChange(isLogin ? "register" : "login")}
        >
          {isLogin ? "Create a new account" : "Already have an account? Login"}
        </button>
      </section>
    </div>
  );
}

function CheckoutModal({ cartItems, cartTotals, checkoutStatus, user, onClose, onSubmit }) {
  return (
    <div className="overlay modal-overlay">
      <section className="checkout-modal" aria-label="Checkout">
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Secure checkout</span>
            <h2>Confirm delivery</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close checkout">
            <X size={20} />
          </button>
        </div>

        <form className="checkout-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input name="name" defaultValue={user?.name || ""} placeholder="Aarav Sharma" required />
          </label>
          <label>
            Phone number
            <input name="phone" defaultValue={user?.phone || ""} placeholder="9876543210" minLength="10" required />
          </label>
          <label>
            Delivery address
            <textarea name="address" placeholder="House number, street, landmark" rows="4" required />
          </label>

          <fieldset>
            <legend>Payment</legend>
            {paymentMethods.map((method, index) => (
              <label className="radio-row" key={method}>
                <input name="paymentMethod" type="radio" value={method} defaultChecked={index === 0} />
                <CreditCard size={18} />
                {method}
              </label>
            ))}
          </fieldset>

          <div className="checkout-items">
            <strong>{cartItems.length} products</strong>
            <span>{cartItems.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</span>
          </div>

          <BillSummary totals={cartTotals} />

          <button className="checkout-button" type="submit" disabled={checkoutStatus === "submitting"}>
            <span>{money(cartTotals.total)}</span>
            <strong>{checkoutStatus === "submitting" ? "Placing order" : "Place order"}</strong>
          </button>
        </form>
      </section>
    </div>
  );
}

function StatusTimeline({ steps }) {
  return (
    <div className="status-timeline" aria-label="Order status">
      {steps.map((step) => (
        <div className={step.complete ? "timeline-step complete" : "timeline-step"} key={step.status}>
          <span className="timeline-dot" />
          <div>
            <strong>{step.label}</strong>
            <small>{step.at ? formatDateTime(step.at) : step.estimatedAt ? `Est. ${formatDateTime(step.estimatedAt)}` : ""}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderSuccess({ order, onClose, onTrack }) {
  return (
    <div className="overlay modal-overlay">
      <section className="success-modal" aria-label="Order confirmed">
        <CheckCircle2 size={54} />
        <span className="eyebrow">Order confirmed</span>
        <h2>{order.id}</h2>
        <p>
          {order.items.length} items will reach {order.customer.name} in about {order.eta}.
        </p>
        <StatusTimeline steps={order.statusSteps || []} />
        <BillSummary totals={order.summary} />
        <div className="success-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Close
          </button>
          <button className="checkout-button" type="button" onClick={onTrack}>
            <span>{money(order.summary.total)}</span>
            <strong>Track order</strong>
          </button>
        </div>
      </section>
    </div>
  );
}
