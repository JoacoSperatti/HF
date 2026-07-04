import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { db, storage, isFirebaseConfigured } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { openApprovalEmail, openRejectionEmail } from './emailService';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import {
  Database,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Star,
  Package,
  Save,
  X,
  RefreshCw,
  Home,
  Lock,
  Upload,
  Eye,
  Users,
  ShoppingBag,
  Check,
  Clock,
  Truck,
  XCircle,
  DollarSign,
  Building2,
  CheckCircle,
  XOctagon,
  BarChart2,
  Tag,
  Filter
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  category: 'hogar',
  price: '',
  volume: '',
  rating: '5.0',
  badge: '',
  image: '/category_home.jpg',
  description: '',
  stock: '10',
  wholesalePrice: '',
  wholesaleMinQty: ''
};

const CATEGORY_LABELS = {
  hogar: '🏠 Hogar',
  piletas: '🏊 Piletas',
  textil: '👕 Textil',
  higiene: '🧴 Higiene',
  combos: '🎁 Combos',
};

const ORDER_STATUSES = ['pendiente', 'confirmado', 'pago', 'enviado', 'entregado', 'cancelado'];

const STATUS_LABELS = {
  pendiente: '⏳ Pendiente',
  confirmado: '✅ Confirmado',
  pago: '💳 Pago',
  enviado: '🚚 Enviado',
  entregado: '📦 Entregado',
  cancelado: '❌ Cancelado',
};

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('hf_admin_logged') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('productos');

  // Products & Stats
  const [products, setProducts] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState('todos');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Wholesale Accounts
  const [wholesaleAccounts, setWholesaleAccounts] = useState([]);
  const [isLoadingWholesale, setIsLoadingWholesale] = useState(false);
  const [wholesaleFilter, setWholesaleFilter] = useState('todos');

  // Form
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Image Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('todos');

  // Pricing edit
  const [pricingEdits, setPricingEdits] = useState({});

  // ─── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && isFirebaseConfigured) {
      fetchData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && isFirebaseConfigured) {
      if (activeTab === 'pedidos') fetchOrders();
      if (activeTab === 'mayoristas') fetchWholesaleAccounts();
    }
  }, [activeTab, isLoggedIn]);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'productos'));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(loaded);

      const visitorsRef = doc(db, 'analytics', 'visitors');
      const vSnap = await getDoc(visitorsRef);
      if (vSnap.exists()) setTotalVisitors(vSnap.data().count || 0);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes("Missing or insufficient permissions")) {
        Swal.fire('Permisos denegados', 'Firestore bloqueó el acceso. Revisá las Reglas de Firestore en la consola de Firebase.', 'error');
      } else {
        Swal.fire('Error de Base de Datos', err.message || 'Error al cargar los datos', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!db) return;
    setIsLoadingOrders(true);
    try {
      const snap = await getDocs(query(collection(db, 'pedidos'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchWholesaleAccounts = async () => {
    if (!db) return;
    setIsLoadingWholesale(true);
    try {
      // Try with ordering first; if the index is missing, fall back to unordered
      let snap;
      try {
        snap = await getDocs(query(collection(db, 'cuentas_mayoristas'), orderBy('createdAt', 'desc')));
      } catch (indexErr) {
        console.warn('fetchWholesaleAccounts: orderBy falló (índice faltante?), cargando sin orden:', indexErr);
        snap = await getDocs(collection(db, 'cuentas_mayoristas'));
      }
      const accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWholesaleAccounts(accounts);
      if (accounts.length === 0) {
        console.info('cuentas_mayoristas: colección vacía o sin documentos.');
      }
    } catch (err) {
      console.error('Error al cargar cuentas mayoristas:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar mayoristas',
        html: `<p style="font-size:13px;color:#64748b">${err.message}</p><p style="font-size:12px;margin-top:8px;color:#94a3b8">Revisá las reglas de seguridad de Firestore y que la colección <code>cuentas_mayoristas</code> exista.</p>`,
        confirmButtonColor: '#063e7d'
      });
    } finally {
      setIsLoadingWholesale(false);
    }
  };

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const hashPassword = async (str) => {
    const utf8 = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', utf8);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const hashed = await hashPassword(passwordInput);
      if (hashed === 'cd7c0317729ea0c619111b7688709c029a3b0cc9c86d3354edb90b1555e38460') {
        setIsLoggedIn(true);
        localStorage.setItem('hf_admin_logged', 'true');
        Swal.fire({ icon: 'success', title: '¡Bienvenido!', text: 'Ingreso exitoso al panel', timer: 1500, showConfirmButton: false });
        setPasswordInput('');
      } else {
        Swal.fire('Error', 'Contraseña incorrecta', 'error');
      }
    } catch {
      Swal.fire('Error', 'Error al verificar la contraseña', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('hf_admin_logged');
    Swal.fire({ icon: 'info', title: 'Sesión cerrada', timer: 1500, showConfirmButton: false });
  };

  // ─── Order Management ──────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'pedidos', orderId), { status: newStatus, updatedAt: serverTimestamp() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      Swal.fire({ icon: 'success', title: `Estado actualizado a "${STATUS_LABELS[newStatus]}"`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: '¿Eliminar pedido?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'pedidos', orderId));
        setOrders(prev => prev.filter(o => o.id !== orderId));
        Swal.fire({ icon: 'success', title: 'Pedido eliminado', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
      }
    }
  };

  // ─── Wholesale Account Management ──────────────────────────────────────────

  /** Genera una contraseña aleatoria segura de 12 caracteres */
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    const arr = new Uint8Array(12);
    crypto.getRandomValues(arr);
    arr.forEach(b => { pass += chars[b % chars.length]; });
    return pass;
  };

  /** Crea un usuario en Firebase Auth via REST API y devuelve el localId o lanza error */
  const createFirebaseAuthUser = async (email, password) => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: false })
    });
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.error?.message || 'Unknown error';
      throw new Error(errMsg);
    }
    return data.localId;
  };

  const updateWholesaleStatus = async (accountId, newStatus, account) => {
    if (!db) return;
    try {
      if (newStatus === 'aprobado') {
        // ── Crear cuenta de login para el mayorista ──────────────────────────
        const password = generatePassword();
        let authUid = null;
        let authError = null;

        try {
          authUid = await createFirebaseAuthUser(account.email, password);
        } catch (err) {
          // EMAIL_EXISTS → ya tiene cuenta, no es fatal
          if (err.message === 'EMAIL_EXISTS') {
            authError = 'Ya existía una cuenta con ese email en Firebase Auth.';
          } else {
            authError = err.message;
          }
        }

        // Guardar en Firestore
        const updateData = {
          status: 'aprobado',
          reviewedAt: serverTimestamp(),
          ...(authUid ? { authUid, generatedPassword: password, loginCreatedAt: serverTimestamp() } : {})
        };
        await updateDoc(doc(db, 'cuentas_mayoristas', accountId), updateData);
        setWholesaleAccounts(prev => prev.map(a =>
          a.id === accountId ? { ...a, status: 'aprobado', ...(authUid ? { authUid, generatedPassword: password } : {}) } : a
        ));

        // Abrir borrador de mail
        openApprovalEmail({ ...account, generatedPassword: authUid ? password : null });

        if (authUid) {
          Swal.fire({
            icon: 'success',
            title: '✅ Cuenta aprobada',
            html:
              `<strong>${account.businessName}</strong><br/>
               <small style="color:#64748b">Contacto: ${account.contactName} — ${account.email}</small>
               <hr style="margin:12px 0;border-color:#e2e8f0"/>
               <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:left">
                 <p style="font-weight:700;color:#166534;margin-bottom:6px">🔑 Credenciales de acceso generadas:</p>
                 <p style="font-size:13px;margin:4px 0"><b>Email:</b> <code style="background:#dcfce7;padding:2px 6px;border-radius:4px">${account.email}</code></p>
                 <p style="font-size:13px;margin:4px 0"><b>Contraseña:</b> <code style="background:#dcfce7;padding:2px 6px;border-radius:4px;font-size:15px;font-weight:700">${password}</code></p>
                 <p style="font-size:11px;color:#4ade80;margin-top:8px">✅ Guardada en Firestore. Enviá esta contraseña al mayorista.</p>
               </div>
               <p style="font-size:12px;color:#64748b;margin-top:10px">✉️ Se abrió un borrador de mail pre-armado para enviar al cliente.</p>`,
            confirmButtonColor: '#063e7d',
            confirmButtonText: 'Entendido'
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: '✅ Cuenta aprobada (sin login)',
            html:
              `<strong>${account.businessName}</strong><br/>
               <p style="font-size:13px;color:#64748b;margin-top:8px">${authError ? `⚠️ No se pudo crear login en Firebase Auth: <b>${authError}</b>` : ''}</p>
               <p style="font-size:12px;color:#64748b;margin-top:8px">✉️ Se abrió un borrador de mail.</p>`,
            confirmButtonColor: '#063e7d'
          });
        }
      } else {
        // rechazado
        await updateDoc(doc(db, 'cuentas_mayoristas', accountId), { status: newStatus, reviewedAt: serverTimestamp() });
        setWholesaleAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: newStatus } : a));
        openRejectionEmail(account);
        Swal.fire({
          icon: 'info',
          title: 'Cuenta rechazada ❌',
          html: `<strong>${account.businessName}</strong><br/><small style="color:#64748b">Contacto: ${account.contactName} — ${account.email}</small><br/><br/><p style="font-size:13px;color:#64748b">✉️ Se abrió un borrador de mail listo para enviar al cliente.</p>`,
          confirmButtonColor: '#063e7d'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo actualizar la cuenta', 'error');
    }
  };

  // ─── Pricing Management ───────────────────────────────────────────────────
  const saveWholesalePricing = async (productId, wholesalePrice, wholesaleMinQty) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'productos', productId), {
        wholesalePrice: Number(wholesalePrice) || null,
        wholesaleMinQty: Number(wholesaleMinQty) || null
      });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, wholesalePrice: Number(wholesalePrice), wholesaleMinQty: Number(wholesaleMinQty) } : p));
      Swal.fire({ icon: 'success', title: 'Precio mayorista actualizado', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', 'No se pudo actualizar el precio', 'error');
    }
  };

  // ─── Product Form ──────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      volume: p.volume,
      rating: p.rating?.toString() || '5.0',
      badge: p.badge || '',
      image: p.image || '/category_home.jpg',
      description: p.description || '',
      stock: p.stock?.toString() || '0',
      wholesalePrice: p.wholesalePrice?.toString() || '',
      wholesaleMinQty: p.wholesaleMinQty?.toString() || ''
    });
    setActiveTab('productos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  // ─── Image Upload (ImgBB) ───────────────────────────────────────────
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey || apiKey === 'pega_tu_api_key_aca') {
        Swal.fire('Error', 'Falta configurar VITE_IMGBB_API_KEY en el archivo .env', 'error');
        e.target.value = '';
        return;
      }
      
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success) {
          setForm(prev => ({ ...prev, image: data.data.url }));
          Swal.fire({ icon: 'success', title: 'Imagen subida correctamente', timer: 1500, showConfirmButton: false });
        } else {
          throw new Error(data.error?.message || 'Error en ImgBB');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo subir la imagen a ImgBB', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
    e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    try {
      const data = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        volume: form.volume,
        rating: Number(form.rating) || 5.0,
        badge: form.badge,
        image: form.image || '/category_home.jpg',
        description: form.description,
        views: editingProduct?.views || 0,
        stock: Number(form.stock) || 0,
        wholesalePrice: form.wholesalePrice ? Number(form.wholesalePrice) : null,
        wholesaleMinQty: form.wholesaleMinQty ? Number(form.wholesaleMinQty) : null
      };
      if (editingProduct) {
        await updateDoc(doc(db, 'productos', editingProduct.id), data);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { id: p.id, ...data } : p));
        Swal.fire({ icon: 'success', title: 'Producto actualizado', timer: 1500, showConfirmButton: false });
      } else {
        const docRef = await addDoc(collection(db, 'productos'), data);
        setProducts(prev => [{ id: docRef.id, ...data }, ...prev]);
        Swal.fire({ icon: 'success', title: 'Producto creado', timer: 1500, showConfirmButton: false });
      }
      cancelEdit();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al guardar el producto', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${name}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'productos', id));
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El producto fue eliminado', timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error al eliminar', 'error');
      }
    }
  };

  // ─── Computed ──────────────────────────────────────────────────────────────
  const filteredProducts = filterCategory === 'todos' ? products : products.filter(p => p.category === filterCategory);
  const mostViewedProducts = [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const filteredOrders = ordersFilter === 'todos' ? orders : orders.filter(o => o.status === ordersFilter);
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente').length;
  const pendingWholesaleCount = wholesaleAccounts.filter(a => a.status === 'pendiente').length;

  const filteredWholesale = wholesaleFilter === 'todos'
    ? wholesaleAccounts
    : wholesaleAccounts.filter(a => a.status === wholesaleFilter);

  // Stats for dashboard
  const orderStats = {
    total: orders.length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    entregado: orders.filter(o => o.status === 'entregado').length,
    totalRevenue: orders.filter(o => ['pago', 'enviado', 'entregado'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0)
  };

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <img src="/favicon.png" alt="HF Química" />
          </div>
          <h1 className="admin-login-title">Gestión Interna</h1>
          <p className="admin-login-subtitle">HF Química — Acceso restringido</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="pw">
                <Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Contraseña de Administrador
              </label>
              <input type="password" id="pw" className="form-input" placeholder="••••••••" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>
          <button onClick={() => navigate('/')} style={{ marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', margin: '16px auto 0' }}>
            <Home size={13} /> Volver al sitio
          </button>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <img src="/favicon.png" alt="HF Química" className="admin-topbar-logo" />
          <div>
            <span className="admin-topbar-title">Panel de Gestión</span>
            <span className="admin-topbar-subtitle">HF Química</span>
          </div>
        </div>
        <div className="admin-topbar-actions">
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ gap: '6px', fontSize: '13px' }}>
            <Home size={14} /> Ver sitio
          </button>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ gap: '6px', fontSize: '13px', color: '#ef4444' }}>
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ padding: '16px 24px 0' }}>
        <div className="admin-stat-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Visitantes</span>
            <span className="admin-stat-value">{totalVisitors}</span>
            <span className="admin-stat-sub">Sesiones únicas</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Productos</span>
            <span className="admin-stat-value">{products.length}</span>
            <span className="admin-stat-sub">En catálogo</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Pedidos</span>
            <span className="admin-stat-value">{orderStats.total}</span>
            <span className="admin-stat-sub">{orderStats.pendiente} pendientes</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Ingresos</span>
            <span className="admin-stat-value" style={{ fontSize: '20px' }}>${orderStats.totalRevenue.toLocaleString('es-AR')}</span>
            <span className="admin-stat-sub">Pedidos pagos/enviados</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Mayoristas</span>
            <span className="admin-stat-value">{wholesaleAccounts.filter(a => a.status === 'aprobado').length}</span>
            <span className="admin-stat-sub">{pendingWholesaleCount} pendientes</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ padding: '16px 24px 0' }}>
        <div className="admin-nav-tabs">
          <button className={`admin-nav-tab ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>
            <Package size={15} /> Productos
            <span className="admin-nav-tab-badge">{products.length}</span>
          </button>
          <button className={`admin-nav-tab ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
            <ShoppingBag size={15} /> Pedidos
            {pendingOrdersCount > 0 && <span className="admin-nav-tab-badge" style={{ background: '#ef4444', color: 'white' }}>{pendingOrdersCount}</span>}
          </button>
          <button className={`admin-nav-tab ${activeTab === 'mayoristas' ? 'active' : ''}`} onClick={() => setActiveTab('mayoristas')}>
            <Building2 size={15} /> Mayoristas
            {pendingWholesaleCount > 0 && <span className="admin-nav-tab-badge" style={{ background: '#f59e0b', color: 'white' }}>{pendingWholesaleCount}</span>}
          </button>
          <button className={`admin-nav-tab ${activeTab === 'precios' ? 'active' : ''}`} onClick={() => setActiveTab('precios')}>
            <Tag size={15} /> Precios Mayoristas
          </button>
          <button className={`admin-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={15} /> Analytics
          </button>
        </div>
      </div>

      {/* ─── TAB: PRODUCTOS ──────────────────────────────────────────────── */}
      {activeTab === 'productos' && (
        <div className="admin-layout">
          {/* LEFT: Form */}
          <aside className="admin-sidebar">
            <div className="admin-panel-card" style={{ background: 'var(--primary-dark)', color: 'white', borderColor: 'var(--primary-dark)' }}>
              <h2 className="admin-panel-title" style={{ color: 'white', marginBottom: '12px' }}>
                <Users size={18} /> Visitantes Totales
              </h2>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalVisitors}</div>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Personas han entrado a la web</p>
            </div>

            <div className="admin-panel-card">
              <h2 className="admin-panel-title">
                <Eye size={18} /> Más Vistos
              </h2>
              {mostViewedProducts.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay datos aún.</p>}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mostViewedProducts.map(p => (
                  <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{p.name}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.views || 0} 👀</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Form */}
            <div className="admin-panel-card">
              <h2 className="admin-panel-title">
                {editingProduct ? <><Edit2 size={18} /> Editar Producto</> : <><Plus size={18} /> Agregar Producto</>}
              </h2>
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-group">
                  <label className="form-label">Nombre del Producto *</label>
                  <input type="text" name="name" className="form-input" placeholder="Ej: Jabón Premium" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select name="category" className="select-input admin-select" value={form.category} onChange={handleFormChange}>
                      <option value="hogar">🏠 Hogar</option>
                      <option value="piletas">🏊 Piletas</option>
                      <option value="textil">👕 Textil</option>
                      <option value="higiene">🧴 Higiene</option>
                      <option value="combos">🎁 Combos</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio ($) *</label>
                    <input type="number" name="price" className="form-input" placeholder="2500" value={form.price} onChange={handleFormChange} required />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Tamaño / Volumen *</label>
                    <input type="text" name="volume" className="form-input" placeholder="Ej: 5 Litros" value={form.volume} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Calificación <Star size={12} fill="#f59e0b" stroke="none" /></label>
                    <input type="number" name="rating" step="0.1" min="1" max="5" className="form-input" placeholder="5.0" value={form.rating} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Cartel Sup. Izquierdo</label>
                    <input type="text" name="badge" className="form-input" placeholder="Ej: 15% OFF" value={form.badge} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Actual *</label>
                    <input type="number" name="stock" className="form-input" placeholder="50" value={form.stock} onChange={handleFormChange} required />
                  </div>
                </div>

                {/* Wholesale Pricing in Form */}
                <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Tag size={12} /> Precio Mayorista (opcional)
                  </p>
                  <div className="admin-form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Precio Mayorista ($)</label>
                      <input type="number" name="wholesalePrice" className="form-input" placeholder="1800" value={form.wholesalePrice} onChange={handleFormChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Cantidad Mínima</label>
                      <input type="number" name="wholesaleMinQty" className="form-input" placeholder="10" value={form.wholesaleMinQty} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" name="image" className="form-input" placeholder="URL de la imagen" value={form.image} onChange={handleFormChange} style={{ flex: 1 }} disabled={uploadingImage} />
                    <label className="btn btn-secondary" style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer', padding: '0 12px', opacity: uploadingImage ? 0.7 : 1 }}>
                      {uploadingImage ? 'Subiendo...' : <><Upload size={16} /> Subir Foto</>}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} disabled={uploadingImage} />
                    </label>
                  </div>
                  {form.image && <img src={form.image} alt="preview" className="admin-image-preview" onError={e => e.target.style.display = 'none'} />}
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción *</label>
                  <textarea name="description" className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Describí el producto..." value={form.description} onChange={handleFormChange} required />
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '6px' }} disabled={isSaving}>
                    <Save size={16} />
                    {isSaving ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={cancelEdit} className="btn btn-secondary" style={{ gap: '6px' }}>
                      <X size={16} /> Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>

          {/* RIGHT: Products List */}
          <main className="admin-main">
            <div className="admin-panel-card" style={{ marginBottom: 0, flex: 1 }}>
              <div className="admin-list-toolbar">
                <h2 className="admin-panel-title" style={{ margin: 0 }}>
                  <Package size={18} /> Productos
                  <span className="admin-count-badge">{products.length}</span>
                </h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="admin-filter-tabs">
                    {['todos', 'hogar', 'piletas', 'textil', 'higiene', 'combos'].map(cat => (
                      <button key={cat} className={`admin-filter-tab ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
                        {cat === 'todos' ? 'Todos' : CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                  <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '6px 10px', gap: '4px', fontSize: '13px' }} title="Recargar">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {!isFirebaseConfigured && (
                <div className="admin-warning-banner">
                  <AlertTriangle size={16} /> Firebase no está configurado.
                </div>
              )}

              {isLoading ? (
                <div className="admin-loading">Cargando productos de Firestore...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="admin-empty">
                  <Package size={40} style={{ opacity: 0.3 }} />
                  <p>No hay productos{filterCategory !== 'todos' ? ` en "${filterCategory}"` : ''}</p>
                </div>
              ) : (
                <div className="admin-product-list">
                  {filteredProducts.map(p => (
                    <div className={`admin-product-row ${editingProduct?.id === p.id ? 'editing' : ''}`} key={p.id}>
                      <img src={p.image} alt={p.name} className="admin-product-thumb" onError={e => e.target.style.opacity = '0.3'} />
                      <div className="admin-product-info">
                        <div className="admin-product-name">{p.name}</div>
                        <div className="admin-product-meta">
                          <span className="admin-cat-pill">{CATEGORY_LABELS[p.category] || p.category}</span>
                          <span>{p.volume}</span>
                          <span className="admin-price">${Number(p.price).toLocaleString('es-AR')}</span>
                          {p.wholesalePrice && <span style={{ color: '#15803d', fontWeight: 600, fontSize: '11px' }}>Mayo: ${Number(p.wholesalePrice).toLocaleString('es-AR')} (×{p.wholesaleMinQty})</span>}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: (p.stock || 0) <= 0 ? '#ef4444' : (p.stock || 0) <= 5 ? '#f59e0b' : 'inherit' }}>
                            <Package size={11} /> Stock: {p.stock || 0}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Star size={11} fill="#f59e0b" stroke="none" />{p.rating}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={11} /> {p.views || 0}
                          </span>
                          {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                        </div>
                        <div className="admin-product-desc">{p.description}</div>
                      </div>
                      <div className="admin-product-actions">
                        <button onClick={() => startEdit(p)} className="admin-action-btn edit">
                          <Edit2 size={15} /> Editar
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="admin-action-btn delete">
                          <Trash2 size={15} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ─── TAB: PEDIDOS ─────────────────────────────────────────────────── */}
      {activeTab === 'pedidos' && (
        <div style={{ padding: '0 24px 24px' }}>
          <div className="admin-panel-card">
            <div className="admin-list-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="admin-panel-title" style={{ margin: 0 }}>
                <ShoppingBag size={18} /> Gestión de Pedidos
                <span className="admin-count-badge">{orders.length}</span>
              </h2>
              <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: '6px 10px', gap: '4px', fontSize: '13px' }}>
                <RefreshCw size={14} /> Recargar
              </button>
            </div>

            {/* Status Filter */}
            <div className="orders-filter-bar">
              {['todos', ...ORDER_STATUSES].map(s => (
                <button
                  key={s}
                  className={`admin-filter-tab ${ordersFilter === s ? 'active' : ''}`}
                  onClick={() => setOrdersFilter(s)}
                >
                  {s === 'todos' ? 'Todos' : STATUS_LABELS[s]}
                  {s !== 'todos' && <span style={{ marginLeft: '4px', fontWeight: 700, opacity: 0.7 }}>({orders.filter(o => o.status === s).length})</span>}
                </button>
              ))}
            </div>

            {isLoadingOrders ? (
              <div className="admin-loading">Cargando pedidos...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-empty">
                <ShoppingBag size={48} style={{ opacity: 0.2 }} />
                <p>No hay pedidos{ordersFilter !== 'todos' ? ` con estado "${STATUS_LABELS[ordersFilter]}"` : ' aún'}.</p>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map(order => (
                  <div className="order-card" key={order.id}>
                    <div className="order-card-header">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="order-card-id">Pedido #{order.orderNumber || order.id.slice(0, 6)}</span>
                        <span className="order-card-date">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('es-AR') : 'Fecha no disponible'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {order.isWholesale && <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.1)', color: '#15803d', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '50px', padding: '2px 8px', fontWeight: 700 }}>MAYORISTA</span>}
                        <span className={`order-status-badge ${order.status || 'pendiente'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                    </div>

                    <div className="order-card-client">
                      <span><Users size={13} /> {order.client}</span>
                      {order.wholesaleCompany && <span><Building2 size={13} /> {order.wholesaleCompany}</span>}
                      <span>{order.delivery === 'envio' ? '🚚 Envío' : '📍 Retiro'}</span>
                      <span>{order.payment === 'transferencia' ? '💳 Transferencia' : '💵 Efectivo'}</span>
                      <span>📍 {order.address}</span>
                    </div>

                    <div className="order-card-items">
                      <ul>
                        {(order.items || []).map((item, i) => (
                          <li key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.quantity}x {item.name} [{item.volume}]{item.isWholesale ? ' ✅' : ''}</span>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>${(item.subtotal || 0).toLocaleString('es-AR')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div className="order-card-actions">
                        {order.status !== 'confirmado' && order.status !== 'pago' && order.status !== 'enviado' && order.status !== 'entregado' && (
                          <button className="order-action-btn confirm" onClick={() => updateOrderStatus(order.id, 'confirmado')}>
                            <Check size={13} /> Confirmar
                          </button>
                        )}
                        {order.status === 'confirmado' && (
                          <button className="order-action-btn pay" onClick={() => updateOrderStatus(order.id, 'pago')}>
                            <DollarSign size={13} /> Marcar Pago
                          </button>
                        )}
                        {order.status === 'pago' && (
                          <button className="order-action-btn ship" onClick={() => updateOrderStatus(order.id, 'enviado')}>
                            <Truck size={13} /> Marcar Enviado
                          </button>
                        )}
                        {order.status === 'enviado' && (
                          <button className="order-action-btn deliver" onClick={() => updateOrderStatus(order.id, 'entregado')}>
                            <Package size={13} /> Marcar Entregado
                          </button>
                        )}
                        {order.status !== 'cancelado' && order.status !== 'entregado' && (
                          <button className="order-action-btn cancel" onClick={() => updateOrderStatus(order.id, 'cancelado')}>
                            <XCircle size={13} /> Cancelar
                          </button>
                        )}
                        <button className="order-action-btn" onClick={() => deleteOrder(order.id)} style={{ color: '#ef4444' }}>
                          <Trash2 size={13} /> Borrar
                        </button>
                      </div>
                      <div className="order-card-total">${(order.total || 0).toLocaleString('es-AR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: MAYORISTAS ──────────────────────────────────────────────── */}
      {activeTab === 'mayoristas' && (
        <div style={{ padding: '0 24px 24px' }}>
          <div className="admin-panel-card">
            <div className="admin-list-toolbar">
              <h2 className="admin-panel-title" style={{ margin: 0 }}>
                <Building2 size={18} /> Cuentas Mayoristas
                <span className="admin-count-badge">{wholesaleAccounts.length}</span>
              </h2>
              <button onClick={fetchWholesaleAccounts} className="btn btn-secondary" style={{ padding: '6px 10px', gap: '4px', fontSize: '13px' }}>
                <RefreshCw size={14} /> Recargar
              </button>
            </div>

            <div className="orders-filter-bar">
              {['todos', 'pendiente', 'aprobado', 'rechazado'].map(s => (
                <button key={s} className={`admin-filter-tab ${wholesaleFilter === s ? 'active' : ''}`} onClick={() => setWholesaleFilter(s)}>
                  {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
                  <span style={{ marginLeft: '4px', fontWeight: 700, opacity: 0.7 }}>
                    ({s === 'todos' ? wholesaleAccounts.length : wholesaleAccounts.filter(a => a.status === s).length})
                  </span>
                </button>
              ))}
            </div>

            {isLoadingWholesale ? (
              <div className="admin-loading">Cargando cuentas mayoristas...</div>
            ) : filteredWholesale.length === 0 ? (
              <div className="orders-empty">
                <Building2 size={48} style={{ opacity: 0.2 }} />
                <p>No hay solicitudes de cuentas mayoristas aún.</p>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredWholesale.map(account => (
                  <div className="wholesale-card" key={account.id}>
                    <div className="wholesale-card-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>
                          {account.businessName?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <div className="wholesale-card-name">{account.businessName}</div>
                          <span className={`wholesale-status-badge ${account.status || 'pendiente'}`}>
                            {account.status === 'aprobado' ? '✅ Aprobado' : account.status === 'rechazado' ? '❌ Rechazado' : '⏳ Pendiente'}
                          </span>
                        </div>
                      </div>
                      <div className="wholesale-card-meta" style={{ marginTop: '8px' }}>
                        <span>👤 {account.contactName}</span>
                        <span>📧 {account.email}</span>
                        <span>📞 {account.phone}</span>
                        {account.cuit && <span>🪪 CUIT: {account.cuit}</span>}
                        <span>📍 {account.province}</span>
                        {account.createdAt?.toDate && <span>🗓 {account.createdAt.toDate().toLocaleDateString('es-AR')}</span>}
                      </div>
                      {account.message && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontStyle: 'italic' }}>
                          "{account.message}"
                        </div>
                      )}
                      {account.status === 'aprobado' && account.generatedPassword && (
                        <div style={{ marginTop: '10px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '10px 12px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🔑 Credenciales de acceso
                          </p>
                          <div style={{ fontSize: '12px', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span><b>Email:</b> <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>{account.email}</code></span>
                            <span><b>Contraseña:</b> <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>{account.generatedPassword}</code></span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="wholesale-card-actions" style={{ flexDirection: 'column', alignSelf: 'flex-start' }}>
                      {account.status !== 'aprobado' && (
                        <button
                          className="admin-action-btn edit"
                          style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d', borderColor: 'rgba(34,197,94,0.3)' }}
                          onClick={() => updateWholesaleStatus(account.id, 'aprobado', account)}
                        >
                          <CheckCircle size={14} /> Aprobar
                        </button>
                      )}
                      {account.status !== 'rechazado' && (
                        <button
                          className="admin-action-btn delete"
                          style={{ background: 'rgba(239,68,68,0.08)' }}
                          onClick={() => updateWholesaleStatus(account.id, 'rechazado', account)}
                        >
                          <XOctagon size={14} /> Rechazar
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${account.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${account.contactName}, te contactamos desde HF Química respecto a tu solicitud de cuenta mayorista para ${account.businessName}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-action-btn"
                        style={{ color: '#25d366', textDecoration: 'none', borderColor: 'rgba(37,211,102,0.3)' }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: PRECIOS MAYORISTAS ──────────────────────────────────────── */}
      {activeTab === 'precios' && (
        <div style={{ padding: '0 24px 24px' }}>
          <div className="admin-panel-card">
            <h2 className="admin-panel-title">
              <Tag size={18} /> Gestión de Precios Mayoristas
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configurá el precio especial que verán los clientes con cuenta mayorista aprobada, y la cantidad mínima de unidades para acceder a ese precio.
            </p>

            {isLoading ? (
              <div className="admin-loading">Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className="admin-empty"><Package size={40} style={{ opacity: 0.3 }} /><p>No hay productos.</p></div>
            ) : (
              <div>
                {['hogar', 'piletas', 'textil', 'higiene', 'combos'].map(cat => {
                  const catProducts = products.filter(p => p.category === cat);
                  if (catProducts.length === 0) return null;
                  return (
                    <div key={cat} className="pricing-section-card">
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {CATEGORY_LABELS[cat]}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {catProducts.length} producto{catProducts.length !== 1 ? 's' : ''}
                      </p>
                      {catProducts.map(p => {
                        const edit = pricingEdits[p.id] || {};
                        const wsPrice = edit.wholesalePrice !== undefined ? edit.wholesalePrice : (p.wholesalePrice || '');
                        const wsMinQty = edit.wholesaleMinQty !== undefined ? edit.wholesaleMinQty : (p.wholesaleMinQty || '');
                        return (
                          <div className="pricing-product-row" key={p.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }} onError={e => e.target.style.opacity = '0.3'} />
                              <div>
                                <div className="pricing-product-name">{p.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.volume} — Precio regular: <strong>${p.price.toLocaleString('es-AR')}</strong></div>
                              </div>
                            </div>
                            <div className="pricing-input-group">
                              <span className="pricing-input-label">Precio Mayo.</span>
                              <input
                                className="pricing-input"
                                type="number"
                                placeholder={`Ej: ${Math.round(p.price * 0.75)}`}
                                value={wsPrice}
                                onChange={e => setPricingEdits(prev => ({ ...prev, [p.id]: { ...prev[p.id], wholesalePrice: e.target.value } }))}
                              />
                            </div>
                            <div className="pricing-input-group">
                              <span className="pricing-input-label">Cant. mínima</span>
                              <input
                                className="pricing-input"
                                type="number"
                                placeholder="Ej: 10"
                                value={wsMinQty}
                                onChange={e => setPricingEdits(prev => ({ ...prev, [p.id]: { ...prev[p.id], wholesaleMinQty: e.target.value } }))}
                              />
                            </div>
                            <button
                              className="pricing-save-btn"
                              onClick={() => saveWholesalePricing(p.id, wsPrice, wsMinQty)}
                              title="Guardar precio mayorista"
                            >
                              <Save size={13} /> Guardar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: ANALYTICS ───────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-panel-card">
              <h2 className="admin-panel-title"><Eye size={18} /> Más Vistos</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...products].sort((a, b) => (b.views || 0) - (a.views || 0)).map((p, i) => (
                  <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', width: '20px', flexShrink: 0 }}>#{i + 1}</span>
                    <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} onError={e => e.target.style.opacity = '0.3'} />
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>{p.name}</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>{p.views || 0} 👀</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-panel-card">
              <h2 className="admin-panel-title"><BarChart2 size={18} /> Resumen General</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Visitantes totales</span>
                  <strong style={{ fontSize: '22px', color: 'var(--primary)' }}>{totalVisitors}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Productos en catálogo</span>
                  <strong style={{ fontSize: '22px' }}>{products.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(245,158,11,0.07)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sin stock</span>
                  <strong style={{ fontSize: '22px', color: '#d97706' }}>{products.filter(p => (p.stock || 0) <= 0).length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(34,197,94,0.07)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Mayoristas aprobados</span>
                  <strong style={{ fontSize: '22px', color: '#15803d' }}>{wholesaleAccounts.filter(a => a.status === 'aprobado').length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(6,62,125,0.06)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pedidos entregados</span>
                  <strong style={{ fontSize: '22px', color: 'var(--primary)' }}>{orderStats.entregado}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CROP MODAL (REMOVED) ─────────────────────────────────────────── */}
    </div>
  );
}
