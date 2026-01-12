const API_URL = 'http://localhost:3000';
let currentUser = null;
let token = null;
let orders = [];

document.addEventListener('DOMContentLoaded', () => {
  token = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!token || !usuarioGuardado) {
    window.location.href = 'auth.html';
    return;
  }

  currentUser = JSON.parse(usuarioGuardado);

  // Crear barra de usuario
  createUserBar();

  // Cargar datos del perfil
  loadProfile();
  loadOrders();
});

function createUserBar() {
  const container = document.querySelector('.container');
  const userBar = document.createElement('div');
  userBar.className = 'user-bar';
  userBar.innerHTML = `
    <div>
      <strong>Bienvenido:</strong> ${currentUser.username}
    </div>
    <div class="nav-links">
      <a href="Productos.html">Productos</a>
      <a href="cart.html">🛒 Carrito</a>
      ${currentUser.role === 'administrador' ? '<a href="admin.html">👨‍💼 Admin</a>' : ''}
      <a href="Chat.html">💬 Chat</a>
      <button onclick="logout()" style="padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Cerrar Sesión
      </button>
    </div>
  `;
  container.insertBefore(userBar, container.firstChild);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'auth.html';
}

function loadProfile() {
  document.getElementById('profile-username').textContent = currentUser.username;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('profile-role').textContent = 
    currentUser.role === 'administrador' ? 'Administrador' : 'Usuario';
}

async function loadOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar pedidos');
    }

    orders = await response.json();
    
    // Actualizar contador
    document.getElementById('profile-orders-count').textContent = orders.length;
    
    renderOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('orders-container').innerHTML = `
      <div style="text-align: center; color: #f44336; padding: 20px;">
        Error al cargar pedidos: ${error.message}
      </div>
    `;
  }
}

function renderOrders() {
  const container = document.getElementById('orders-container');
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No has realizado ningún pedido todavía</h3>
        <p>¡Explora nuestros productos y realiza tu primera compra!</p>
        <a href="Productos.html">Ir a Productos</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="orders-list">
      ${orders.map(order => `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-id">Pedido #${order._id.substring(0, 8)}</div>
              <div class="order-date">${new Date(order.createdAt).toLocaleString('es-ES')}</div>
            </div>
            <span class="order-status ${order.status === 'completado' ? 'status-completed' : 'status-pending'}">
              ${order.status === 'completado' ? '✓ Completado' : '⏳ Pendiente'}
            </span>
          </div>
          
          <div class="order-items">
            <h4>Productos:</h4>
            <ul>
              ${order.items.map(item => `
                <li>
                  <span>${item.name} x${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <div class="order-total">
            Total: $${order.total.toFixed(2)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
