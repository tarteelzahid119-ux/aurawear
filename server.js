const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'aurawear_secret_key';

app.use(cors());
app.use(express.json());

let products = [
  {
    id: 1,
    name: 'Minimalist Oversized Tee',
    category: 'Men',
    price: 38,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    description: '100% organic heavy-weight cotton tee with a relaxed drop-shoulder silhouette.',
    reviews: [{ user: 'Alex M.', rating: 5, comment: 'Super soft and heavy quality!' }]
  },
  {
    id: 2,
    name: 'Vintage Wash Denim Jacket',
    category: 'Men',
    price: 110,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    description: 'Classic fit denim jacket featuring custom metal hardware and subtle distressing.',
    reviews: []
  },
  {
    id: 3,
    name: 'Linen Tiered Summer Dress',
    category: 'Women',
    price: 85,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
    description: 'Breathable linen dress designed with a flattering square neck and tiered skirt.',
    reviews: [{ user: 'Elena R.', rating: 5, comment: 'Perfect summer dress, light and airy.' }]
  },
  {
    id: 4,
    name: 'Structured Leather Tote',
    category: 'Accessories',
    price: 140,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
    description: 'Vegetable-tanned leather handbag with soft suede lining and magnetic closure.',
    reviews: []
  },
  {
    id: 5,
    name: 'Monochrome Chunky Sneakers',
    category: 'Shoes',
    price: 95,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
    description: 'Modern everyday sneakers built with cushioned insoles and durable rubber outsoles.',
    reviews: []
  },
  {
    id: 6,
    name: 'Neutral Fleece Pullover Hoodie',
    category: 'Men',
    price: 65,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
    description: 'Cozy brushed fleece hoodie styled with minimal branding and a clean hem.',
    reviews: []
  }
];

let cart = [];
// BACKEND API ENDPOINTS

const verifyAdminToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Auth token required' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
    if (decoded.role !== 'admin') throw new Error();
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
    return res.json({ token, message: 'Logged in successfully' });
  }
  return res.status(400).json({ message: 'Invalid credentials' });
});

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', verifyAdminToken, (req, res) => {
  const { name, category, price, image, description } = req.body;
  const newProduct = {
    id: Date.now(),
    name,
    category: category || 'General',
    price: parseFloat(price),
    rating: 5.0,
    image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    description: description || 'New premium item.',
    reviews: []
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== parseInt(id));
  res.json({ message: 'Product deleted successfully' });
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { user, rating, comment } = req.body;
  const product = products.find((p) => p.id === parseInt(id));

  if (!product) return res.status(404).json({ message: 'Product not found' });

  const newReview = { user: user || 'Anonymous', rating: parseInt(rating), comment };
  product.reviews.push(newReview);

  const total = product.reviews.reduce((acc, curr) => acc + curr.rating, 0);
  product.rating = parseFloat((total / product.reviews.length).toFixed(1));

  res.json(product);
});

app.get('/api/cart', (req, res) => res.json(cart));

app.post('/api/cart', (req, res) => {
  const { product } = req.body;
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  res.json(cart);
});

app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  cart = cart.filter((item) => item.id !== parseInt(id));
  res.json(cart);
});

