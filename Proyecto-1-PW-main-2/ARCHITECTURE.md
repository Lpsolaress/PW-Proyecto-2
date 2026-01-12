# Project Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────┬──────────┬──────────┬──────────┬────────────┐ │
│  │ Products │   Cart   │  Admin   │ Profile  │    Chat    │ │
│  │  .html   │  .html   │  .html   │  .html   │   .html    │ │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴─────┬──────┘ │
│       │          │          │          │           │        │
│  ┌────▼──────────▼──────────▼──────────▼───────────▼──────┐ │
│  │        JavaScript (main.js, cart.js, admin.js, etc.)   │ │
│  │    - LocalStorage for cart persistence                 │ │
│  │    - JWT token management                              │ │
│  │    - API calls (REST & GraphQL)                        │ │
│  │    - Socket.IO client for chat                         │ │
│  └────────────────────────┬──────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   HTTP/HTTPS    │
                    │   WebSocket     │
                    └────────┬────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    SERVER (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Chat Server.js (Main Server)            │   │
│  │  - Express application                               │   │
│  │  - Socket.IO for real-time chat                      │   │
│  │  - Static file serving                               │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────▼──────────────────────────────┐     │
│  │              Middleware Layer                       │     │
│  │  ┌──────────┬───────────┬──────────────────────┐   │     │
│  │  │   CORS   │  Morgan   │  JWT Authentication  │   │     │
│  │  └──────────┴───────────┴──────────────────────┘   │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │                 API Endpoints                        │    │
│  │  ┌────────────┬──────────┬──────────┬────────────┐  │    │
│  │  │ REST API   │ GraphQL  │ Socket   │  Static    │  │    │
│  │  │            │ /graphql │   .IO    │   Files    │  │    │
│  │  └─────┬──────┴────┬─────┴────┬─────┴──────┬─────┘  │    │
│  └────────┼───────────┼──────────┼────────────┼────────┘    │
│           │           │          │            │             │
│  ┌────────▼────┐ ┌────▼─────┐   │            │             │
│  │   Routes    │ │ GraphQL  │   │            │             │
│  │ /auth       │ │ Schema & │   │            │             │
│  │ /productos  │ │Resolvers │   │            │             │
│  │ /orders     │ └────┬─────┘   │            │             │
│  │ /users      │      │         │            │             │
│  └──────┬──────┘      │         │            │             │
│         │             │         │            │             │
│  ┌──────▼─────────────▼─────────▼────────────▼────────┐    │
│  │            Business Logic & Models                  │    │
│  │  ┌──────────┬─────────┬───────────┬──────────────┐ │    │
│  │  │ Usuario  │ Producto│   Order   │   Mensaje    │ │    │
│  │  │  Model   │  Model  │   Model   │    Model     │ │    │
│  │  └────┬─────┴────┬────┴─────┬─────┴──────┬───────┘ │    │
│  └───────┼──────────┼──────────┼────────────┼─────────┘    │
└──────────┼──────────┼──────────┼────────────┼──────────────┘
           │          │          │            │
           │          │          │            │
┌──────────▼──────────▼──────────▼────────────▼──────────────┐
│                      MongoDB Database                       │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐ │
│  │ usuarios │productos │  orders  │      mensajes        │ │
│  │          │          │          │                      │ │
│  │ - _id    │ - _id    │ - _id    │ - _id                │ │
│  │ - username│- nombre │ - user   │ - text               │ │
│  │ - email  │ - precio │ - items  │ - username           │ │
│  │ - password│- desc. │ - total  │ - userId             │ │
│  │ - role   │ - dates  │ - status │ - timestamp          │ │
│  │ - orders │          │ - dates  │                      │ │
│  │ - dates  │          │          │                      │ │
│  └──────────┴──────────┴──────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### 1. User Registration & Login Flow
```
User → auth.html → auth.js
                     │
                     ▼
              POST /auth/registro
              POST /auth/login
                     │
                     ▼
              authRoutes.js
                     │
                     ▼
              Usuario Model
                     │
                     ▼
              MongoDB (usuarios)
                     │
                     ▼
              JWT Token Generated
                     │
                     ▼
              Response with token
                     │
                     ▼
              localStorage.setItem('token')
                     │
                     ▼
              Redirect to Productos.html
```

### 2. Shopping Cart & Order Flow
```
User clicks "Añadir" → cart.js → addToCart()
                                      │
                                      ▼
                            localStorage (cart)
                                      │
                                      ▼
User clicks "Finalizar Compra" → checkout()
                                      │
                                      ▼
                            POST /orders
                                      │
                                      ▼
                            ordersRoutes.js
                                      │
                                      ▼
                            Order Model
                                      │
                            ┌─────────┴─────────┐
                            ▼                   ▼
                   MongoDB (orders)    Usuario Model
                                      (add order to history)
                                           │
                                           ▼
                                  clearCart()
                                           │
                                           ▼
                                  Redirect to profile
```

### 3. GraphQL Query Flow
```
Client → POST /graphql
           │
           ▼
    GraphQL Handler
           │
    ┌──────┴──────┐
    ▼             ▼
Schema        Resolvers
    │             │
    └──────┬──────┘
           ▼
    Business Logic
           │
    ┌──────┴──────┐
    ▼             ▼
  Models      MongoDB
    │
    ▼
  Response
    │
    ▼
  Client
```

### 4. Admin Panel Flow
```
Admin User → admin.html → admin.js
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
              GET /users        GET /orders
                     │                 │
              usersRoutes      ordersRoutes
                     │                 │
              Usuario Model     Order Model
                     │                 │
              MongoDB          MongoDB
                     │                 │
              renderUsers()    renderOrders()
                     │                 │
              ┌──────┴─────────────────┘
              ▼
         Admin Dashboard
```

### 5. Real-time Chat Flow
```
User → Chat.html → chat-client.js
                        │
                        ▼
              Socket.IO Connection
              (with JWT auth)
                        │
                        ▼
              Chat Server.js
                        │
                  ┌─────┴─────┐
                  ▼           ▼
            Authenticate  Load History
                  │           │
                  ▼           ▼
            User sends    Mensaje Model
            message            │
                  │           ▼
                  ▼        MongoDB
            io.emit()         │
                  │           │
                  └─────┬─────┘
                        ▼
              All connected clients
              receive message
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Request Flow                          │
└─────────────────────────────────────────────────────────┘

1. User Login
   ┌──────────────┐
   │ POST /auth/  │
   │   login      │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Verify       │
   │ credentials  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Generate JWT │
   │ with user id │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Return token │
   │ to client    │
   └──────────────┘

2. Protected Request
   ┌──────────────┐
   │ Request with │
   │ Auth header  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Middleware:  │
   │ authenticate │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Verify JWT   │
   │ signature    │
   └──────┬───────┘
          │
          ├─── Invalid ──→ 401 Unauthorized
          │
          ▼ Valid
   ┌──────────────┐
   │ Get user     │
   │ from DB      │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Attach user  │
   │ to req       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Check role   │
   │ if needed    │
   └──────┬───────┘
          │
          ├─── Forbidden ──→ 403 Forbidden
          │
          ▼ Authorized
   ┌──────────────┐
   │ Process      │
   │ request      │
   └──────────────┘
```

## 📁 File Relationships

```
backend/
├── graphql/
│   ├── schema.js ──────┐
│   └── resolvers.js ───┼──→ Uses Models
│                       │
├── models/             │
│   ├── Usuario.js ←────┤
│   ├── Producto.js ←───┤
│   └── Order.js ←──────┘
│
├── routes/
│   ├── auth.js ────────→ Uses Usuario Model
│   ├── productos.js ───→ Uses Producto Model
│   ├── orders.js ──────→ Uses Order & Usuario Models
│   └── users.js ───────→ Uses Usuario Model
│
└── middlewares/
    └── auth.js ────────→ Used by all routes

frontend/
├── Chat Server.js ─────→ Main server, imports all routes
├── Productos.html ─────→ Uses main.js, cart.js
├── cart.html ──────────→ Uses cart.js
├── admin.html ─────────→ Uses admin.js
├── user-profile.html ──→ Uses user-profile.js
├── auth.html ──────────→ Uses auth.js
└── Chat.html ──────────→ Uses chat-client.js
```

## 🔄 Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Matrix                        │
├─────────────┬───────────┬──────────┬──────────┬─────────────┤
│ Component   │ Uses REST │ Uses     │ Uses     │ Requires    │
│             │ API       │ GraphQL  │ Socket   │ Auth        │
├─────────────┼───────────┼──────────┼──────────┼─────────────┤
│ auth.js     │ ✓         │ -        │ -        │ -           │
│ main.js     │ ✓         │ -        │ -        │ ✓           │
│ cart.js     │ ✓         │ -        │ -        │ ✓           │
│ admin.js    │ ✓         │ -        │ -        │ ✓ (admin)   │
│ user-       │ ✓         │ -        │ -        │ ✓           │
│ profile.js  │           │          │          │             │
│ chat-       │ -         │ -        │ ✓        │ ✓           │
│ client.js   │           │          │          │             │
└─────────────┴───────────┴──────────┴──────────┴─────────────┘
```

## 📝 Key Features Map

```
Feature                  Frontend            Backend              Database
─────────────────────────────────────────────────────────────────────────
User Registration        auth.html           /auth/registro       usuarios
User Login              auth.html           /auth/login          usuarios
View Products           Productos.html      /productos           productos
Add Product             Productos.html      /productos           productos
Edit Product            Productos.html      /productos/:id       productos
Delete Product          Productos.html      /productos/:id       productos
Shopping Cart           cart.html           LocalStorage         -
Checkout               cart.html           /orders              orders
View Orders            user-profile.html   /orders              orders
Admin Dashboard        admin.html          /users, /orders      usuarios, orders
Manage Users           admin.html          /users               usuarios
Manage Orders          admin.html          /orders              orders
Real-time Chat         Chat.html           Socket.IO            mensajes
GraphQL Queries        -                   /graphql             all collections
GraphQL Mutations      -                   /graphql             all collections
```

## 🎯 Access Control Matrix

```
┌────────────────────┬────────────┬─────────────┐
│ Feature            │ Usuario    │ Admin       │
├────────────────────┼────────────┼─────────────┤
│ View Products      │ ✓          │ ✓           │
│ Add Product        │ ✗          │ ✓           │
│ Edit Product       │ ✗          │ ✓           │
│ Delete Product     │ ✗          │ ✓           │
│ Add to Cart        │ ✓          │ ✓           │
│ Checkout           │ ✓          │ ✓           │
│ View Own Orders    │ ✓          │ ✓           │
│ View All Orders    │ ✗          │ ✓           │
│ Manage Users       │ ✗          │ ✓           │
│ Change User Roles  │ ✗          │ ✓           │
│ Delete Users       │ ✗          │ ✓           │
│ Use Chat           │ ✓          │ ✓           │
│ GraphQL Queries    │ Limited    │ Full        │
│ GraphQL Mutations  │ Limited    │ Full        │
└────────────────────┴────────────┴─────────────┘
```

This architecture supports scalability, maintainability, and clear separation of concerns while maintaining all existing functionality.
