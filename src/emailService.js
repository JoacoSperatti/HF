/**
 * HF Química — Sistema de notificaciones sin servicios externos
 *
 * Estrategia:
 *  • Admin recibe notificaciones → WhatsApp (mismo número ya usado en el sitio)
 *  • Admin le escribe al cliente → mailto: abre Gmail del admin pre-armado
 *  • Formulario de contacto → mailto: abre el cliente de mail del visitante
 *
 * Sin backend · Sin API keys · Sin suscripciones · Funciona siempre
 */

const ADMIN_PHONE   = '5491144006282'; // sin + ni espacios
export const ADMIN_EMAIL = 'HF.quimicos.arg@gmail.com';
export const ADMIN_NAME  = 'HF Química';

// ─── Helper: abrir WhatsApp con mensaje pre-armado ─────────────────────────────
function openWhatsApp(message) {
  const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ─── Helper: generar link mailto ───────────────────────────────────────────────
function buildMailto({ to, subject, body }) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SOLICITUD MAYORISTA NUEVA → notifica al admin por WhatsApp
//    (se llama al enviar el formulario de solicitud mayorista)
// ─────────────────────────────────────────────────────────────────────────────
export function notifyAdminWholesaleRequest(formData) {
  const msg =
    `🏢 *NUEVA SOLICITUD MAYORISTA — HF Química*\n\n` +
    `📌 *Empresa:* ${formData.businessName}\n` +
    `👤 *Contacto:* ${formData.contactName}\n` +
    `📧 *Email:* ${formData.email}\n` +
    `📞 *Teléfono:* ${formData.phone}\n` +
    `🪪 *CUIT:* ${formData.cuit || 'No informado'}\n` +
    `📍 *Provincia:* ${formData.province}\n` +
    `💬 *Mensaje:* ${formData.message || 'Sin mensaje adicional'}\n\n` +
    `📋 Revisá y gestioná en el panel:\n${window.location.origin}/gestion-interna`;
  openWhatsApp(msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CUENTA APROBADA → abre Gmail del admin con mail pre-armado para el cliente
//    (se llama cuando el admin hace clic en "Aprobar" en el panel)
// ─────────────────────────────────────────────────────────────────────────────
export function openApprovalEmail(account) {
  const subject = `✅ Tu cuenta mayorista fue aprobada — HF Química`;
  const body =
    `Hola ${account.contactName},\n\n` +
    `¡Excelentes noticias! 🎉\n\n` +
    `Tu solicitud de cuenta mayorista para ${account.businessName} fue APROBADA por nuestro equipo.\n\n` +
    `A partir de ahora podés ingresar al sitio y ver los precios especiales mayoristas en cada producto, según la cantidad mínima requerida.\n\n` +
    `🌐 Sitio: ${window.location.origin}\n\n` +
    `Si tenés alguna consulta:\n` +
    `📧 ${ADMIN_EMAIL}\n` +
    `📞 +54 9 11 4400-6282 (WhatsApp)\n\n` +
    `¡Gracias por elegir HF Química!\n\n` +
    `──────────────────────────────\n` +
    `HF Química — Limpieza que se ve, Calidad que se siente`;

  const mailto = buildMailto({ to: account.email, subject, body });
  window.open(mailto, '_blank');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CUENTA RECHAZADA → abre Gmail del admin con mail pre-armado para el cliente
// ─────────────────────────────────────────────────────────────────────────────
export function openRejectionEmail(account) {
  const subject = `Actualización sobre tu solicitud — HF Química`;
  const body =
    `Hola ${account.contactName},\n\n` +
    `Gracias por tu interés en nuestra cuenta mayorista.\n\n` +
    `Lamentablemente, por el momento no podemos procesar la solicitud de ${account.businessName}.\n\n` +
    `Si querés consultar los requisitos o re-aplicar en el futuro, contactanos:\n` +
    `📧 ${ADMIN_EMAIL}\n` +
    `📞 +54 9 11 4400-6282 (WhatsApp)\n\n` +
    `¡Quedamos a tu disposición!\n\n` +
    `──────────────────────────────\n` +
    `HF Química — Limpieza que se ve, Calidad que se siente`;

  const mailto = buildMailto({ to: account.email, subject, body });
  window.open(mailto, '_blank');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PEDIDO NUEVO → notifica al admin por WhatsApp
//    (complementa el mensaje de checkout que ya abre WhatsApp)
// ─────────────────────────────────────────────────────────────────────────────
export function notifyAdminNewOrder({ orderNumber, checkoutForm, cart, cartTotal, wholesaleUser }) {
  const itemsSummary = cart.map(
    item =>
      `• ${item.quantity}x ${item.product.name} [${item.product.volume}] = ` +
      `$${((item.product.effectivePrice || item.product.price) * item.quantity).toLocaleString('es-AR')}` +
      (item.product.isWholesale ? ' ✅ mayo.' : '')
  ).join('\n');

  const msg =
    `🛒 *PEDIDO #${orderNumber} — HF Química*\n\n` +
    `👤 *Cliente:* ${checkoutForm.name}${wholesaleUser ? ` (Mayorista: ${wholesaleUser.businessName})` : ''}\n` +
    `📍 *Dirección:* ${checkoutForm.address || 'No especificada'}\n` +
    `🚚 *Entrega:* ${checkoutForm.delivery === 'envio' ? 'Envío a domicilio' : 'Retiro / Punto de encuentro'}\n` +
    `💳 *Pago:* ${checkoutForm.payment === 'transferencia' ? 'Transferencia' : 'Efectivo'}\n\n` +
    `🛍 *Items:*\n${itemsSummary}\n\n` +
    `💵 *TOTAL: $${cartTotal.toLocaleString('es-AR')}*\n\n` +
    `📋 Ver en el panel: ${window.location.origin}/gestion-interna`;

  openWhatsApp(msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FORMULARIO DE CONTACTO → abre el cliente de mail del visitante (mailto:)
//    El visitante envía desde su propio correo, reply-to queda en el hilo
// ─────────────────────────────────────────────────────────────────────────────
export function openContactMailto({ name, email, message }) {
  const subject = `Consulta desde el sitio — ${name}`;
  const body =
    `Nombre: ${name}\n` +
    `Email de respuesta: ${email}\n\n` +
    `Mensaje:\n${message}\n\n` +
    `──────────────────────────────\n` +
    `Enviado desde hfquimica.com.ar`;

  const mailto = buildMailto({ to: ADMIN_EMAIL, subject, body });
  window.location.href = mailto;
}
