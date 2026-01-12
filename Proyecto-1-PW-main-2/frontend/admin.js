const API_URL = 'http://localhost:3000';
let currentUser = null;
let token = null;
let users = [];
let orders = [];

// Verificar autenticación y permisos
document.addEventListener('DOMContentLoaded', () => {
  token = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!token || !usuarioGuardado) {
    window.location.href = 'auth.html';
    return;
  }

  currentUser = JSON.parse(usuarioGuardado);

  // Verificar que sea administrador
  if (currentUser.role !== 'administrador') {
    alert('Acceso denegado. Solo administradores pueden acceder a este panel.');
    window.location.href = 'Productos.html';
    return;
  }

  // Crear barra de usuario
  createUserBar();

  // Configurar tabs
  setupTabs();

  // Cargar datos iniciales
  loadUsers();
  loadOrders();
  loadStats();
});

function createUserBar() {
  const container = document.querySelector('.container');
  const userBar = document.createElement('div');
  userBar.className = 'user-bar';
  userBar.innerHTML = `
    <div>
      <strong>Admin:</strong> ${currentUser.username}
    </div>
    <div class="nav-links">
      <a href="Productos.html">Productos</a>
      <a href="cart.html">🛒 Carrito</a>
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

function setupTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remover active de todos los tabs
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Activar el tab clickeado
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });
}

async function fetchWithAuth(url, options = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return fetch(url, { ...options, headers });
}

async function loadUsers() {
  try {
    const response = await fetchWithAuth(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }

    users = await response.json();
    renderUsers();
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('users-tbody').innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #f44336;">
          Error al cargar usuarios: ${error.message}
        </td>
      </tr>
    `;
  }
}

function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <h3>No hay usuarios registrados</h3>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td><strong>${user.username}</strong></td>
      <td>${user.email}</td>
      <td>
        <span class="badge ${user.role === 'administrador' ? 'badge-admin' : 'badge-user'}">
          ${user.role === 'administrador' ? 'Administrador' : 'Usuario'}
        </span>
      </td>
      <td>${user.orders ? user.orders.length : 0}</td>
      <td>${new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
      <td>
        <button class="btn-action btn-edit" onclick="changeUserRole('${user._id}', '${user.role}')">
          Cambiar Rol
        </button>
        ${user._id !== currentUser.id ? `
          <button class="btn-action btn-delete" onclick="deleteUser('${user._id}', '${user.username}')">
            Eliminar
          </button>
        ` : '<span style="color: #999; font-size: 12px;">(Tú)</span>'}
      </td>
    </tr>
  `).join('');
}

async function changeUserRole(userId, currentRole) {
  const newRole = currentRole === 'administrador' ? 'usuario' : 'administrador';
  
  if (!confirm(`¿Cambiar el rol a "${newRole}"?`)) {
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cambiar rol');
    }

    showNotification('Rol actualizado exitosamente', 'success');
    loadUsers();
  } catch (error) {
    console.error('Error changing role:', error);
    showNotification(error.message, 'error');
  }
}

async function deleteUser(userId, username) {
  if (!confirm(`¿Estás seguro de eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar usuario');
    }

    showNotification('Usuario eliminado exitosamente', 'success');
    loadUsers();
    loadStats();
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification(error.message, 'error');
  }
}

async function loadOrders() {
  try {
    const statusFilter = document.getElementById('order-status-filter').value;
    let url = `${API_URL}/orders`;
    
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }

    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error('Error al cargar pedidos');
    }

    orders = await response.json();
    renderOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('orders-tbody').innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #f44336;">
          Error al cargar pedidos: ${error.message}
        </td>
      </tr>
    `;
  }
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  
  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <h3>No hay pedidos</h3>
          <p>Los pedidos aparecerán aquí cuando los usuarios realicen compras</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td style="font-family: monospace; font-size: 12px;">${order._id.substring(0, 8)}...</td>
      <td><strong>${order.user?.username || 'N/A'}</strong></td>
      <td class="order-items">
        <ul>
          ${order.items.map(item => `
            <li>${item.name} x${item.quantity} ($${item.price.toFixed(2)})</li>
          `).join('')}
        </ul>
      </td>
      <td><strong>$${order.total.toFixed(2)}</strong></td>
      <td>
        <span class="badge ${order.status === 'completado' ? 'badge-completed' : 'badge-pending'}">
          ${order.status === 'completado' ? 'Completado' : 'Pendiente'}
        </span>
      </td>
      <td>${new Date(order.createdAt).toLocaleDateString('es-ES')}</td>
      <td>
        ${order.status === 'pendiente' ? `
          <button class="btn-action btn-complete" onclick="completeOrder('${order._id}')">
            Completar
          </button>
        ` : '<span style="color: #999;">✓ Completado</span>'}
      </td>
    </tr>
  `).join('');
}

async function completeOrder(orderId) {
  if (!confirm('¿Marcar este pedido como completado?')) {
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completado' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar pedido');
    }

    showNotification('Pedido marcado como completado', 'success');
    loadOrders();
    loadStats();
  } catch (error) {
    console.error('Error completing order:', error);
    showNotification(error.message, 'error');
  }
}

async function loadStats() {
  try {
    // Cargar usuarios
    const usersResponse = await fetchWithAuth(`${API_URL}/users`);
    const usersData = await usersResponse.json();
    document.getElementById('stat-users').textContent = usersData.length;

    // Cargar pedidos
    const ordersResponse = await fetchWithAuth(`${API_URL}/orders`);
    const ordersData = await ordersResponse.json();
    
    const pendingOrders = ordersData.filter(o => o.status === 'pendiente').length;
    const completedOrders = ordersData.filter(o => o.status === 'completado').length;
    
    document.getElementById('stat-pending').textContent = pendingOrders;
    document.getElementById('stat-completed').textContent = completedOrders;
    document.getElementById('stat-total-orders').textContent = ordersData.length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
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
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
