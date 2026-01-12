const API_URL = 'http://localhost:3000';

// Carrito en LocalStorage
const CART_KEY = 'shopping_cart';

// Obtener carrito del LocalStorage
function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// Guardar carrito en LocalStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Añadir producto al carrito
function addToCart(product) {
  const cart = getCart();
  
  // Verificar si el producto ya existe en el carrito
  const existingItem = cart.find(item => item.product === product._id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      product: product._id,
      name: product.nombre,
      price: product.precio,
      quantity: 1
    });
  }
  
  saveCart(cart);
  showNotification(`${product.nombre} añadido al carrito`);
}

// Eliminar producto del carrito
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.product !== productId);
  saveCart(cart);
}

// Actualizar cantidad de producto en el carrito
function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.product === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

// Calcular total del carrito
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Obtener cantidad total de items en el carrito
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Vaciar carrito
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

// Actualizar badge del carrito
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const count = getCartItemCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

// Renderizar items del carrito
function renderCartItems() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartSummary = document.getElementById('cart-summary');
  
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    if (emptyCartMessage) emptyCartMessage.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'none';
    return;
  }
  
  if (emptyCartMessage) emptyCartMessage.style.display = 'none';
  if (cartSummary) cartSummary.style.display = 'block';
  
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-product-id="${item.product}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="btn-quantity" onclick="updateQuantity('${item.product}', ${item.quantity - 1})">-</button>
        <input 
          type="number" 
          class="quantity-input" 
          value="${item.quantity}" 
          min="1"
          onchange="updateQuantity('${item.product}', parseInt(this.value))"
        >
        <button class="btn-quantity" onclick="updateQuantity('${item.product}', ${item.quantity + 1})">+</button>
        <button class="btn-remove" onclick="removeFromCart('${item.product}')">
          🗑️ Eliminar
        </button>
      </div>
      <div class="cart-item-total">
        <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
      </div>
    </div>
  `).join('');
  
  // Actualizar resumen
  updateCartSummary();
}

// Actualizar resumen del carrito
function updateCartSummary() {
  const totalElement = document.getElementById('cart-total');
  if (totalElement) {
    const total = getCartTotal();
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
}

// Procesar compra
async function checkout() {
  const cart = getCart();
  
  if (cart.length === 0) {
    showNotification('El carrito está vacío', 'error');
    return;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Debes iniciar sesión para realizar la compra', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 2000);
    return;
  }
  
  const total = getCartTotal();
  
  try {
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
      btnCheckout.disabled = true;
      btnCheckout.textContent = 'Procesando...';
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        total: total
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al procesar la compra');
    }
    
    const order = await response.json();
    
    // Vaciar carrito
    clearCart();
    
    // Mostrar confirmación
    showNotification('¡Compra realizada con éxito!', 'success');
    
    // Redirigir a página de confirmación o perfil
    setTimeout(() => {
      window.location.href = 'user-profile.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error al procesar compra:', error);
    showNotification(error.message, 'error');
    
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
      btnCheckout.disabled = false;
      btnCheckout.textContent = 'Finalizar Compra';
    }
  }
}

// Mostrar notificación
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Inicializar en la carga de la página
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  
  // Si estamos en la página del carrito, renderizar items
  if (document.getElementById('cart-items')) {
    renderCartItems();
  }
});
