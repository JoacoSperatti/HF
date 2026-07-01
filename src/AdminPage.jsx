import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';
import { db, storage, isFirebaseConfigured } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
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
  Users
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  category: 'hogar',
  price: '',
  volume: '',
  rating: '5.0',
  badge: '',
  image: '/category_home.jpg',
  description: ''
};

const CATEGORY_LABELS = {
  hogar: '🏠 Hogar',
  piletas: '🏊 Piletas',
  textil: '👕 Textil',
  higiene: '🧴 Higiene',
  combos: '🎁 Combos',
};

// Utility to create the cropped image blob
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = 600;
  canvas.height = 600;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    600,
    600
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};

export default function AdminPage() {
  const navigate = useNavigate();

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('hf_admin_logged') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Products & Stats
  const [products, setProducts] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Image Crop
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('todos');

  useEffect(() => {
    if (isLoggedIn && isFirebaseConfigured) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      // Fetch Products
      const snap = await getDocs(collection(db, 'productos'));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(loaded);

      // Fetch Visitors
      const visitorsRef = doc(db, 'analytics', 'visitors');
      const vSnap = await getDoc(visitorsRef);
      if (vSnap.exists()) {
        setTotalVisitors(vSnap.data().count || 0);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al cargar los datos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- AUTH ---
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
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Ingreso exitoso al panel',
          timer: 1500,
          showConfirmButton: false
        });
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
    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // --- FORM ---
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
      description: p.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageSrc(null);
    setImageFile(null);
  };

  // --- IMAGE UPLOAD & CROP ---
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadCroppedImage = async () => {
    if (!storage || !imageSrc || !croppedAreaPixels) return;
    setUploadingImage(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `products/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = await uploadBytesResumable(storageRef, croppedImageBlob);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      setForm(prev => ({ ...prev, image: downloadURL }));
      setShowCropModal(false);
      setImageSrc(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Imagen recortada y subida',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    } finally {
      setUploadingImage(false);
    }
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
        views: editingProduct?.views || 0 // preserve views
      };
      if (editingProduct) {
        await updateDoc(doc(db, 'productos', editingProduct.id), data);
        Swal.fire({ icon: 'success', title: 'Producto actualizado', timer: 1500, showConfirmButton: false });
      } else {
        await addDoc(collection(db, 'productos'), data);
        Swal.fire({ icon: 'success', title: 'Producto creado', timer: 1500, showConfirmButton: false });
      }
      cancelEdit();
      fetchData();
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
      text: "Esta acción no se puede deshacer.",
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

  const filteredProducts = filterCategory === 'todos'
    ? products
    : products.filter(p => p.category === filterCategory);
    
  // Most viewed products
  const mostViewedProducts = [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // ======================== RENDER: LOGIN ========================
  if (!isLoggedIn) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <img src="/logo.jpeg" alt="HF Química" />
          </div>
          <h1 className="admin-login-title">Gestión Interna</h1>
          <p className="admin-login-subtitle">HF Química — Acceso restringido</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="pw">
                <Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Contraseña de Administrador
              </label>
              <input
                type="password"
                id="pw"
                className="form-input"
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            style={{ marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', margin: '16px auto 0' }}
          >
            <Home size={13} /> Volver al sitio
          </button>
        </div>
      </div>
    );
  }

  // ======================== RENDER: DASHBOARD ========================
  return (
    <div className="admin-page">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <img src="/logo.jpeg" alt="HF Química" className="admin-topbar-logo" />
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

      <div className="admin-layout">

        {/* ===== LEFT PANEL: FORM ===== */}
        <aside className="admin-sidebar">
          
          {/* ANALYTICS SECTION */}
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
            {mostViewedProducts.length === 0 && <p style={{fontSize: '13px', color: 'var(--text-muted)'}}>No hay datos aún.</p>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mostViewedProducts.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{p.name}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.views || 0} 👀</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FORM SECTION */}
          <div className="admin-panel-card">
            <h2 className="admin-panel-title">
              {editingProduct ? <><Edit2 size={18} /> Editar Producto</> : <><Plus size={18} /> Agregar Producto</>}
            </h2>

            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Ej: Jabón Premium"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
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
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    placeholder="2500"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="form-group">
                  <label className="form-label">Tamaño / Volumen *</label>
                  <input
                    type="text"
                    name="volume"
                    className="form-input"
                    placeholder="Ej: 5 Litros"
                    value={form.volume}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Calificación <Star size={12} fill="#f59e0b" stroke="none" /></label>
                  <input
                    type="number"
                    name="rating"
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input"
                    placeholder="5.0"
                    value={form.rating}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Etiqueta (Badge)</label>
                <input
                  type="text"
                  name="badge"
                  className="form-input"
                  placeholder="Ej: Más Vendido (Opcional)"
                  value={form.badge}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Imagen</label>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="image"
                    className="form-input"
                    placeholder="/category_home.jpg"
                    value={form.image}
                    onChange={handleFormChange}
                    style={{ flex: 1 }}
                  />
                  
                  {/* File Upload Button */}
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0 12px' }}>
                    <Upload size={16} />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
                  </label>
                </div>

                <div className="admin-image-shortcuts">
                  <span>Accesos rápidos:</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '/category_home.jpg' }))}>Hogar / Textil / Higiene</button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '/category_pool.jpg' }))}>Piletas</button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '/category_combos.jpg' }))}>Combos</button>
                </div>
                {form.image && (
                  <img src={form.image} alt="preview" className="admin-image-preview" onError={e => e.target.style.display = 'none'} />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea
                  name="description"
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Describí el producto..."
                  value={form.description}
                  onChange={handleFormChange}
                  required
                />
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

        {/* ===== RIGHT PANEL: PRODUCTS LIST ===== */}
        <main className="admin-main">
          <div className="admin-panel-card" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div className="admin-list-toolbar">
              <h2 className="admin-panel-title" style={{ margin: 0 }}>
                <Package size={18} /> Productos
                <span className="admin-count-badge">{products.length}</span>
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="admin-filter-tabs">
                  {['todos', 'hogar', 'piletas', 'textil', 'higiene', 'combos'].map(cat => (
                    <button
                      key={cat}
                      className={`admin-filter-tab ${filterCategory === cat ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat)}
                    >
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
                <AlertTriangle size={16} />
                Firebase no está configurado. Completá las variables de entorno.
              </div>
            )}

            {isLoading ? (
              <div className="admin-loading">Cargando productos de Firestore...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="admin-empty">
                <Package size={40} style={{ opacity: 0.3 }} />
                <p>No hay productos{filterCategory !== 'todos' ? ` en la categoría "${filterCategory}"` : ''}</p>
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
                      <button
                        onClick={() => startEdit(p)}
                        className="admin-action-btn edit"
                      >
                        <Edit2 size={15} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="admin-action-btn delete"
                      >
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

      {/* CROP MODAL */}
      {showCropModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg-card)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Recortar Imagen (1:1 Recomendado)</h3>
            <button onClick={() => { setShowCropModal(false); setImageSrc(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ position: 'relative', flex: 1 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => { setShowCropModal(false); setImageSrc(null); }} className="btn btn-secondary" disabled={uploadingImage}>Cancelar</button>
            <button onClick={uploadCroppedImage} className="btn btn-primary" disabled={uploadingImage}>
              {uploadingImage ? 'Subiendo...' : 'Recortar y Subir'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
