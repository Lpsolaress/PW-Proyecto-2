const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const { createHandler } = require('graphql-http/lib/use/express');

// Cargar variables de entorno (buscar .env en el directorio actual)
dotenv.config({ path: path.join(__dirname, '.env') });

// Importar rutas y modelos
const authRoutes = require('../backend/routes/auth');
const productosRoutes = require('../backend/routes/productos');
const usersRoutes = require('../backend/routes/users');
const ordersRoutes = require('../backend/routes/orders');
const Usuario = require('../backend/models/Usuario');

// Importar GraphQL schema y resolvers
const schema = require('../backend/graphql/schema');
const resolvers = require('../backend/graphql/resolvers');

// Definir modelo de Mensaje inline
const mensajeSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  username: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

mensajeSchema.index({ timestamp: -1 });
const Mensaje = mongoose.model("Mensaje", mensajeSchema);

// Crear aplicación Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rutas de API
app.use('/auth', authRoutes);
app.use('/productos', productosRoutes);
app.use('/users', usersRoutes);
app.use('/orders', ordersRoutes);

// GraphQL endpoint with authentication context
app.use('/graphql', async (req, res, next) => {
  // Try to get user from token for GraphQL context
  let user = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = { id: decoded.id };
    } catch (err) {
      // Token invalid or expired, continue without user
    }
  }
  
  // Create GraphQL handler with context
  const handler = createHandler({
    schema,
    rootValue: resolvers,
    context: { user }
  });
  
  handler(req, res);
});

// Servir archivos estáticos
app.use(express.static(__dirname));

// Rutas para las páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Productos.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Productos.html'));
});

app.get('/Productos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Productos.html'));
});

app.get('/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/Chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Chat.html'));
});

// Middleware de autenticación para Socket.io
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('authentication_error'));
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario) {
      return next(new Error('authentication_error'));
    }

    // Guardar datos del usuario en el socket
    socket.userId = usuario._id;
    socket.username = usuario.username;
    socket.userRole = usuario.role;

    next();
  } catch (error) {
    console.error('Error en autenticación de socket:', error);
    return next(new Error('authentication_error'));
  }
});

// Socket.io para el chat en tiempo real
io.on('connection', async (socket) => {
  console.log(`✅ Usuario conectado: ${socket.username} (${socket.userId})`);

  // Emitir evento de usuario conectado a todos
  socket.broadcast.emit('user_connected', {
    username: socket.username,
    userId: socket.userId
  });

  // Enviar historial de mensajes al nuevo usuario
  try {
    const historial = await Mensaje.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Enviar mensajes en orden cronológico (del más antiguo al más nuevo)
    socket.emit('message_history', historial.reverse());
  } catch (error) {
    console.error('Error al cargar historial:', error);
  }

  // Recibir mensaje de chat
  socket.on('chat_message', async (data) => {
    try {
      // Crear y guardar mensaje en MongoDB
      const nuevoMensaje = new Mensaje({
        text: data.text,
        username: socket.username,
        userId: socket.userId,
        timestamp: new Date()
      });

      await nuevoMensaje.save();

      // Emitir mensaje a todos los clientes conectados
      const mensajeParaEmitir = {
        text: nuevoMensaje.text,
        username: nuevoMensaje.username,
        userId: nuevoMensaje.userId.toString(),
        timestamp: nuevoMensaje.timestamp,
        _id: nuevoMensaje._id
      };

      io.emit('chat_message', mensajeParaEmitir);

      console.log(`💬 Mensaje de ${socket.username}: ${data.text}`);
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  });

  // Usuario está escribiendo
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', {
      username: socket.username,
      userId: socket.userId
    });
  });

  // Usuario dejó de escribir
  socket.on('stop_typing', () => {
    socket.broadcast.emit('user_stop_typing', {
      username: socket.username,
      userId: socket.userId
    });
  });

  // Usuario se desconecta
  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.username}`);

    socket.broadcast.emit('user_disconnected', {
      username: socket.username,
      userId: socket.userId
    });
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Configuración de puerto y MongoDB
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/productos';

// Conexión a MongoDB y arranque del servidor
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`💬 Chat disponible en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

module.exports = app;