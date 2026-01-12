// Variables globales
let socket;
let usuarioActual = null;
let token = null;
let typingTimeout;

// Elementos del DOM
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const typingIndicator = document.getElementById('typing-indicator');
const userDisplay = document.getElementById('user-display');
const messagesContainer = document.getElementById('messages-container');

// Verificar autenticación al cargar
window.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacion();
});

function verificarAutenticacion() {
  token = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!token || !usuarioGuardado) {
    // No está autenticado, redirigir a login
    window.location.href = 'auth.html';
    return;
  }

  usuarioActual = JSON.parse(usuarioGuardado);
  userDisplay.textContent = `${usuarioActual.username} (${usuarioActual.role})`;

  // Iniciar conexión de socket
  iniciarSocket();
}

function iniciarSocket() {
  // Conectar al servidor con autenticación
  socket = io({
    auth: {
      token: token,
      username: usuarioActual.username,
      userId: usuarioActual.id
    }
  });

  // Eventos de Socket.IO
  socket.on('connect', () => {
    console.log('✅ Conectado al servidor de chat');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión:', error);
    if (error.message === 'authentication_error') {
      alert('Error de autenticación. Por favor inicia sesión nuevamente.');
      cerrarSesion();
    }
  });

  // Recibir historial de mensajes
  socket.on('message_history', (historial) => {
    console.log(`📜 Historial recibido: ${historial.length} mensajes`);
    historial.forEach(msg => {
      agregarMensaje(msg);
    });
    scrollToBottom();
  });

  // Recibir nuevo mensaje
  socket.on('chat_message', (data) => {
    agregarMensaje(data);
    scrollToBottom();
  });

  // Usuario conectado
  socket.on('user_connected', (data) => {
    mostrarMensajeSistema(`${data.username} se ha unido al chat`);
    scrollToBottom();
  });

  // Usuario desconectado
  socket.on('user_disconnected', (data) => {
    mostrarMensajeSistema(`${data.username} ha salido del chat`);
    scrollToBottom();
  });

  // Alguien está escribiendo
  socket.on('user_typing', (data) => {
    if (data.username !== usuarioActual.username) {
      mostrarIndicadorEscritura(data.username);
    }
  });

  // Dejó de escribir
  socket.on('user_stop_typing', (data) => {
    if (data.username !== usuarioActual.username) {
      ocultarIndicadorEscritura();
    }
  });

  // Error
  socket.on('error', (data) => {
    console.error('Error del servidor:', data.message);
    alert('Error: ' + data.message);
  });
}

// Enviar mensaje
form.addEventListener('submit', function(e) {
  e.preventDefault();

  if (input.value.trim()) {
    const mensaje = {
      text: input.value.trim(),
      username: usuarioActual.username,
      userId: usuarioActual.id,
      timestamp: new Date().toISOString()
    };

    socket.emit('chat_message', mensaje);
    input.value = '';
    socket.emit('stop_typing');
  }
});

// Detectar cuando el usuario está escribiendo
let isTyping = false;
input.addEventListener('input', () => {
  if (!isTyping && input.value.trim()) {
    isTyping = true;
    socket.emit('typing', {
      username: usuarioActual.username
    });
  }

  // Limpiar timeout previo
  clearTimeout(typingTimeout);

  // Establecer nuevo timeout para dejar de escribir
  typingTimeout = setTimeout(() => {
    if (isTyping) {
      isTyping = false;
      socket.emit('stop_typing');
    }
  }, 1000);
});

// Funciones de UI
function agregarMensaje(data) {
  const li = document.createElement('li');
  const esPropio = data.userId === usuarioActual.id || data.username === usuarioActual.username;

  li.className = esPropio ? 'message-own' : 'message-other';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Solo mostrar nombre de usuario si no es el propio
  if (!esPropio) {
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'message-username';
    usernameDiv.textContent = data.username;
    bubble.appendChild(usernameDiv);
  }

  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  textDiv.textContent = data.text;
  bubble.appendChild(textDiv);

  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = formatearHora(data.timestamp);
  bubble.appendChild(timeDiv);

  li.appendChild(bubble);
  messages.appendChild(li);
}

function mostrarMensajeSistema(texto) {
  const li = document.createElement('li');
  li.className = 'system-message';
  li.textContent = texto;
  messages.appendChild(li);
}

function mostrarIndicadorEscritura(username) {
  typingIndicator.textContent = `${username} está escribiendo...`;
  typingIndicator.style.display = 'block';
}

function ocultarIndicadorEscritura() {
  typingIndicator.style.display = 'none';
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatearHora(timestamp) {
  const fecha = new Date(timestamp);
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

function cerrarSesion() {
  if (socket) {
    socket.disconnect();
  }
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'auth.html';
}

// Prevenir recarga accidental
window.addEventListener('beforeunload', (e) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
});
