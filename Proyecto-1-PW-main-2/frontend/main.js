const API_URL = "http://localhost:3000";
let productos = [];
let paginaActual = 1;
const porPagina = 5;
let ordenCampo = null;
let ordenAsc = true;
let usuarioActual = null;
let token = null;

const tbody = document.querySelector("#tabla-productos tbody");
const spinner = document.getElementById("spinner");
const mensaje = document.getElementById("mensaje");

// Verificar autenticación al cargar
window.addEventListener("DOMContentLoaded", () => {
  verificarAutenticacion();
});

function verificarAutenticacion() {
  token = localStorage.getItem("token");
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!token || !usuarioGuardado) {
    // No está autenticado, redirigir a login
    window.location.href = "auth.html";
    return;
  }

  usuarioActual = JSON.parse(usuarioGuardado);
  configurarInterfazSegunRol();
  cargarProductos(); // Cargar productos automáticamente
}

function configurarInterfazSegunRol() {
  // Crear barra de usuario
  const container = document.querySelector(".container");
  const userBar = document.createElement("div");
  userBar.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;";
  userBar.innerHTML = `
    <div>
      <strong>Bienvenido:</strong> ${usuarioActual.username}
      <span style="color: ${usuarioActual.role === 'administrador' ? '#4CAF50' : '#666'}; font-weight: bold;">
        (${usuarioActual.role === 'administrador' ? 'Administrador' : 'Usuario'})
      </span>
    </div>
    <div style="display: flex; align-items: center; gap: 15px;">
      <a href="cart.html" style="color: #4CAF50; text-decoration: none; font-size: 24px; position: relative;">
        🛒
        <span id="cart-badge" class="cart-badge" style="position: absolute; top: -8px; right: -8px; background: #f44336; color: white; border-radius: 50%; width: 20px; height: 20px; display: none; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">0</span>
      </a>
      ${usuarioActual.role === 'administrador' ? '<a href="admin.html" style="color: #4CAF50; text-decoration: none;">👨‍💼 Admin</a>' : '<a href="user-profile.html" style="color: #4CAF50; text-decoration: none;">👤 Perfil</a>'}
      <a href="Chat.html" style="color: #4CAF50; text-decoration: none;">💬 Chat</a>
      <button id="btn-logout" style="padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Cerrar Sesión
      </button>
    </div>
  `;
  container.insertBefore(userBar, container.firstChild);

  document.getElementById("btn-logout").addEventListener("click", cerrarSesion);

  // Si es usuario (no administrador), ocultar/deshabilitar funciones de administrador
  if (usuarioActual.role !== "administrador") {
    // Ocultar formulario de añadir producto
    const formSection = document.querySelector("h2:nth-of-type(2)"); // "Añadir producto"
    if (formSection) {
      formSection.style.display = "none";
      document.getElementById("form-producto").style.display = "none";
    }

    // Mostrar mensaje informativo
    const infoDiv = document.createElement("div");
    infoDiv.style.cssText = "background: #fff3cd; color: #856404; padding: 12px; border-radius: 5px; margin-bottom: 15px;";
    infoDiv.innerHTML = "<strong>Modo Usuario:</strong> Solo puedes visualizar los productos. Para crear, editar o eliminar productos necesitas rol de Administrador.";
    container.insertBefore(infoDiv, document.querySelector("h2"));
  }
}

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "auth.html";
}

// Función auxiliar para hacer peticiones con autenticación
async function fetchConAuth(url, opciones = {}) {
  const headers = {
    ...opciones.headers,
    "Authorization": `Bearer ${token}`
  };

  return fetch(url, { ...opciones, headers });
}

document.getElementById("btn-cargar").addEventListener("click", cargarProductos);
document.getElementById("busqueda").addEventListener("input", renderProductos);
document.getElementById("form-producto").addEventListener("submit", agregarProducto);
document.querySelectorAll("#tabla-productos th[data-field]").forEach(th => {
  th.addEventListener("click", () => ordenarPor(th.dataset.field));
});

async function cargarProductos() {
  mostrarSpinner(true);
  try {
    const res = await fetchConAuth(`${API_URL}/productos`);
    if (!res.ok) {
      if (res.status === 401) {
        mostrarMensaje("Sesión expirada. Redirigiendo...", "error");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = "auth.html";
        }, 2000);
        return;
      }
      throw new Error("Error al cargar productos");
    }
    productos = await res.json();
    paginaActual = 1;
    renderProductos();
    mostrarMensaje("Productos cargados", "ok");
  } catch (err) {
    mostrarMensaje(err.message, "error");
  } finally {
    mostrarSpinner(false);
  }
}

