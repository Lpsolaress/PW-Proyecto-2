const API_URL = 'http://localhost:3000';

// Elementos del DOM
const loginTab = document.querySelector('[data-tab="login"]');
const registroTab = document.querySelector('[data-tab="registro"]');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const mensaje = document.getElementById('mensaje');

// Cambiar entre pestañas
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registroTab.classList.remove('active');
  formLogin.classList.add('active');
  formRegistro.classList.remove('active');
  limpiarMensaje();
});

registroTab.addEventListener('click', () => {
  registroTab.classList.add('active');
  loginTab.classList.remove('active');
  formRegistro.classList.add('active');
  formLogin.classList.remove('active');
  limpiarMensaje();
});

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.style.display = 'block';
}

function limpiarMensaje() {
  mensaje.style.display = 'none';
  mensaje.className = 'mensaje';
}

// Guardar token y datos de usuario
function guardarSesion(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

// Login
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
      guardarSesion(data.token, data.usuario);

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      mostrarMensaje(data.error || 'Error al iniciar sesión', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión con el servidor', 'error');
  }
});

// Registro
formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('registro-username').value;
  const email = document.getElementById('registro-email').value;
  const password = document.getElementById('registro-password').value;
  const role = document.getElementById('registro-role').value;

  try {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje('¡Registro exitoso! Redirigiendo...', 'success');
      guardarSesion(data.token, data.usuario);

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      mostrarMensaje(data.error || 'Error al registrarse', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión con el servidor', 'error');
  }
});

// Verificar si ya está logueado
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');

  if (token && usuario) {
    const userData = JSON.parse(usuario);
    mostrarMensaje(
      `Ya estás logueado como ${userData.username}. Redirigiendo...`,
      'success'
    );
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }
});
