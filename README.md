# PW-Proyecto-2

## Tienda Online con GraphQL, Carrito de Compras y Chat

Una aplicación web completa de comercio electrónico construida con Node.js, Express, MongoDB, GraphQL y Socket.IO.

## 🚀 Características

### Backend
- **API REST** para operaciones CRUD de productos, usuarios y pedidos
- **GraphQL API** en el endpoint `/graphql` para consultas flexibles
- **Autenticación JWT** con roles (usuario/administrador)
- **Base de datos MongoDB** con Mongoose
- **Chat en tiempo real** con Socket.IO
- **Gestión de pedidos** con estados (pendiente/completado)

### Frontend
- **Gestión de productos** con búsqueda, ordenamiento y paginación
- **Carrito de compras** con persistencia en LocalStorage
- **Panel de administración** para gestionar usuarios y pedidos
- **Perfil de usuario** con historial de pedidos
- **Chat en vivo** con autenticación
- **Interfaz responsive** con roles diferenciados

## 📋 Requisitos Previos

- Node.js v14 o superior
- MongoDB v4.4 o superior
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Lpsolaress/PW-Proyecto-2.git
cd PW-Proyecto-2/Proyecto-1-PW-main-2
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend
```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno
Crear un archivo `.env` en el directorio `frontend`:
```env
JWT_SECRET=supersecretkey123456789
MONGO_URI=mongodb://localhost:27017/productos
PORT=3000
```

### 5. Iniciar MongoDB
Asegúrate de que MongoDB esté ejecutándose:
```bash
# En Linux/Mac
sudo systemctl start mongod

# En Windows
net start MongoDB
```

## 🚀 Ejecución

### Iniciar el servidor
Desde el directorio `frontend`:
```bash
node "Chat Server.js"
```

El servidor estará disponible en: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
Proyecto-1-PW-main-2/
├── backend/
│   ├── graphql/
│   │   ├── schema.js          # Schema de GraphQL
│   │   └── resolvers.js       # Resolvers de GraphQL
│   ├── middlewares/
│   │   └── auth.js            # Middleware de autenticación JWT
│   ├── models/
│   │   ├── Producto.js        # Modelo de Producto
│   │   ├── Usuario.js         # Modelo de Usuario
│   │   └── Order.js           # Modelo de Pedido
│   ├── routes/
│   │   ├── auth.js            # Rutas de autenticación
│   │   ├── productos.js       # Rutas de productos
│   │   ├── users.js           # Rutas de usuarios
│   │   └── orders.js          # Rutas de pedidos
│   └── package.json
├── frontend/
│   ├── Chat Server.js         # Servidor principal con Express y Socket.IO
│   ├── Productos.html         # Página de productos
│   ├── auth.html             # Página de login/registro
│   ├── cart.html             # Página del carrito
│   ├── admin.html            # Panel de administración
│   ├── user-profile.html     # Perfil de usuario
│   ├── Chat.html             # Chat en vivo
│   ├── main.js               # Lógica de productos
│   ├── auth.js               # Lógica de autenticación
│   ├── cart.js               # Lógica del carrito
│   ├── admin.js              # Lógica del panel admin
│   ├── user-profile.js       # Lógica del perfil
│   ├── chat-client.js        # Cliente del chat
│   ├── styles.css            # Estilos globales
│   └── package.json
└── GRAPHQL_DOCUMENTATION.md  # Documentación de GraphQL
```

## 🔑 Funcionalidades por Rol

### Usuario Regular
- ✅ Ver productos
- ✅ Añadir productos al carrito
- ✅ Realizar pedidos
- ✅ Ver historial de pedidos
- ✅ Participar en el chat
- ❌ No puede crear/editar/eliminar productos
- ❌ No puede acceder al panel de administración

### Administrador
- ✅ Todas las funcionalidades de usuario
- ✅ Crear, editar y eliminar productos
- ✅ Gestionar usuarios (cambiar roles, eliminar)
- ✅ Ver todos los pedidos
- ✅ Marcar pedidos como completados
- ✅ Acceder al panel de administración

## 📡 API REST Endpoints

### Autenticación
- `POST /auth/registro` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/perfil` - Obtener perfil (requiere token)

### Productos
- `GET /productos` - Listar productos (requiere autenticación)
- `GET /productos/:id` - Obtener producto por ID
- `POST /productos` - Crear producto (solo admin)
- `PUT /productos/:id` - Actualizar producto (solo admin)
- `DELETE /productos/:id` - Eliminar producto (solo admin)

### Usuarios (solo admin)
- `GET /users` - Listar usuarios
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id/role` - Actualizar rol de usuario
- `DELETE /users/:id` - Eliminar usuario

### Pedidos
- `POST /orders` - Crear pedido (requiere autenticación)
- `GET /orders` - Listar pedidos (usuario ve solo los suyos, admin ve todos)
- `GET /orders/:id` - Obtener pedido por ID
- `PUT /orders/:id/status` - Actualizar estado (solo admin)

## 🔌 GraphQL API

El endpoint de GraphQL está disponible en: `POST /graphql`

Para documentación completa de GraphQL, consulta [GRAPHQL_DOCUMENTATION.md](./GRAPHQL_DOCUMENTATION.md)

### Ejemplo de consulta
```graphql
query {
  products {
    _id
    nombre
    precio
    descripcion
  }
}
```

### Ejemplo de mutación
```graphql
mutation {
  createOrder(input: {
    items: [{
      product: "507f1f77bcf86cd799439011"
      name: "Producto 1"
      price: 29.99
      quantity: 2
    }]
    total: 59.98
  }) {
    _id
    total
    status
  }
}
```

## 💬 Chat en Tiempo Real

El chat utiliza Socket.IO y requiere autenticación JWT:

### Eventos del cliente
- `chat_message` - Enviar mensaje
- `typing` - Usuario está escribiendo
- `stop_typing` - Usuario dejó de escribir

### Eventos del servidor
- `message_history` - Historial de mensajes (últimos 50)
- `chat_message` - Nuevo mensaje
- `user_connected` - Usuario conectado
- `user_disconnected` - Usuario desconectado
- `user_typing` - Usuario escribiendo
- `user_stop_typing` - Usuario dejó de escribir

## 🛒 Carrito de Compras

El carrito utiliza LocalStorage para persistencia:
- Añadir productos al carrito
- Actualizar cantidades
- Eliminar productos
- Calcular totales automáticamente
- Simular compra y crear pedido
- Vaciar carrito después de compra exitosa

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Linting
```bash
cd backend
npm run lint
```

## 📝 Notas de Desarrollo

### Crear un usuario administrador
1. Registrarse normalmente desde `/auth.html`
2. Seleccionar rol "Administrador" en el formulario
3. El primer usuario puede ser admin, o usar MongoDB Compass/shell para cambiar el rol manualmente

### Variables de entorno importantes
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `MONGO_URI`: URI de conexión a MongoDB
- `PORT`: Puerto del servidor (default: 3000)

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación basada en JWT
- ✅ Validación de roles en rutas protegidas
- ✅ Validación de entrada en modelos Mongoose
- ✅ CORS configurado
- ✅ Prevención de inyección con Mongoose

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Autores

- Lpsolaress

## 🙏 Agradecimientos

- Express.js
- MongoDB y Mongoose
- Socket.IO
- GraphQL
- JWT