function renderProductos() {
  let filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(document.getElementById("busqueda").value.toLowerCase())
  );

  if (ordenCampo) {
    filtrados.sort((a, b) => {
      if (a[ordenCampo] < b[ordenCampo]) return ordenAsc ? -1 : 1;
      if (a[ordenCampo] > b[ordenCampo]) return ordenAsc ? 1 : -1;
      return 0;
    });
  }

  const inicio = (paginaActual - 1) * porPagina;
  const visibles = filtrados.slice(inicio, inicio + porPagina);

  tbody.innerHTML = "";
  visibles.forEach(p => {
    const tr = document.createElement("tr");
    const esAdmin = usuarioActual && usuarioActual.role === "administrador";

    tr.innerHTML = `
      <td><input type="text" value="${p.nombre}" data-id="${p._id}" data-field="nombre" disabled></td>
      <td><input type="number" value="${p.precio}" data-id="${p._id}" data-field="precio" disabled></td>
      <td><input type="text" value="${p.descripcion}" data-id="${p._id}" data-field="descripcion" disabled></td>
      <td>
        <button class="btn-ver-detalle" onclick="verDetalle('${p._id}')">Ver detalles</button>
        <button class="btn-add-cart" onclick="addProductToCart('${p._id}')" style="background: #4CAF50; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 5px;">🛒 Añadir</button>
        ${esAdmin ? `
          <button class="edit-btn" onclick="editarProducto('${p._id}')">Editar</button>
          <button class="save-btn" onclick="guardarProducto('${p._id}')" style="display:none">Guardar</button>
          <button class="delete-btn" onclick="eliminarProducto('${p._id}')">Eliminar</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPaginacion(filtrados.length);
}

function renderPaginacion(total) {
  const totalPaginas = Math.ceil(total / porPagina);
  const pagDiv = document.getElementById("paginacion");
  pagDiv.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === paginaActual) btn.style.background = "#0056b3";
    btn.addEventListener("click", () => {
      paginaActual = i;
      renderProductos();
    });
    pagDiv.appendChild(btn);
  }
}

function ordenarPor(campo) {
  if (ordenCampo === campo) {
    ordenAsc = !ordenAsc;
  } else {
    ordenCampo = campo;
    ordenAsc = true;
  }
  renderProductos();
}

async function eliminarProducto(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
  try {
    const res = await fetchConAuth(`${API_URL}/productos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      if (res.status === 403) {
        mostrarMensaje("No tienes permisos para eliminar productos", "error");
        return;
      }
      throw new Error("Error al eliminar");
    }
    productos = productos.filter(p => p._id !== id);
    renderProductos();
    mostrarMensaje("Producto eliminado", "ok");
  } catch {
    mostrarMensaje("Error al eliminar producto", "error");
  }
}

function editarProducto(id) {
  const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
  inputs.forEach(i => i.disabled = false);
  const row = inputs[0].closest("tr");
  row.querySelector(".edit-btn").style.display = "none";
  row.querySelector(".save-btn").style.display = "inline-block";
}

async function guardarProducto(id) {
  const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
  const actualizado = {};
  inputs.forEach(i => {
    actualizado[i.dataset.field] = i.type === "number" ? parseFloat(i.value) : i.value;
    i.disabled = true;
  });

  try {
    const res = await fetchConAuth(`${API_URL}/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actualizado)
    });

    if (!res.ok) {
      if (res.status === 403) {
        mostrarMensaje("No tienes permisos para editar productos", "error");
        return;
      }
      throw new Error("Error al actualizar");
    }

    productos = productos.map(p => p._id === id ? { ...p, ...actualizado } : p);
    renderProductos();
    mostrarMensaje("Producto actualizado", "ok");
  } catch {
    mostrarMensaje("Error al actualizar producto", "error");
  }
}

async function agregarProducto(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!nombre) return mostrarMensaje("El nombre no puede estar vacío", "error");
  if (precio <= 0 || isNaN(precio)) return mostrarMensaje("El precio debe ser mayor que 0", "error");
  if (!descripcion) return mostrarMensaje("La descripción no puede estar vacía", "error");

  const nuevo = { nombre, precio, descripcion };

  try {
    const res = await fetchConAuth(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });

    if (!res.ok) {
      if (res.status === 403) {
        mostrarMensaje("No tienes permisos para crear productos", "error");
        return;
      }
      throw new Error("Error al crear");
    }

    const creado = await res.json();
    productos.push(creado);
    renderProductos();
    e.target.reset();
    mostrarMensaje("Producto añadido exitosamente", "ok");
  } catch {
    mostrarMensaje("Error al añadir producto", "error");
  }
}

function mostrarSpinner(show) {
  spinner.style.display = show ? "block" : "none";
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
  mensaje.style.display = "block";
  setTimeout(() => mensaje.style.display = "none", 3000);
}

// Funciones para el modal de detalles
function verDetalle(id) {
  const producto = productos.find(p => p._id === id);
  if (!producto) {
    mostrarMensaje("Producto no encontrado", "error");
    return;
  }

  // Llenar el modal con los datos del producto
  document.getElementById("modal-nombre").textContent = producto.nombre;
  document.getElementById("modal-precio").textContent = `$${producto.precio.toFixed(2)}`;
  document.getElementById("modal-descripcion").textContent = producto.descripcion;
  document.getElementById("modal-id").textContent = producto._id;

  // Formatear fechas
  if (producto.createdAt) {
    const fechaCreacion = new Date(producto.createdAt);
    document.getElementById("modal-creado").textContent = fechaCreacion.toLocaleString('es-ES');
  }

  if (producto.updatedAt) {
    const fechaActualizado = new Date(producto.updatedAt);
    document.getElementById("modal-actualizado").textContent = fechaActualizado.toLocaleString('es-ES');
  }

  // Mostrar el modal
  document.getElementById("modal-detalle").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modal-detalle").style.display = "none";
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
  const modal = document.getElementById("modal-detalle");
  if (event.target === modal) {
    cerrarModal();
  }
}

// Función para añadir producto al carrito
function addProductToCart(id) {
  const producto = productos.find(p => p._id === id);
  if (!producto) {
    mostrarMensaje("Producto no encontrado", "error");
    return;
  }
  
  addToCart(producto);
  mostrarMensaje(`${producto.nombre} añadido al carrito`, "ok");
}