// FRONTEND BUNDLE 
app.use((req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AuraWear | Modern E-Commerce</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <style>
        :root {
          --bg-primary: #fbf9f5;
          --bg-card: #ffffff;
          --text-main: #2b2b2b;
          --text-muted: #737373;
          --accent-sage: #5f7461;
          --accent-hover: #485949;
          --border-light: #ece7e0;
          --shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .dark-mode {
          --bg-primary: #18181b;
          --bg-card: #27272a;
          --text-main: #f4f4f5;
          --text-muted: #a1a1aa;
          --accent-sage: #829a85;
          --accent-hover: #9bb19d;
          --border-light: #3f3f46;
          --shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; transition: background-color 0.2s, color 0.2s; }
        body { background-color: var(--bg-primary); color: var(--text-main); }
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 8%; background: var(--bg-card); border-bottom: 1px solid var(--border-light); position: sticky; top: 0; z-index: 100; }
        .logo { font-size: 1.5rem; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
        .nav-links { display: flex; gap: 1.5rem; align-items: center; }
        .nav-btn { background: none; border: none; color: var(--text-main); font-size: 0.95rem; font-weight: 500; cursor: pointer; }
        .hero { display: flex; align-items: center; justify-content: space-between; padding: 4rem 8%; min-height: 65vh; gap: 2rem; }
        .hero-text h1 { font-size: 3rem; line-height: 1.15; margin-bottom: 1rem; }
        .hero-text p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2rem; max-width: 450px; }
        .btn-primary { background: var(--accent-sage); color: #fff; padding: 0.8rem 2rem; border: none; border-radius: 40px; font-weight: 600; cursor: pointer; }
        .btn-primary:hover { background: var(--accent-hover); }
        .hero-image img { width: 100%; max-width: 420px; border-radius: 20px; box-shadow: var(--shadow-soft); }
        .categories { padding: 3rem 8%; text-align: center; }
        .section-title { font-size: 1.8rem; margin-bottom: 2rem; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
        .category-card { background: var(--bg-card); padding: 1.5rem; border-radius: 14px; border: 1px solid var(--border-light); cursor: pointer; font-weight: 600; }
        .products-section { padding: 3rem 8%; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
        .product-card { background: var(--bg-card); border-radius: 16px; padding: 1rem; border: 1px solid var(--border-light); display: flex; flex-direction: column; }
        .product-card img { width: 100%; height: 260px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem; }
        .product-price { font-weight: 700; font-size: 1.1rem; margin: 0.4rem 0; color: var(--accent-sage); }
        .card-actions { margin-top: auto; display: flex; gap: 0.5rem; }
        .btn-secondary { flex: 1; padding: 0.6rem; border: 1px solid var(--border-light); background: transparent; color: var(--text-main); border-radius: 10px; cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: var(--bg-card); padding: 2rem; border-radius: 18px; max-width: 480px; width: 90%; max-height: 85vh; overflow-y: auto; border: 1px solid var(--border-light); }
        .admin-form input, .admin-form textarea, .admin-form select { width: 100%; padding: 0.7rem; margin-bottom: 0.8rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-main); }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; padding: 3rem 8%; background: var(--bg-card); border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); text-align: center; }
        footer { padding: 2rem 8%; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
        @media (max-width: 768px) { .hero { flex-direction: column; text-align: center; } }
      </style>
    </head>
    <body>
      <div id="root"></div>

      <script type="text/babel">
        const { useState, useEffect } = React;
        const API_BASE = '/api';

        function App() {
          const [darkMode, setDarkMode] = useState(false);
          const [products, setProducts] = useState([]);
          const [cart, setCart] = useState([]);
          const [selectedCategory, setSelectedCategory] = useState('All');
          const [currentView, setCurrentView] = useState('shop');
          const [selectedProduct, setSelectedProduct] = useState(null);

          const [token, setToken] = useState(localStorage.getItem('aurawear_token') || '');
          const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
          const [newProduct, setNewProduct] = useState({ name: '', category: 'Men', price: '', image: '', description: '' });
          const [reviewForm, setReviewForm] = useState({ user: '', rating: 5, comment: '' });

          useEffect(() => {
            fetchProducts();
            fetchCart();
          }, []);

          const fetchProducts = async () => {
            const res = await fetch(\`\${API_BASE}/products\`);
            const data = await res.json();
            setProducts(data);
          };

          const fetchCart = async () => {
            const res = await fetch(\`\${API_BASE}/cart\`);
            const data = await res.json();
            setCart(data);
          };

          const addToCart = async (product) => {
            const res = await fetch(\`\${API_BASE}/cart\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product })
            });
            setCart(await res.json());
          };

          const removeFromCart = async (id) => {
            const res = await fetch(\`\${API_BASE}/cart/\${id}\`, { method: 'DELETE' });
            setCart(await res.json());
          };

          const handleAdminLogin = async (e) => {
            e.preventDefault();
            const res = await fetch(\`\${API_BASE}/admin/login\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loginCreds)
            });
            const data = await res.json();
            if (res.ok) {
              setToken(data.token);
              localStorage.setItem('aurawear_token', data.token);
            } else {
              alert(data.message);
            }
          };

          const handleAddProduct = async (e) => {
            e.preventDefault();
            const res = await fetch(\`\${API_BASE}/products\`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: \`Bearer \${token}\`
              },
              body: JSON.stringify(newProduct)
            });
            if (res.ok) {
              fetchProducts();
              setNewProduct({ name: '', category: 'Men', price: '', image: '', description: '' });
            }
          };

          const handleDeleteProduct = async (id) => {
            const res = await fetch(\`\${API_BASE}/products/\${id}\`, {
              method: 'DELETE',
              headers: { Authorization: \`Bearer \${token}\` }
            });
            if (res.ok) fetchProducts();
          };

          const handleAddReview = async (e) => {
            e.preventDefault();
            const res = await fetch(\`\${API_BASE}/products/\${selectedProduct.id}/reviews\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(reviewForm)
            });
            if (res.ok) {
              const updatedProduct = await res.json();
              setSelectedProduct(updatedProduct);
              fetchProducts();
              setReviewForm({ user: '', rating: 5, comment: '' });
            }
          };

          const filteredProducts = selectedCategory === 'All'
            ? products
            : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

          const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

          return (
            <div className={\`app \${darkMode ? 'dark-mode' : ''}\`}>
              <nav className="navbar">
                <div className="logo" onClick={() => setCurrentView('shop')}>AURAWEAR</div>
                <div className="nav-links">
                  <button className="nav-btn" onClick={() => setCurrentView('shop')}>Shop</button>
                  <button className="nav-btn" onClick={() => setCurrentView('admin')}>Admin</button>
                  <button className="nav-btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️' : '🌙'}</button>
                  <button className="btn-primary" onClick={() => setCurrentView('cart')}>
                    Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
                  </button>
                </div>
              </nav>

              {currentView === 'shop' && (
                <>
                  <section className="hero">
                    <div className="hero-text">
                      <h1>Elevate Your Style</h1>
                      <p>Discover minimal, timeless fashion crafted for everyday comfort and modern aesthetics.</p>
                      <button className="btn-primary" onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}>Shop Now</button>
                    </div>
                    <div className="hero-image">
                      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800" alt="Hero" />
                    </div>
                  </section>

                  <section className="categories">
                    <h2 className="section-title">Categories</h2>
                    <div className="category-grid">
                      {['All', 'Women', 'Men', 'Accessories', 'Shoes'].map(cat => (
                        <div key={cat} className="category-card" style={{ borderColor: selectedCategory === cat ? 'var(--accent-sage)' : 'var(--border-light)' }} onClick={() => setSelectedCategory(cat)}>
                          {cat}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="products-section" id="catalog">
                    <h2 className="section-title">{selectedCategory} Collection</h2>
                    <div className="product-grid">
                      {filteredProducts.map(p => (
                        <div className="product-card" key={p.id}>
                          <img src={p.image} alt={p.name} />
                          <h3>{p.name}</h3>
                          <div style={{ color: '#eab308' }}>⭐ {p.rating}</div>
                          <p className="product-price">\${p.price.toFixed(2)}</p>
                          <div className="card-actions">
                            <button className="btn-secondary" onClick={() => setSelectedProduct(p)}>Details</button>
                            <button className="btn-primary" onClick={() => addToCart(p)}>Add</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="features">
                    <div><h3>🚚 Free Delivery</h3><p style={{ color: 'var(--text-muted)' }}>On orders over $75</p></div>
                    <div><h3>🔄 Easy Returns</h3><p style={{ color: 'var(--text-muted)' }}>30-day policy</p></div>
                    <div><h3>🔒 Secure Payment</h3><p style={{ color: 'var(--text-muted)' }}>Encrypted checkout</p></div>
                  </section>
                </>
              )}

              {currentView === 'cart' && (
                <section className="products-section" style={{ minHeight: '60vh' }}>
                  <h2 className="section-title">Your Cart</h2>
                  {cart.length === 0 ? <p style={{ textAlign: 'center' }}>Your cart is empty.</p> : (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                      {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                          <div><h4>{item.name}</h4><p>\${item.price} x {item.quantity}</p></div>
                          <button className="btn-secondary" onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                      ))}
                      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <h3>Total: \${cartTotal.toFixed(2)}</h3>
                        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => alert('Order Placed!')}>Checkout</button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {currentView === 'admin' && (
                <section className="products-section" style={{ minHeight: '60vh' }}>
                  {!token ? (
                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                      <h2 className="section-title">Admin Login</h2>
                      <form onSubmit={handleAdminLogin} className="admin-form">
                        <input type="text" placeholder="Username (admin)" value={loginCreds.username} onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })} />
                        <input type="password" placeholder="Password (admin123)" value={loginCreds.password} onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })} />
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
                      </form>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h2>Product Admin</h2>
                        <button className="btn-secondary" onClick={() => { setToken(''); localStorage.removeItem('aurawear_token'); }}>Logout</button>
                      </div>
                      <form onSubmit={handleAddProduct} className="admin-form">
                        <h3>Add Product</h3>
                        <input type="text" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                        <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                          <option value="Men">Men</option><option value="Women">Women</option><option value="Accessories">Accessories</option><option value="Shoes">Shoes</option>
                        </select>
                        <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                        <input type="text" placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                        <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
                        <button type="submit" className="btn-primary">Publish</button>
                      </form>
                      <h3 style={{ marginTop: '2rem' }}>Inventory</h3>
                      {products.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border-light)' }}>
                          <span>{p.name} - \${p.price}</span>
                          <button className="btn-secondary" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} />
                    <h2 style={{ marginTop: '1rem' }}>{selectedProduct.name}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{selectedProduct.description}</p>
                    <h3 style={{ color: 'var(--accent-sage)', margin: '0.5rem 0' }}>\${selectedProduct.price}</h3>
                    <hr style={{ margin: '1rem 0', borderColor: 'var(--border-light)' }} />
                    <h3>Reviews (⭐ {selectedProduct.rating})</h3>
                    {selectedProduct.reviews.map((r, i) => (
                      <div key={i} style={{ margin: '0.5rem 0' }}><strong>{r.user}</strong>: {r.comment}</div>
                    ))}
                    <form onSubmit={handleAddReview} className="admin-form" style={{ marginTop: '1rem' }}>
                      <input type="text" placeholder="Your Name" value={reviewForm.user} onChange={e => setReviewForm({ ...reviewForm, user: e.target.value })} required />
                      <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                        <option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option>
                      </select>
                      <textarea placeholder="Comment" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required></textarea>
                      <button type="submit" className="btn-primary" style={{ width: '100%' }}>Post Review</button>
                    </form>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setSelectedProduct(null)}>Close</button>
                  </div>
                </div>
              )}

              <footer>© 2026 AuraWear. Minimalist Fashion.</footer>
            </div>
          );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`\n🚀 AuraWear Website Running at: http://localhost:${PORT}\n`));