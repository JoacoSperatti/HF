import { useState, useEffect } from 'react';
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

const PRODUCTS = [
  {
    id: 1,
    name: "Jabón Líquido Premium para Ropa",
    category: "hogar",
    price: 2800,
    volume: "5 Litros",
    rating: 4.8,
    reviews: 124,
    badge: "Más Vendido",
    image: "/category_home.jpg",
    description: "Fórmula concentrada de lavado profundo con enzimas activas. Elimina las manchas más difíciles dejando una fragancia floral duradera que perdura semanas. Protege los colores de las prendas y es apto para lavarropas automáticos y lavado a mano.",
    usage: "Diluir 100ml de jabón líquido por cada carga completa de lavarropas (aproximadamente 5-6 kg de ropa). Para manchas rebeldes, aplicar directamente sobre la tela antes del lavado.",
    safety: "Mantener fuera del alcance de niños y mascotas. En caso de contacto con los ojos, enjuagar con abundante agua. No ingerir."
  },
  {
    id: 2,
    name: "Suavizante de Telas 'Caricias de Algodón'",
    category: "hogar",
    price: 2600,
    volume: "5 Litros",
    rating: 4.7,
    reviews: 98,
    badge: "Eco-friendly",
    image: "/category_home.jpg",
    description: "Acondiciona las fibras de tus prendas otorgando una suavidad excepcional al tacto. Su fórmula anti-estática facilita el planchado y previene la formación de pelotitas en la ropa. Aromatizado con notas florales suaves.",
    usage: "Agregar 80ml de suavizante en el compartimiento correspondiente del lavarropas en el último ciclo de enjuague. No verter directamente sobre las telas.",
    safety: "No mezclar con otros productos de lavado. Conservar en lugar fresco y seco."
  },
  {
    id: 3,
    name: "Desengrasante Multiuso Ultra Concentrado",
    category: "hogar",
    price: 1800,
    volume: "1 Litro",
    rating: 4.9,
    reviews: 156,
    badge: "Fórmula Activa",
    image: "/category_combos.jpg",
    description: "Remueve de forma instantánea la grasa, el aceite y la suciedad más adherida en cocinas, campanas, parrillas y superficies lavables. Su acción desengrasante disuelve los depósitos grasos en segundos sin dañar metales ni cerámicos.",
    usage: "Para limpieza pesada, usar puro o diluido 1:1 con agua. Para superficies generales, diluir 100ml en 1 litro de agua y aplicar con rociador o esponja.",
    safety: "Utilizar guantes durante su uso. Evitar el contacto con piel y ojos. Usar en ambientes ventilados."
  },
  {
    id: 4,
    name: "Detergente Vajilla Activo Limón",
    category: "hogar",
    price: 1200,
    volume: "1 Litro",
    rating: 4.6,
    reviews: 75,
    badge: "Mayor Espuma",
    image: "/category_combos.jpg",
    description: "Detergente de vajilla de alto rendimiento con pH neutro para el cuidado de tus manos. Su poder antigrasa con extracto natural de limón corta la suciedad en ollas, platos y cubiertos, dejando un brillo impecable libre de aureolas.",
    usage: "Verter unas gotas directamente sobre la esponja previamente humedecida. Frotar y enjuagar con abundante agua.",
    safety: "En caso de ingestión accidental, beber abundante agua y consultar al médico."
  },
  {
    id: 5,
    name: "Shampoo Automotriz Siliconado con Cera",
    category: "automotriz",
    price: 3200,
    volume: "5 Litros",
    rating: 4.9,
    reviews: 142,
    badge: "Brillo Extremo",
    image: "/category_car.jpg",
    description: "Shampoo neutro diseñado especialmente para la limpieza de carrocerías. Contiene polímeros de silicona y ceras naturales que remueven la suciedad, hollín y grasitud del camino, dejando una capa protectora repelente al agua y al polvo con un acabado brillante de showroom.",
    usage: "Diluir 50ml en un balde con 5 litros de agua limpia. Generar espuma e ir lavando la carrocería de arriba hacia abajo con microfibra o guante de lavado. Luego enjuagar.",
    safety: "No lavar el auto bajo el sol directo o si la chapa está caliente. Evitar que se seque el producto en la superficie."
  },
  {
    id: 6,
    name: "Revividor de Plásticos y Gomas Premium",
    category: "automotriz",
    price: 2500,
    volume: "1 Litro",
    rating: 4.8,
    reviews: 110,
    badge: "Protección UV",
    image: "/category_car.jpg",
    description: "Restaura el color original y la elasticidad de los plásticos exteriores expuestos, gomas, burletes y neumáticos de tu vehículo. Su capa protectora con filtros UV previene el resecamiento, agrietamiento y decoloración causados por el sol.",
    usage: "Limpiar y secar la superficie a tratar. Aplicar una pequeña cantidad en un aplicador de espuma o microfibra y esparcir de forma uniforme. Retirar excesos con microfibra limpia.",
    safety: "No aplicar en pedales, volante, discos de freno o superficies donde el deslizamiento pueda ser peligroso."
  },
  {
    id: 7,
    name: "Silicona Líquida Perfumada Interiores",
    category: "automotriz",
    price: 2900,
    volume: "1 Litro",
    rating: 4.7,
    reviews: 89,
    badge: "Fragancia Premium",
    image: "/category_car.jpg",
    description: "Acondicionador de interiores para tableros, paneles de puerta y molduras plásticas. Otorga un brillo satinado elegante sin dejar sensación grasosa o pegajosa, repele el polvo y deja un perfume agradable de larga duración.",
    usage: "Rociar sobre una microfibra limpia y frotar suavemente sobre el tablero u otras zonas plásticas interiores.",
    safety: "Evitar rociar directamente sobre vidrios o pantallas multimedia."
  },
  {
    id: 8,
    name: "Cloro Líquido Concentrado Estabilizado",
    category: "piscinas",
    price: 3400,
    volume: "5 Litros",
    rating: 4.8,
    reviews: 115,
    badge: "Cloro Puro",
    image: "/category_pool.jpg",
    description: "Desinfectante bactericida y alguicida de disolución rápida para todo tipo de piscinas. Su alta pureza asegura la eliminación inmediata de bacterias, hongos y microorganismos suspendidos en el agua, manteniéndola saludable.",
    usage: "Agregar 1 litro de cloro líquido por cada 20.000 litros de agua diariamente al atardecer o cuando la piscina no esté en uso. Ajustar según el nivel de cloro libre residual (1-3 ppm).",
    safety: "Corrosivo. Utilizar protección ocular y guantes al manipular. No mezclar con ácidos u otros productos químicos. Tóxico para organismos acuáticos si se usa en exceso."
  },
  {
    id: 9,
    name: "Clarificador de Agua Rápida Acción",
    category: "piscinas",
    price: 2200,
    volume: "1 Litro",
    rating: 4.6,
    reviews: 67,
    badge: "Acción Rápida",
    image: "/category_pool.jpg",
    description: "Coagulante y floculante que agrupa las partículas microscópicas de suciedad en suspensión, haciéndolas decantar al fondo de la piscina para ser fácilmente removidas por el barrefondo. Logra un agua cristalina.",
    usage: "Verter 250ml por cada 50.000 litros de agua, diluido previamente en un balde. Encender el filtro en modo recirculación por 1-2 horas y luego dejar reposar toda la noche. Pasar el barrefondo por la mañana.",
    safety: "Evitar el contacto directo con el producto concentrado. No nadar durante el proceso de decantación."
  },
  {
    id: 10,
    name: "Alguicida Preventivo Concentrado",
    category: "piscinas",
    price: 2400,
    volume: "1 Litro",
    rating: 4.7,
    reviews: 80,
    badge: "Fórmula Concentrada",
    image: "/category_pool.jpg",
    description: "Fórmula eficaz contra todo tipo de algas, previniendo la formación de agua verde y superficies resbaladizas en las paredes de la piscina. No mancha revestimientos y es apto para piscinas de fibra y lona.",
    usage: "Dosis de mantenimiento: agregar 100ml por cada 10.000 litros de agua una vez a la semana. Dosis de shock (presencia de algas): agregar 200ml por cada 10.000 litros.",
    safety: "No ingerir. Mantener alejado de alimentos y bebidas."
  },
  {
    id: 11,
    name: "Kit Limpieza Hogar Completo",
    category: "combos",
    price: 6500,
    volume: "Pack Ahorro",
    rating: 4.9,
    reviews: 210,
    badge: "15% OFF",
    image: "/category_home.jpg",
    description: "El combo definitivo para mantener tu hogar impecable y aromatizado. Ahorrá comprando los productos esenciales juntos. Incluye: 1 Jabón Líquido Ropa 5L, 1 Suavizante Algodón 5L, 1 Desengrasante Concentrado 1L y 1 Detergente Limón 1L.",
    usage: "Ver especificaciones de cada producto incluido para su correcta aplicación.",
    safety: "Almacenar de forma segura en sus envases originales debidamente cerrados."
  },
  {
    id: 12,
    name: "Kit Brillo Automotriz Extremo",
    category: "combos",
    price: 7200,
    volume: "Pack Detailing",
    rating: 5.0,
    reviews: 185,
    badge: "20% OFF",
    image: "/category_combos.jpg",
    description: "Llevá el cuidado de tu vehículo al siguiente nivel con este kit de detailing. Lográ una limpieza profunda, un brillo deslumbrante y una protección duradera tanto para el interior como el exterior. Incluye: 1 Shampoo Siliconado 5L, 1 Revividor de Plásticos 1L, 1 Silicona Perfumada 1L y 1 Paño de microfibra premium de regalo.",
    usage: "Ver instrucciones en cada envase. Utilizar la microfibra limpia para retirar excedentes de brillo y abrillantar.",
    safety: "Manipular con cuidado. Lavarse las manos luego del uso."
  }
];

