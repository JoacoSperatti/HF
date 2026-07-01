import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, increment, updateDoc } from 'firebase/firestore';
import AdminPage from './AdminPage';
import { 
  ShoppingCart, 
  ShoppingBag, 
  Search, 
  Star, 
  Trash2, 
  Plus, 
  Minus, 
  Info, 
  Phone, 
  MapPin, 
  Clock, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Droplet, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  X,
  ChevronRight
} from 'lucide-react';

const InstagramIcon = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);



function App() {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('hf_quimica_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error("Error loading cart from storage", e);
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Quantity selector state for product cards
  const [productQuantities, setProductQuantities] = useState({});
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    address: '',
    delivery: 'retiro',
    payment: 'transferencia'
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  // Firebase Admin states



  // Fetch products from Firebase Firestore
  const fetchProductsFromFirebase = async () => {
    if (!isFirebaseConfigured || !db) return;
    setIsLoadingProducts(true);
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const loadedProducts = [];
      querySnapshot.forEach((doc) => {
        loadedProducts.push({ id: doc.id, ...doc.data() });
      });
      if (loadedProducts.length > 0) {
        setProducts(loadedProducts);
      }
    } catch (error) {
      console.error("Error fetching products from Firestore:", error);
      console.error("Error");
    } finally {
      setIsLoadingProducts(false);
    }
  };


  // Fetch products on mount
  useEffect(() => {
    if (isFirebaseConfigured) {
      fetchProductsFromFirebase();
      
      // Track visitor
      if (!sessionStorage.getItem('hf_visited')) {
        const trackVisitor = async () => {
          try {
            const visitorRef = doc(db, 'analytics', 'visitors');
            await setDoc(visitorRef, { count: increment(1) }, { merge: true });
            sessionStorage.setItem('hf_visited', 'true');
          } catch (e) {
             console.error("Error tracking visitor", e);
          }
        };
        trackVisitor();
      }
    }
  }, []);


  // Intersection Observer to track scroll position and update active section highlight
  useEffect(() => {
    const sections = ['home', 'productos', 'nosotros', 'contacto'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);



  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('hf_quimica_cart', JSON.stringify(cart));
  }, [cart]);

  // Get quantity for a product in the card selector
  const getProductQty = (productId) => productQuantities[productId] || 1;

  const setProductQty = (productId, qty) => {
    const parsed = parseInt(qty, 10);
    const val = isNaN(parsed) ? 1 : Math.max(1, parsed);
    setProductQuantities(prev => ({ ...prev, [productId]: val }));
  };

  const incrementProductQty = (productId) => {
    setProductQuantities(prev => ({ ...prev, [productId]: (prev[productId] || 1) + 1 }));
  };

  const decrementProductQty = (productId) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  // Cart operations — do NOT auto-open cart on add
  const addToCart = (product, quantity = 1) => {
    if (product.stock !== undefined && product.stock <= 0) return;
    let qtyToAdd = quantity;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      let newQty = qtyToAdd;
      if (existingItem) {
        newQty = existingItem.quantity + qtyToAdd;
      }
      if (product.stock !== undefined && newQty > product.stock) {
        newQty = product.stock;
        qtyToAdd = newQty - (existingItem ? existingItem.quantity : 0);
      }
      if (qtyToAdd <= 0) return prevCart;
      
      if (existingItem) {
        return prevCart.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      return [...prevCart, { product, quantity: newQty }];
    });

    if (qtyToAdd > 0) {
      Swal.fire({
        icon: 'success',
        title: 'Agregado al carrito',
        text: `${qtyToAdd}x ${product.name}`,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#16213e',
        color: '#fff'
      });
    }
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.product.id === productId) {
          let newQty = item.quantity + amount;
          if (item.product.stock !== undefined && newQty > item.product.stock) newQty = item.product.stock;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const updateCartItemQuantityDirect = (productId, value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) return;
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.product.id === productId) {
           let newQty = parsed;
           if (item.product.stock !== undefined && newQty > item.product.stock) newQty = item.product.stock;
           return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter & Sort products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'popular') return b.rating - a.rating;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  // Handle forms
  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const submitContactForm = (e) => {
    e.preventDefault();
    setContactStatus('loading');
    setTimeout(() => {
      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactStatus(null), 5000);
    }, 1000);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    // Deduct stock in Firestore
    for (const item of cart) {
      if (item.product.id) {
        try {
          const productRef = doc(db, 'productos', item.product.id);
          await updateDoc(productRef, {
            stock: increment(-item.quantity)
          });
        } catch (error) {
          console.error("Error updating stock:", error);
        }
      }
    }
    
    // Background refresh products after order
    fetchProductsFromFirebase();

    let orderNumber = parseInt(localStorage.getItem('hf_quimica_order_number') || '1000', 10);
    orderNumber += 1;
    localStorage.setItem('hf_quimica_order_number', orderNumber.toString());

    const orderItems = cart.map(
      (item) => `• *${item.product.name}* [${item.product.volume}] (Cant: ${item.quantity}) - $${(item.product.price * item.quantity).toLocaleString('es-AR')}`
    ).join('\n');
    
    const formattedTotal = cartTotal.toLocaleString('es-AR');
    
    const message = `*HF QUÍMICA - NUEVO PEDIDO (#${orderNumber})*\n\n` +
      `👤 *Cliente:* ${checkoutForm.name}\n` +
      `📍 *Dirección:* ${checkoutForm.address || 'No especificada'}\n` +
      `🚚 *Método:* ${checkoutForm.delivery === 'envio' ? 'Envío a Domicilio' : 'Retiro / Punto de encuentro'}\n` +
      `💳 *Forma de Pago:* ${checkoutForm.payment === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'}\n\n` +
      `🛒 *Detalle del Pedido:*\n${orderItems}\n\n` +
      `💵 *TOTAL:* *$${formattedTotal}*\n\n` +
      `⚠️ *Aclaración:* Para confirmar la compra mediante transferencia, enviar el comprobante de pago.\n` +
      `*Alias:* hf.quimica.mp\n\n` +
      `¡Muchas gracias! Aguardo la confirmación de la cotización.`;
      
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "5491144006282";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = "5491144006282";
    const message = encodeURIComponent("Hola! Me comunico desde la web de HF Química, me gustaría hacer una consulta.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };


  return (
    <Routes>
      <Route path="/gestion-interna" element={<AdminPage />} />
      <Route path="*" element={
    <div className="app-container">
      {/* Decorative Bubbles for premium aesthetic */}
      <div className="bubbles-decorator">
        <div className="bubble" style={{ left: '5%', width: '30px', height: '30px', animationDelay: '0s', bottom: '10%' }}></div>
        <div className="bubble" style={{ left: '20%', width: '15px', height: '15px', animationDelay: '2s', bottom: '5%' }}></div>
        <div className="bubble" style={{ left: '85%', width: '40px', height: '40px', animationDelay: '4s', bottom: '15%' }}></div>
        <div className="bubble" style={{ left: '92%', width: '20px', height: '20px', animationDelay: '1s', bottom: '8%' }}></div>
      </div>

      {/* --- FLOATING WHATSAPP BUTTON --- */}
      <button
        className="whatsapp-fab"
        onClick={openWhatsApp}
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </button>

      {/* --- HEADER --- */}
      <header>
        <div className="container header-inner">
          <a href="#" className="logo-container" onClick={() => scrollToSection('home')}>
            <img src="/favicon.png" className="logo-img" alt="HF Química Logo" />
            <div className="logo-text">
              <span>HF Química</span>
              <span className="logo-slogan">Limpieza &amp; Calidad</span>
            </div>
          </a>

          <nav className="nav-links">
            <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Inicio</a>
            <a href="#productos" className={`nav-link ${activeSection === 'productos' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>Catálogo</a>
            <a href="#nosotros" className={`nav-link ${activeSection === 'nosotros' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollToSection('nosotros'); }}>Nosotros</a>
            <a href="#contacto" className={`nav-link ${activeSection === 'contacto' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); scrollToSection('contacto'); }}>Contacto</a>
          </nav>

          <div className="nav-actions">
            <div className="search-bar-container">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              className="icon-btn" 
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-tag">🌟 Fabricación Local</span>
            <h1 className="hero-title">Limpieza que se ve, Calidad que se siente</h1>
            <p className="hero-desc">
              Descubrí nuestra amplia gama de productos de limpieza ultra concentrados para el hogar, piletas, textil e higiene. Entregas en Buenos Aires y envíos a todo el país.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => scrollToSection('productos')}>
                Ver Catálogo <ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary" onClick={() => scrollToSection('nosotros')}>
                Saber Más
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              <video
                src="/3B2E5F33-7FAE-4F7D-BEDB-81F4CD501453.mov"
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES / DETAILS INFO --- */}
      <section className="info-section">
        <div className="container info-grid">
          <div className="info-card">
            <div className="info-icon-wrapper">
              <Sparkles size={24} />
            </div>
            <h3 className="info-title">Fórmulas Concentradas</h3>
            <p className="info-desc">Mayor rendimiento por litro, ahorrando dinero en cada uso.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon-wrapper">
              <Droplet size={24} />
            </div>
            <h3 className="info-title">Biodegradables</h3>
            <p className="info-desc">Compromiso con el medio ambiente reduciendo químicos agresivos.</p>
          </div>

          <div className="info-card">
            <div className="info-icon-wrapper">
              <Truck size={24} />
            </div>
            <h3 className="info-title">Envíos a Todo el País</h3>
            <p className="info-desc">Entregas en Buenos Aires y envíos a todo el territorio nacional.</p>
          </div>

          <div className="info-card">
            <div className="info-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="info-title">Calidad Garantizada</h3>
            <p className="info-desc">Materias primas premium y rigurosos controles de estabilidad.</p>
          </div>
        </div>
      </section>

      {/* --- PRODUCT CATALOG SECTION --- */}
      <section className="catalog-section" id="productos">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Nuestras Líneas</span>
            <h2 className="section-title">Encontrá el producto ideal</h2>
          </div>

          {/* Category Selector Tabs */}
          <div className="category-tabs">
            <button 
              className={`category-tab ${selectedCategory === 'todos' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('todos')}
            >
              Todos los productos
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'hogar' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('hogar')}
            >
              🏠 Hogar
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'piletas' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('piletas')}
            >
              🏊 Piletas
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'textil' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('textil')}
            >
              👕 Textil
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'higiene' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('higiene')}
            >
              🧴 Higiene
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'combos' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('combos')}
            >
              🎁 Combos Especiales
            </button>
          </div>

          {/* Toolbar sorting / counts */}
          <div className="catalog-toolbar">
            <div className="toolbar-info">
              {isLoadingProducts ? (
                <span>Cargando productos de Firebase...</span>
              ) : (
                <span>Mostrando <strong>{sortedProducts.length}</strong> de <strong>{products.length}</strong> productos</span>
              )}
            </div>
            <div className="toolbar-controls">
              <label htmlFor="sort" className="form-label" style={{ marginBottom: 0 }}>Ordenar por:</label>
              <select 
                id="sort" 
                className="select-input" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Popularidad</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoadingProducts ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div className="loader" style={{ fontSize: '20px', fontWeight: '500' }}>Cargando catálogo...</div>
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="product-grid">
              {sortedProducts.map((product) => (
                <article 
                  className="product-card" 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: 'pointer' }}
                >
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  {(product.stock || 0) <= 0 && <span className="product-badge" style={{ backgroundColor: '#ef4444', color: 'white', top: product.badge ? '44px' : '12px' }}>Sin stock</span>}
                  {(product.stock || 0) > 0 && (product.stock || 0) <= 5 && <span className="product-badge" style={{ backgroundColor: '#f59e0b', color: 'white', top: product.badge ? '44px' : '12px' }}>Poco stock</span>}
                  <span className="product-volume-badge">{product.volume}</span>
                  
                  <div className="product-image-container">
                    <img src={product.image} className="product-image" alt={product.name} style={{ opacity: (product.stock || 0) <= 0 ? 0.5 : 1 }} />
                  </div>
                  
                  <div className="product-content">
                    <span className="product-category-text">{product.category}</span>
                    <h3 className="product-title">{product.name}</h3>
                    
                    <div className="product-rating">
                      <Star size={14} fill="#f59e0b" stroke="none" />
                      <strong>{product.rating}</strong>
                    </div>

                    <p className="product-desc-short">{product.description}</p>
                    
                    <button 
                      className="view-detail-link"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                    >
                      Ver detalles <ChevronRight size={14} />
                    </button>

                    <div className="product-footer">
                      <div className="product-price">
                        <span className="price-value">${product.price.toLocaleString('es-AR')}</span>
                      </div>
                      
                      {/* Quantity selector + add to cart */}
                      <div className="card-qty-add" onClick={(e) => e.stopPropagation()} style={{ opacity: (product.stock || 0) <= 0 ? 0.5 : 1, pointerEvents: (product.stock || 0) <= 0 ? 'none' : 'auto' }}>
                        <div className="card-qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => decrementProductQty(product.id)}
                            aria-label="Disminuir cantidad"
                            disabled={(product.stock || 0) <= 0}
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            className="qty-input-inline"
                            type="number"
                            min="1"
                            max={product.stock || 999}
                            value={getProductQty(product.id)}
                            onChange={(e) => {
                               let val = parseInt(e.target.value, 10);
                               if ((product.stock || 0) >= 0 && val > (product.stock || 0)) val = (product.stock || 0);
                               setProductQty(product.id, val);
                            }}
                            aria-label="Cantidad"
                            disabled={(product.stock || 0) <= 0}
                          />
                          <button
                            className="qty-btn"
                            onClick={() => {
                               if (getProductQty(product.id) < (product.stock || 0)) incrementProductQty(product.id);
                            }}
                            aria-label="Aumentar cantidad"
                            disabled={(product.stock || 0) <= 0 || getProductQty(product.id) >= (product.stock || 0)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => {
                            if ((product.stock || 0) <= 0) return;
                            addToCart(product, getProductQty(product.id));
                            setProductQty(product.id, 1);
                          }}
                          title={(product.stock || 0) <= 0 ? "Sin stock" : "Agregar al carrito"}
                          aria-label={`Agregar ${product.name} al carrito`}
                          disabled={(product.stock || 0) <= 0}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <h3>No encontramos productos para tu búsqueda.</h3>
              <p style={{ marginTop: '10px' }}>Probá quitando filtros o escribiendo otra palabra.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- ABOUT US SECTION --- */}
      <section className="about-section" id="nosotros">
        <div className="container about-grid">
          <div className="about-content">
            <span className="section-subtitle" style={{ alignSelf: 'flex-start' }}>Quiénes Somos</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>HF Química Profesional</h2>
            <p>
              Nacimos con el objetivo de brindar soluciones efectivas y de calidad superior para la higiene del hogar, el cuidado textil y el tratamiento de piletas. Diseñamos nuestras fórmulas bajo estrictas normas de control para garantizar el máximo rendimiento con la menor huella de residuo químico.
            </p>
            <p>
              A través de nuestro canal de distribución directo, logramos llegar a hogares, lavaderos, consorcios y profesionales en todo el país con precios altamente competitivos. Realizamos entregas en Buenos Aires y envíos a todo el territorio nacional.
            </p>
            
            <div className="about-bullets">
              <div className="bullet-item">
                <Check className="bullet-icon" size={20} />
                <div className="bullet-text">
                  <h4>Venta Directa de Fábrica</h4>
                  <p>Sin intermediarios, asegurando la mejor relación costo-calidad del mercado.</p>
                </div>
              </div>
              <div className="bullet-item">
                <Check className="bullet-icon" size={20} />
                <div className="bullet-text">
                  <h4>Asesoramiento Especializado</h4>
                  <p>Guiamos tu compra para que uses la dosis exacta para cada necesidad.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-logo-wrapper">
            <img src="/favicon.png" className="about-logo-image" alt="HF Química Logo Circular" />
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section className="contact-section" id="contacto">
        <div className="container contact-grid">
          <div className="contact-info-panel">
            <div>
              <span className="section-subtitle">Contacto</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>¿Tenés alguna consulta?</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Escribinos tus dudas sobre diluciones, stock mayorista o pedidos especiales. Te responderemos a la brevedad.
              </p>
            </div>

            <div className="contact-detail">
              <div className="contact-detail-icon">
                <Phone size={20} />
              </div>
              <div className="contact-detail-text">
                <h4>Teléfono / WhatsApp</h4>
                <p>+54 9 11 4400-6282</p>
              </div>
            </div>

            <div className="contact-detail">
              <div className="contact-detail-icon">
                <MapPin size={20} />
              </div>
              <div className="contact-detail-text">
                <h4>Zona de Distribución</h4>
                <p>Entregas en Buenos Aires · Envíos a todo el país</p>
              </div>
            </div>

            <div className="contact-detail">
              <div className="contact-detail-icon">
                <Clock size={20} />
              </div>
              <div className="contact-detail-text">
                <h4>Horario Comercial</h4>
                <p>Lunes a Viernes: 09:00 a 18:00 hs{"\n"}Sábados: 09:00 a 13:00 hs</p>
              </div>
            </div>

            <div>
              <h4>Seguinos en redes</h4>
              <div className="social-links">
                <a 
                  href="https://www.instagram.com/hf.quimicos/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn"
                  title="Seguinos en Instagram"
                  aria-label="Instagram de HF Químicos"
                >
                  <InstagramIcon size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-panel">
            <h3 style={{ marginBottom: '24px' }}>Envianos un mensaje</h3>
            <form onSubmit={submitContactForm}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Nombre y Apellido</label>
                <input 
                  type="text" 
                  id="contact-name" 
                  name="name" 
                  className="form-input" 
                  placeholder="Tu nombre completo"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="contact-email" 
                  name="email" 
                  className="form-input" 
                  placeholder="ejemplo@correo.com"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-msg">Mensaje / Consulta</label>
                <textarea 
                  id="contact-msg" 
                  name="message" 
                  className="form-input" 
                  placeholder="Escribí acá tu consulta..."
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {contactStatus === 'loading' ? 'Enviando...' : 'Enviar Consulta'}
              </button>

              {contactStatus === 'success' && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#166534', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Check size={16} /> ¡Consulta recibida! Nos pondremos en contacto pronto.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <img src="/favicon.png" className="footer-brand-logo-img" alt="HF Logo Small" />
                <span className="footer-brand-name">HF QUÍMICA</span>
              </div>
              <p className="footer-brand-desc">
                Productos de limpieza y química profesional: jabón líquido, detergente, desengrasante, lavandina, cloro para piletas, suavizante textil, blanqueador y más. Entregas en Buenos Aires y envíos a todo el país.
              </p>
            </div>

            <div>
              <h3 className="footer-title">Navegación</h3>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Inicio</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>Catálogo de Productos</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('nosotros'); }}>Sobre Nosotros</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contacto'); }}>Contacto &amp; Consultas</a></li>

              </ul>
            </div>

            <div>
              <h3 className="footer-title">Contacto</h3>
              <ul className="footer-links" style={{ fontSize: '14px' }}>
                <li>📍 Entregas en Buenos Aires</li>
                <li>🚚 Envíos a todo el país</li>
                <li>📞 +54 9 11 4400-6282</li>
                <li>⏰ Lun a Vie 9:00 - 18:00hs</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} HF Química. Todos los derechos reservados. Desarrollado por{' '}
              <a 
                href="https://portafolio-joaquinsperatti.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline', color: 'inherit' }}
              >
                JOAQUÍN SPERATTI
              </a>.
            </p>
            <div className="footer-payments">
              <span className="payment-badge">Efectivo</span>
              <span className="payment-badge">Transferencia</span>
              <span className="payment-badge">MercadoPago</span>
            </div>
          </div>
        </div>
      </footer>


      {/* ==================== CART DRAWER SIDEBAR ==================== */}
      {isCartOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}></div>
          <div className="drawer">
            <div className="drawer-header">
              <h3 className="drawer-title">
                <ShoppingCart size={22} />
                Mi Carrito ({cartItemCount})
              </h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-content">
              {cart.length > 0 ? (
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.product.id}>
                      <img src={item.product.image} className="cart-item-img" alt={item.product.name} />
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">{item.product.name}</h4>
                        <span className="cart-item-volume">{item.product.volume}</span>
                        <span className="cart-item-price">${item.product.price.toLocaleString('es-AR')}</span>
                      </div>
                      
                      <div className="cart-item-actions">
                        <div className="quantity-controller">
                          <button className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)} aria-label="Disminuir cantidad">
                            <Minus size={12} />
                          </button>
                          <input
                            className="qty-value qty-input-cart"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantityDirect(item.product.id, e.target.value)}
                            aria-label="Cantidad"
                          />
                          <button className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)} aria-label="Aumentar cantidad">
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        <button 
                          className="remove-item-btn" 
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label={`Eliminar ${item.product.name} del carrito`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cart-empty">
                  <ShoppingBag size={48} className="cart-empty-icon" />
                  <h4>Tu carrito está vacío</h4>
                  <p>¡Explorá nuestro catálogo y sumá tus productos de limpieza!</p>
                  <button className="btn btn-primary" onClick={() => { setIsCartOpen(false); scrollToSection('productos'); }} style={{ marginTop: '12px' }}>
                    Ir a comprar
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="cart-summary-row" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span>Envío / Distribución</span>
                  <span style={{ color: 'var(--secondary-light)', fontWeight: '600' }}>A coordinar</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total estimado</span>
                  <span className="cart-summary-total-price">${cartTotal.toLocaleString('es-AR')}</span>
                </div>

                <div style={{ margin: '12px 0', padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                  <strong>Importante:</strong> Para confirmar la compra con transferencia, recordá enviar el comprobante de pago.<br/>
                  <strong>Alias:</strong> <code style={{ userSelect: 'all', fontWeight: 'bold' }}>hf.quimica.mp</code>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 28px' }}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Confirmar Pedido por WhatsApp
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== PRODUCT DETAIL MODAL ==================== */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedProduct(null)} aria-label="Cerrar modal">
              <X size={20} />
            </button>

            <div className="product-detail-layout">
              <div className="detail-img-container">
                <img src={selectedProduct.image} className="detail-img" alt={selectedProduct.name} />
              </div>

              <div className="detail-info">
                <span className="product-category-text" style={{ fontSize: '13px' }}>{selectedProduct.category}</span>
                <h2 className="detail-title">{selectedProduct.name}</h2>
                
                <div className="detail-meta">
                  <div className="product-rating" style={{ fontSize: '15px' }}>
                    <Star size={16} fill="#f59e0b" stroke="none" />
                    <strong>{selectedProduct.rating}</strong> 
                  </div>
                  <span className="product-volume-badge" style={{ position: 'static' }}>Tamaño: {selectedProduct.volume}</span>
                </div>
                {(selectedProduct.stock || 0) <= 0 && (
                  <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 10px', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                    Sin stock
                  </div>
                )}
                {(selectedProduct.stock || 0) > 0 && (selectedProduct.stock || 0) <= 5 && (
                  <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 10px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                    Poco stock
                  </div>
                )}

                <div className="detail-price">
                  ${selectedProduct.price.toLocaleString('es-AR')}
                </div>

                <div className="detail-tab-content" style={{ marginTop: '12px' }}>
                  <p>{selectedProduct.description}</p>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', opacity: (selectedProduct.stock || 0) <= 0 ? 0.5 : 1 }}
                  onClick={() => { if ((selectedProduct.stock || 0) > 0) { addToCart(selectedProduct, 1); setSelectedProduct(null); } }}
                  disabled={(selectedProduct.stock || 0) <= 0}
                >
                  {(selectedProduct.stock || 0) <= 0 ? 'Sin stock' : 'Agregar al Carrito'} {(selectedProduct.stock || 0) > 0 && <Plus size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHECKOUT MODAL ==================== */}
      {isCheckoutOpen && (
        <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal modal-checkout" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setIsCheckoutOpen(false)} aria-label="Cerrar checkout">
              <X size={20} />
            </button>

            <div style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--primary)' }}>Completar Pedido</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Ingresá tus datos para que podamos recibir tu pedido y comunicarnos con vos para coordinar el pago y la entrega.
              </p>

              <form onSubmit={handleCheckoutSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-name">Nombre y Apellido</label>
                  <input 
                    type="text" 
                    id="checkout-name" 
                    name="name" 
                    className="form-input" 
                    placeholder="Ej: Juan Pérez"
                    value={checkoutForm.name}
                    onChange={handleCheckoutChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-address">Dirección</label>
                  <input 
                    type="text" 
                    id="checkout-address" 
                    name="address" 
                    className="form-input" 
                    placeholder="Ej: Av. Rivadavia 1234, CABA"
                    value={checkoutForm.address}
                    onChange={handleCheckoutChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-delivery">Método de Distribución</label>
                  <select 
                    id="checkout-delivery" 
                    name="delivery" 
                    className="select-input" 
                    style={{ width: '100%' }}
                    value={checkoutForm.delivery}
                    onChange={handleCheckoutChange}
                  >
                    <option value="retiro">Retiro / Punto de encuentro (Buenos Aires)</option>
                    <option value="envio">Envío a Domicilio — Todo el país (coordinar costo)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-payment">Preferencia de Pago</label>
                  <select 
                    id="checkout-payment" 
                    name="payment" 
                    className="select-input" 
                    style={{ width: '100%' }}
                    value={checkoutForm.payment}
                    onChange={handleCheckoutChange}
                  >
                    <option value="transferencia">Transferencia bancaria</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <div>
                      Al dar click, se generará el mensaje en tu WhatsApp. <strong>El pedido solo quedará confirmado una vez enviado el mensaje.</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div>
                      <strong>Importante:</strong> Para confirmar la compra mediante transferencia, enviar el comprobante de pago.
                      <br />
                      <strong>Alias:</strong> <code style={{ userSelect: 'all', fontWeight: 'bold' }}>hf.quimica.mp</code>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '24px', padding: '14px' }}
                >
                  Enviar Pedido (${cartTotal.toLocaleString('es-AR')})
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
      }
      />
    </Routes>
  );
}

export default App;
