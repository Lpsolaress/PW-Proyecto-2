# Setup Guide - Complete Step-by-Step Instructions

## Prerequisites

### Required Software
1. **Node.js** v14 or higher
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** v4.4 or higher
   - Download from: https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`

3. **Git** (for cloning repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Lpsolaress/PW-Proyecto-2.git
cd PW-Proyecto-2/Proyecto-1-PW-main-2
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

Expected packages:
- express
- mongoose
- cors
- dotenv
- jsonwebtoken
- bcryptjs
- morgan
- graphql
- graphql-http

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

Expected packages:
- express
- mongoose
- cors
- dotenv
- jsonwebtoken
- bcryptjs
- morgan
- socket.io

### 4. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cat > .env << EOF
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
MONGO_URI=mongodb://localhost:27017/productos
PORT=3000
EOF
```

**Important Security Notes:**
- Change `JWT_SECRET` to a strong random string (32+ characters) for production
- Never commit the `.env` file to git (it's already in .gitignore)
- Use a secure MongoDB connection string for production

### 5. Start MongoDB

**On Linux/Mac:**
```bash
sudo systemctl start mongod
# Or
sudo service mongod start
```

**On Windows:**
```bash
net start MongoDB
```

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Verify MongoDB is running:
```bash
mongosh
# Or for older versions:
mongo
```

You should see the MongoDB shell prompt.

### 6. Start the Application

From the `frontend` directory:
```bash
node "Chat Server.js"
```

You should see output like:
```
✅ Conectado a MongoDB
🚀 Servidor corriendo en http://localhost:3000
💬 Chat disponible en http://localhost:3000
```

## First-Time Setup

### 1. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

You'll be redirected to the authentication page.

### 2. Create Administrator Account

1. Click on the "Registrarse" tab
2. Fill in the form:
   - Username: `admin` (or your preferred username)
   - Email: `admin@example.com`
   - Password: `admin123` (choose a strong password)
   - Role: Select "Administrador (CRUD completo)"
3. Click "Registrarse"

You'll be automatically logged in and redirected to the products page.

### 3. Create Regular User Account (Optional)

1. Logout (click "Cerrar Sesión")
2. Register another account with "Usuario (solo visualizar)" role
3. This account can only view products and make purchases, not edit them

## Using the Application

### For Administrators

#### Manage Products
1. Go to "Productos" page
2. Use the form at the bottom to add new products
3. Click "Editar" on any product to modify it
4. Click "Eliminar" to delete a product

#### Access Admin Panel
1. Click "👨‍💼 Admin" in the navigation bar
2. You can:
   - View and manage all users (change roles, delete users)
   - View and manage all orders (mark as completed)
   - See statistics dashboard

### For All Users

#### Browse Products
1. Products are displayed in a paginated table
2. Use the search box to filter products
3. Click column headers to sort
4. Click "Ver detalles" to see full product information

#### Shopping Cart
1. Click "🛒 Añadir" button on any product
2. Cart badge shows number of items
3. Click the cart icon (🛒) to view your cart
4. Adjust quantities or remove items
5. Click "Finalizar Compra" to create an order

#### View Orders
1. Click "👤 Perfil" (or "Mi Perfil")
2. View your complete order history
3. See order status (Pendiente/Completado)

#### Use Chat
1. Click "💬 Chat" in the navigation
2. Send messages to other online users
3. See typing indicators
4. Messages are persisted in database

## Testing GraphQL API

### Using cURL

**Query all products:**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products { _id nombre precio descripcion } }"}'
```

**Create a product (requires admin token):**
```bash
# First, get your token by logging in via the web interface
# Check browser console or localStorage for the token
# Then use it in the Authorization header:

curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation { createProduct(input: { nombre: \"Test Product\", precio: 29.99, descripcion: \"Test\" }) { _id nombre } }"
  }'
```

### Using Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Paste and run:

```javascript
// Get all products
fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '{ products { _id nombre precio } }'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### Using GraphQL Playground/Postman

1. Set request type to POST
2. URL: `http://localhost:3000/graphql`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "query": "{ products { _id nombre precio descripcion } }"
}
```

## Troubleshooting

### MongoDB Connection Error
**Error:** `Error al conectar a MongoDB`

**Solutions:**
1. Verify MongoDB is running: `sudo systemctl status mongod`
2. Check connection string in `.env` file
3. Ensure port 27017 is not blocked by firewall
4. Try connecting manually: `mongosh mongodb://localhost:27017/productos`

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Change PORT in `.env` file
2. Or kill the process using port 3000:
   ```bash
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### JWT Token Invalid
**Error:** `Token inválido` or `Token expirado`

**Solutions:**
1. Clear browser localStorage: `localStorage.clear()`
2. Login again to get a new token
3. Verify JWT_SECRET is set in `.env`

### Cannot Access Admin Panel
**Issue:** "Acceso denegado" message

**Solutions:**
1. Verify your user role is "administrador"
2. Check MongoDB directly:
   ```javascript
   use productos
   db.usuarios.find({ email: "your@email.com" })
   ```
3. Update role if needed:
   ```javascript
   db.usuarios.updateOne(
     { email: "your@email.com" },
     { $set: { role: "administrador" } }
   )
   ```

### Chat Not Working
**Issue:** Messages not sending/receiving

**Solutions:**
1. Check browser console for errors
2. Verify you're logged in (chat requires authentication)
3. Check server console for Socket.IO connection messages
4. Ensure firewall allows WebSocket connections

### Products Not Loading
**Issue:** "Error al cargar productos"

**Solutions:**
1. Check if you're logged in (products require authentication)
2. Verify MongoDB connection
3. Check server console for errors
4. Clear browser cache and localStorage

## Development Tips

### Viewing Database Contents

**Using MongoDB Shell:**
```javascript
use productos

// View all products
db.productos.find().pretty()

// View all users
db.usuarios.find().pretty()

// View all orders
db.orders.find().pretty()

// View all chat messages
db.mensajes.find().sort({timestamp: -1}).limit(10).pretty()
```

### Resetting the Database

**Warning:** This will delete all data!

```javascript
use productos
db.dropDatabase()
```

Then restart the application.

### Adding Sample Data

**Using MongoDB Shell:**
```javascript
use productos

// Add sample products
db.productos.insertMany([
  { nombre: "Laptop", precio: 999.99, descripcion: "High performance laptop" },
  { nombre: "Mouse", precio: 29.99, descripcion: "Wireless mouse" },
  { nombre: "Keyboard", precio: 79.99, descripcion: "Mechanical keyboard" }
])
```

### Checking Logs

Server logs appear in the console where you started the application.
For more detailed logging, you can:

1. Check MongoDB logs: `/var/log/mongodb/mongod.log`
2. Add console.log statements in the code
3. Use a logging library like Winston (not currently included)

## Next Steps

1. **Explore the application** - Try all features as different user roles
2. **Test GraphQL** - Use the GraphQL documentation to test queries
3. **Customize** - Modify styles, add new features
4. **Deploy** - Follow deployment checklist in README.md

## Support

For issues or questions:
1. Check the [README.md](README.md)
2. Review [GRAPHQL_DOCUMENTATION.md](GRAPHQL_DOCUMENTATION.md)
3. Check [TEST_SUMMARY.md](TEST_SUMMARY.md)
4. Review [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md)
5. Open an issue on GitHub

## Quick Reference

### Default URLs
- Main App: `http://localhost:3000`
- Products: `http://localhost:3000/Productos.html`
- Login: `http://localhost:3000/auth.html`
- Cart: `http://localhost:3000/cart.html`
- Admin: `http://localhost:3000/admin.html`
- Profile: `http://localhost:3000/user-profile.html`
- Chat: `http://localhost:3000/Chat.html`
- GraphQL: `http://localhost:3000/graphql`

### Default Credentials (After First Setup)
Create your own admin account during first setup.

### Important Files
- Server: `frontend/Chat Server.js`
- Environment: `frontend/.env`
- Models: `backend/models/`
- Routes: `backend/routes/`
- GraphQL: `backend/graphql/`

Enjoy your new online store! 🛒
