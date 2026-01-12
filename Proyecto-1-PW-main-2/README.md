# Sistema de Gestión de Productos con Chat en Tiempo Real

Este proyecto es una aplicación web completa con **autenticación JWT**, **gestión de productos con CRUD** y **chat en tiempo real**. Utiliza **Node.js**, **Express**, **MongoDB**, **Socket.io** y **JWT** para proporcionar una experiencia segura y en tiempo real.

## 🚀 Características

### 1. **Autenticación y Autorización**
- ✅ Sistema de registro y login con JWT
- ✅ Dos roles de usuario: **Usuario** y **Administrador**
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración 
- ✅ Protección de rutas API y Socket.io con middleware JWT

### 2. **Gestión de Productos (CRUD)**
- ✅ **Usuarios**: Solo pueden visualizar productos
- ✅ **Administradores**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Modal de detalles del producto
- ✅ Búsqueda y paginación
- ✅ Ordenamiento por columnas
- ✅ Edición inline de productos

### 3. **Chat en Tiempo Real**
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Mensajes persistentes en MongoDB
- ✅ Historial de los últimos 50 mensajes
- ✅ Indicador "usuario escribiendo..."
- ✅ Notificaciones de conexión/desconexión
- ✅ Interfaz estilo WhatsApp/Telegram
- ✅ Autenticación JWT en conexiones Socket.io

### 4. **Persistencia**
- ✅ Usuarios almacenados en MongoDB
- ✅ Productos almacenados en MongoDB
- ✅ Mensajes del chat almacenados en MongoDB
- ✅ JWT valida en servidor para todas las operaciones

---

## Tabla de Contenidos

- [Chat Server](#chat-server)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Requisitos](#requisitos)
  - [Instalación](#instalación)
  - [Estructura del Código](#estructura-del-código)
    - [Dependencias](#dependencias)
    - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
    - [Middlewares](#middlewares)
    - [Rutas](#rutas)
      - [Rutas Públicas](#rutas-públicas)
      - [Rutas Protegidas](#rutas-protegidas)
      - [Archivos Estáticos](#archivos-estáticos)
      - [Ruta Principal](#ruta-principal)
    - [Conexión a MongoDB](#conexión-a-mongodb)
  - [Cómo Ejecutar el Proyecto](#cómo-ejecutar-el-proyecto)
  - [Notas Adicionales](#notas-adicionales)

---

## Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- **Node.js** (v14 o superior)
- **MongoDB** (local, configurado con MongoDB Compass)
- **npm** (gestor de paquetes de Node.js)

---

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_PROYECTO>
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env`:
   ```dotenv
   MONGO_URI=mongodb://localhost:27017/portal_productos
   PORT=3000
   JWT_SECRET=your_secret_key
   ```

4. Asegúrate de que MongoDB esté corriendo localmente:
   ```bash
   brew services start mongodb-community
   ```

---

## Estructura del Código

### Dependencias

El proyecto utiliza las siguientes dependencias principales:

- **express**: Framework para manejar rutas y middlewares.
- **cors**: Permite solicitudes desde diferentes orígenes.
- **morgan**: Middleware para registrar solicitudes HTTP.
- **dotenv**: Carga variables de entorno desde un archivo `.env`.
- **mongodb**: Cliente oficial para conectarse a MongoDB.

### Configuración de Variables de Entorno

El archivo `.env` contiene las configuraciones sensibles, como la URI de conexión a MongoDB y el puerto del servidor:

```dotenv
MONGO_URI=mongodb://localhost:27017/portal_productos
PORT=3000
JWT_SECRET=your_secret_key
```

### Middlewares

El servidor utiliza los siguientes middlewares:

- **CORS**: Permite solicitudes desde diferentes dominios.
- **JSON Parser**: Convierte el cuerpo de las solicitudes en objetos JSON.
- **Morgan**: Registra las solicitudes HTTP en la consola.

```javascript
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));
```

### Rutas

#### Rutas Públicas

Las rutas públicas no requieren autenticación. Por ejemplo, la ruta `/auth` maneja la autenticación de usuarios:

```javascript
app.use("/auth", authRoutes);
```

#### Rutas Protegidas

Las rutas protegidas requieren autenticación mediante un middleware (`authenticate`). Por ejemplo, la ruta `/productos`:

```javascript
app.use("/productos", authenticate, productosRouter);
```

#### Archivos Estáticos

El servidor sirve archivos estáticos desde la carpeta `frontend`:

```javascript
app.use(express.static(path.join(__dirname, "../frontend")));
```

#### Ruta Principal

La ruta principal (`/`) devuelve el archivo `index.html` del frontend:

```javascript
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
```

### Conexión a MongoDB

El servidor se conecta a una base de datos MongoDB local utilizando el cliente oficial de MongoDB:

```javascript
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/portal_productos";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Compass");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  } catch (err) {
    console.error("Error al conectar a MongoDB Compass", err);
    process.exit(1);
  }
}

run().catch(console.dir);
```

---

## Cómo Ejecutar el Proyecto

1. Asegúrate de que MongoDB esté corriendo:
   ```bash
   brew services start mongodb-community
   ```

2. Inicia el servidor:
   ```bash
    node "Chat Server.js"
   ```

3. Abre tu navegador y ve a:
   ```
   http://localhost:3000
   ```

---

## Notas Adicionales

- **Errores comunes**:
  - Si el servidor no se conecta a MongoDB, verifica que el servicio esté corriendo y que la URI en el archivo `.env` sea correcta.
  - Si ves un error relacionado con módulos faltantes, asegúrate de haber ejecutado `npm install`.

- **Extensiones recomendadas**:
  - Usa **MongoDB Compass** para inspeccionar y administrar tu base de datos.

---

- [Proyecto](https://github.com/Lpsolaress/Proyecto-1-PW.git)