function App() {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    address: '',
    phone: '',
    delivery: 'retiro',
    payment: 'efectivo'
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  // Intersection Observer to track scroll position and update active section highlight
  useEffect(() => {
    const sections = ['home', 'productos', 'nosotros', 'contacto'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px', // Trigger when section occupies screen center
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

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('hf_quimica_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from storage", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('hf_quimica_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    // Open cart drawer on add
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
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
  const filteredProducts = PRODUCTS.filter((p) => {
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

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    
    // Format message for WhatsApp
    const orderItems = cart.map(
      (item) => `• *${item.product.name}* [${item.product.volume}] (Cant: ${item.quantity}) - $${(item.product.price * item.quantity).toLocaleString('es-AR')}`
    ).join('\n');
    
    const formattedTotal = cartTotal.toLocaleString('es-AR');
    
    const message = `*HF QUÍMICA - NUEVO PEDIDO*\n\n` +
      `👤 *Cliente:* ${checkoutForm.name}\n` +
      `📞 *Teléfono:* ${checkoutForm.phone}\n` +
      `📍 *Dirección de Entrega:* ${checkoutForm.address}\n` +
      `🚚 *Método:* ${checkoutForm.delivery === 'envio' ? 'Envío a Domicilio' : 'Retiro por local'}\n` +
      `💳 *Forma de Pago:* ${checkoutForm.payment === 'efectivo' ? 'Efectivo / Transferencia' : 'Tarjeta de Débito/Crédito'}\n\n` +
      `🛒 *Detalle del Pedido:*\n${orderItems}\n\n` +
      `💵 *TOTAL:* *$${formattedTotal}*\n\n` +
      `¡Muchas gracias! Aguardo la confirmación de la cotización.`;
      
    const encodedMessage = encodeURIComponent(message);
    // WhatsApp URL using the handle's phone number or template
    // Target country code 549 (Argentina)
    const phoneNumber = "5491123456789"; // Placeholder HF Química commercial whatsapp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and close modals
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    alert('¡Tu pedido ha sido preparado! Serás redirigido a WhatsApp para finalizar la coordinación con HF Química.');
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="app-container">
      {/* Decorative Bubbles for premium aesthetic */}
      <div className="bubbles-decorator">
        <div className="bubble" style={{ left: '5%', width: '30px', height: '30px', animationDelay: '0s', bottom: '10%' }}></div>
        <div className="bubble" style={{ left: '20%', width: '15px', height: '15px', animationDelay: '2s', bottom: '5%' }}></div>
        <div className="bubble" style={{ left: '85%', width: '40px', height: '40px', animationDelay: '4s', bottom: '15%' }}></div>
        <div className="bubble" style={{ left: '92%', width: '20px', height: '20px', animationDelay: '1s', bottom: '8%' }}></div>
      </div>

      {/* --- HEADER --- */}
      <header>
        <div className="container header-inner">
          <a href="#" className="logo-container" onClick={() => scrollToSection('home')}>
            <img src="/logo.jpeg" className="logo-img" alt="HF Química Logo" />
            <div className="logo-text">
              <span>HF Química</span>
              <span className="logo-slogan">Limpieza & Calidad</span>
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
              Descubrí nuestra amplia gama de productos químicos y de limpieza ultra concentrados. Desarrollados con fórmulas de alto rendimiento para el hogar, tu vehículo y piscinas.
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
              <img src="/hero_cleaner.jpg" alt="HF Química Lab Quality Products" />
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
            <h3 className="info-title">Envíos Rápidos</h3>
            <p className="info-desc">Coordinamos la entrega de tu pedido a domicilio directamente por WhatsApp.</p>
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
              🧴 Hogar
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'automotriz' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('automotriz')}
            >
              🚗 Automotriz
            </button>
            <button 
              className={`category-tab ${selectedCategory === 'piscinas' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('piscinas')}
            >
              🏊 Piscinas
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
              Mostrando <strong>{sortedProducts.length}</strong> de <strong>{PRODUCTS.length}</strong> productos
            </div>
            <div className="toolbar-controls">
              <label htmlFor="sort" className="form-label" style={{ marginBottom: 0 }}>Ordenar por:</label>
              <select 
                id="sort" 
                className="select-input" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Popularidad (Estrellas)</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="product-grid">
              {sortedProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <span className="product-volume-badge">{product.volume}</span>
                  
                  <div className="product-image-container">
                    <img src={product.image} className="product-image" alt={product.name} />
                  </div>
                  
                  <div className="product-content">
                    <span className="product-category-text">{product.category}</span>
                    <h3 className="product-title">{product.name}</h3>
                    
                    <div className="product-rating">
                      <Star size={14} fill="#f59e0b" stroke="none" />
                      <strong>{product.rating}</strong> 
                      <span className="product-rating-count">({product.reviews})</span>
                    </div>

                    <p className="product-desc-short">{product.description}</p>
                    
                    <button 
                      className="view-detail-link"
                      onClick={() => { setSelectedProduct(product); setActiveTab('description'); }}
                    >
                      Ver instrucciones y seguridad <ChevronRight size={14} />
                    </button>

                    <div className="product-footer">
                      <div className="product-price">
                        <span className="price-label">Precio Sugerido</span>
                        <span className="price-value">${product.price.toLocaleString('es-AR')}</span>
                      </div>
                      
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                        title="Agregar al carrito"
                        aria-label={`Agregar ${product.name} al carrito`}
                      >
                        <Plus size={20} />
                      </button>
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
              Nacimos con el objetivo de brindar soluciones efectivas y de calidad superior para la higiene del hogar, mantenimiento de vehículos y tratamiento de aguas. Diseñamos nuestras fórmulas bajo estrictas normas de control para garantizar el máximo rendimiento con la menor huella de residuo químico.
            </p>
            <p>
              A través de nuestro canal de distribución directo, logramos llegar a hogares, lavaderos de autos, administradores de consorcios y profesionales del mantenimiento de piscinas con precios altamente competitivos.
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
                  <h4>Asesoramiento Químico</h4>
                  <p>Guiamos tu compra para que uses la dosis exacta para cada necesidad.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-logo-wrapper">
            <img src="/logo.jpeg" className="about-logo-image" alt="HF Química Logo Circular" />
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
                <p>+54 9 11 2345-6789</p>
              </div>
            </div>

            <div className="contact-detail">
              <div className="contact-detail-icon">
                <MapPin size={20} />
              </div>
              <div className="contact-detail-text">
                <h4>Zona de Distribución</h4>
                <p>Buenos Aires, Argentina (Envíos a coordinar)</p>
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
                <img src="/logo.jpeg" className="footer-brand-logo-img" alt="HF Logo Small" />
                <span className="footer-brand-name">HF QUÍMICA</span>
              </div>
              <p className="footer-brand-desc">
                Soluciones químicas profesionales de alta concentración y rendimiento para la higiene hogareña, automotriz y cuidado del agua de piscinas.
              </p>
            </div>

            <div>
              <h3 className="footer-title">Navegación</h3>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Inicio</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('productos'); }}>Catálogo de Productos</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('nosotros'); }}>Sobre Nosotros</a></li>
                <li className="footer-link-item"><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('contacto'); }}>Contacto & Consultas</a></li>
              </ul>
            </div>

            <div>
              <h3 className="footer-title">Contacto</h3>
              <ul className="footer-links" style={{ fontSize: '14px' }}>
                <li>📍 Buenos Aires, Argentina</li>
                <li>📞 +54 9 11 2345-6789</li>
                <li>📧 info@hfquimica.com</li>
                <li>⏰ Lun a Vie 9:00 - 18:00hs</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} HF Química. Todos los derechos reservados. Desarrollado con tecnología React + Vite.</p>
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
                          <span className="qty-value">{item.quantity}</span>
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
                  <span>Subtotal sugerido</span>
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
                <span className="product-category-text" style={{ fontSize: '13px' }}> Límite {selectedProduct.category}</span>
                <h2 className="detail-title">{selectedProduct.name}</h2>
                
                <div className="detail-meta">
                  <div className="product-rating" style={{ fontSize: '15px' }}>
                    <Star size={16} fill="#f59e0b" stroke="none" />
                    <strong>{selectedProduct.rating}</strong> 
                    <span className="product-rating-count">({selectedProduct.reviews} opiniones)</span>
                  </div>
                  <span className="product-volume-badge" style={{ position: 'static' }}>Tamaño: {selectedProduct.volume}</span>
                </div>

                <div className="detail-price">
                  ${selectedProduct.price.toLocaleString('es-AR')}
                </div>

                {/* Tabs */}
                <div className="detail-tabs-header">
                  <button 
                    className={`detail-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Detalles
                  </button>
                  <button 
                    className={`detail-tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('usage')}
                  >
                    Instrucciones
                  </button>
                  <button 
                    className={`detail-tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
                    onClick={() => setActiveTab('safety')}
                  >
                    Seguridad ⚠️
                  </button>
                </div>

                <div className="detail-tab-content">
                  {activeTab === 'description' && (
                    <p>{selectedProduct.description}</p>
                  )}
                  {activeTab === 'usage' && (
                    <div>
                      <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Modo de empleo sugerido:</h4>
                      <p>{selectedProduct.usage}</p>
                    </div>
                  )}
                  {activeTab === 'safety' && (
                    <div className="safety-warning">
                      <AlertTriangle size={20} className="bullet-icon" style={{ marginTop: '2px' }} />
                      <div>
                        <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Advertencias y Precauciones:</h4>
                        <p>{selectedProduct.safety}</p>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                >
                  Agregar al Carrito <Plus size={16} />
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
                  <label className="form-label" htmlFor="checkout-phone">WhatsApp de contacto</label>
                  <input 
                    type="tel" 
                    id="checkout-phone" 
                    name="phone" 
                    className="form-input" 
                    placeholder="Ej: 11 5566-7788"
                    value={checkoutForm.phone}
                    onChange={handleCheckoutChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-address">Dirección de Entrega</label>
                  <input 
                    type="text" 
                    id="checkout-address" 
                    name="address" 
                    className="form-input" 
                    placeholder="Ej: Av. Santa Fe 1234, CABA"
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
                    <option value="retiro">Retiro en local / Punto de encuentro</option>
                    <option value="envio">Envío a Domicilio (coordinar costo)</option>
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
                    <option value="efectivo">Efectivo / Transferencia bancaria</option>
                    <option value="tarjeta">Tarjeta de Crédito / Débito / MercadoPago</option>
                  </select>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                  <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <div>
                    Al dar click, se generará el mensaje en tu WhatsApp. <strong>El pedido solo quedará confirmado una vez enviado el mensaje.</strong>
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
  );
}

export default App;
