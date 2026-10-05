/* ============================================
   KISAN MARKET — Shared App Logic (Frontend Demo)
   Uses localStorage as a mock data layer.
   Replace these functions with real fetch() calls
   to PHP endpoints in the backend phase.
   ============================================ */

const KM = (() => {

  const KEYS = {
    USERS: 'km_users',
    PRODUCTS: 'km_products',
    ORDERS: 'km_orders',
    SESSION: 'km_session'
  };

  /* ---------- Seed Data ---------- */
  function seed() {
    if (!localStorage.getItem(KEYS.USERS)) {
      const users = [
        { id: 1, name: 'Admin User', email: 'admin@kisanmarket.com', password: 'admin123', role: 'admin', status: 'active' },
        { id: 2, name: 'Ravi Kumar', email: 'ravi@farm.com', password: 'farm123', role: 'farmer', status: 'active', village: 'Mandya' },
        { id: 3, name: 'Lakshmi Devi', email: 'lakshmi@farm.com', password: 'farm123', role: 'farmer', status: 'active', village: 'Mysuru' },
        { id: 4, name: 'Priya Sharma', email: 'priya@mail.com', password: 'cons123', role: 'consumer', status: 'active' },
        { id: 5, name: 'Suresh Babu', email: 'suresh@delivery.com', password: 'del123', role: 'delivery', status: 'active' }
      ];
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      const products = [
        { id: 1, farmerId: 2, farmerName: 'Ravi Kumar', name: 'Fresh Tomatoes', category: 'Vegetables', price: 28, unit: 'kg', qty: 120, status: 'active', emoji: '🍅' },
        { id: 2, farmerId: 2, farmerName: 'Ravi Kumar', name: 'Organic Carrots', category: 'Vegetables', price: 35, unit: 'kg', qty: 80, status: 'active', emoji: '🥕' },
        { id: 3, farmerId: 3, farmerName: 'Lakshmi Devi', name: 'Alphonso Mangoes', category: 'Fruits', price: 120, unit: 'kg', qty: 60, status: 'active', emoji: '🥭' },
        { id: 4, farmerId: 3, farmerName: 'Lakshmi Devi', name: 'Fresh Spinach', category: 'Vegetables', price: 20, unit: 'bundle', qty: 45, status: 'active', emoji: '🥬' },
        { id: 5, farmerId: 2, farmerName: 'Ravi Kumar', name: 'Basmati Rice', category: 'Grains', price: 85, unit: 'kg', qty: 200, status: 'active', emoji: '🌾' },
        { id: 6, farmerId: 3, farmerName: 'Lakshmi Devi', name: 'Sweet Bananas', category: 'Fruits', price: 45, unit: 'dozen', qty: 30, status: 'pending', emoji: '🍌' }
      ];
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    }

    if (!localStorage.getItem(KEYS.ORDERS)) {
      const orders = [
        { id: 101, consumerId: 4, productId: 1, productName: 'Fresh Tomatoes', qty: 5, total: 140, status: 'delivered', date: '2026-06-08', agentId: 5 },
        { id: 102, consumerId: 4, productId: 3, productName: 'Alphonso Mangoes', qty: 2, total: 240, status: 'transit', date: '2026-06-11', agentId: 5 }
      ];
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  /* ---------- Generic Storage Helpers ---------- */
  const getAll = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const saveAll = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const nextId = (arr) => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;

  /* ---------- Auth ---------- */
  function login(email, password, role) {
    const users = getAll(KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role);
    if (!user) return { success: false, message: 'Invalid credentials or role mismatch.' };
    if (user.status !== 'active') return { success: false, message: 'Your account is not active. Contact admin.' };
    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    return { success: true, user: session };
  }

  function register(data) {
    const users = getAll(KEYS.USERS);
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser = {
      id: nextId(users),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      status: 'active',
      ...(data.village ? { village: data.village } : {})
    };
    users.push(newUser);
    saveAll(KEYS.USERS, users);
    return { success: true };
  }

  function logout() {
    localStorage.removeItem(KEYS.SESSION);
  }

  function currentUser() {
    return JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
  }

  /* Guard: redirect if not logged in / wrong role */
  function requireRole(roles) {
    const user = currentUser();
    if (!user || !roles.includes(user.role)) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  /* ---------- Products ---------- */
  function getProducts(filter = {}) {
    let products = getAll(KEYS.PRODUCTS);
    if (filter.farmerId) products = products.filter(p => p.farmerId === filter.farmerId);
    if (filter.status) products = products.filter(p => p.status === filter.status);
    if (filter.category) products = products.filter(p => p.category === filter.category);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(s));
    }
    return products;
  }

  function addProduct(data) {
    const products = getAll(KEYS.PRODUCTS);
    const user = currentUser();
    products.push({
      id: nextId(products),
      farmerId: user.id,
      farmerName: user.name,
      name: data.name,
      category: data.category,
      price: Number(data.price),
      unit: data.unit,
      qty: Number(data.qty),
      status: 'active',
      emoji: data.emoji || '🌿'
    });
    saveAll(KEYS.PRODUCTS, products);
  }

  function updateProduct(id, data) {
    const products = getAll(KEYS.PRODUCTS);
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) products[idx] = { ...products[idx], ...data };
    saveAll(KEYS.PRODUCTS, products);
  }

  function deleteProduct(id) {
    let products = getAll(KEYS.PRODUCTS);
    products = products.filter(p => p.id !== id);
    saveAll(KEYS.PRODUCTS, products);
  }

  /* ---------- Orders ---------- */
  function getOrders(filter = {}) {
    let orders = getAll(KEYS.ORDERS);
    if (filter.consumerId) orders = orders.filter(o => o.consumerId === filter.consumerId);
    if (filter.agentId) orders = orders.filter(o => o.agentId === filter.agentId);
    if (filter.status) orders = orders.filter(o => o.status === filter.status);
    return orders;
  }

  function placeOrder(productId, qty) {
    const products = getAll(KEYS.PRODUCTS);
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Product not found.' };
    if (product.qty < qty) return { success: false, message: 'Not enough stock available.' };

    const orders = getAll(KEYS.ORDERS);
    const user = currentUser();
    orders.push({
      id: nextId(orders),
      consumerId: user.id,
      productId: product.id,
      productName: product.name,
      qty: qty,
      total: product.price * qty,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      agentId: null
    });
    saveAll(KEYS.ORDERS, orders);

    product.qty -= qty;
    saveAll(KEYS.PRODUCTS, products);

    return { success: true };
  }

  function updateOrderStatus(id, status) {
    const orders = getAll(KEYS.ORDERS);
    const idx = orders.findIndex(o => o.id === id);
    if (idx > -1) orders[idx].status = status;
    saveAll(KEYS.ORDERS, orders);
  }

  /* ---------- Users (Admin) ---------- */
  function getUsers(filter = {}) {
    let users = getAll(KEYS.USERS);
    if (filter.role) users = users.filter(u => u.role === filter.role);
    return users;
  }

  function updateUserStatus(id, status) {
    const users = getAll(KEYS.USERS);
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) users[idx].status = status;
    saveAll(KEYS.USERS, users);
  }

  /* ---------- UI Helpers ---------- */
  function initials(name) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  function renderNavbar(activePage) {
    const user = currentUser();
    const navEl = document.getElementById('navbar');
    if (!navEl) return;

    let links = '';
    if (!user) {
      links = `
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="login.html" class="${activePage === 'login' ? 'active' : ''}">Login</a>
        <a href="register.html" class="${activePage === 'register' ? 'active' : ''}">Register</a>
      `;
    } else {
      const dashMap = {
        farmer: 'farmer-dashboard.html',
        consumer: 'consumer-dashboard.html',
        admin: 'admin-dashboard.html',
        delivery: 'delivery-dashboard.html'
      };
      links = `
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="${dashMap[user.role]}" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
        <span class="badge-role">${user.role}</span>
        <a href="#" onclick="KM.logout(); window.location.href='index.html'; return false;">Logout</a>
      `;
    }

    navEl.innerHTML = `
      <div class="container">
        <a href="index.html" class="brand"><span class="mark"></span> Kisan Market</a>
        <ul class="nav-links">${links}</ul>
      </div>
    `;
  }

  function renderFooter() {
    const el = document.getElementById('footer');
    if (!el) return;
    el.innerHTML = `&copy; 2026 Kisan Market &mdash; Direct to Consumer Web Application`;
  }

  /* ---------- Init ---------- */
  seed();

  return {
    login, register, logout, currentUser, requireRole,
    getProducts, addProduct, updateProduct, deleteProduct,
    getOrders, placeOrder, updateOrderStatus,
    getUsers, updateUserStatus,
    initials, renderNavbar, renderFooter
  };
})();
