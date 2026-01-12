# GraphQL API Documentation

## Endpoint
```
POST http://localhost:3000/graphql
```

## Authentication
Para operaciones que requieren autenticación, incluir el token JWT en el header:
```
Authorization: Bearer <token>
```

---

## Schema

### Types

#### Product
```graphql
type Product {
  _id: ID!
  nombre: String!
  precio: Float!
  descripcion: String!
  createdAt: String
  updatedAt: String
}
```

#### User
```graphql
type User {
  _id: ID!
  username: String!
  email: String!
  role: String!
  orders: [Order]
  createdAt: String
  updatedAt: String
}
```

#### Order
```graphql
type Order {
  _id: ID!
  user: User!
  items: [OrderItem!]!
  total: Float!
  status: String!
  createdAt: String
  updatedAt: String
}
```

#### OrderItem
```graphql
type OrderItem {
  product: ID!
  name: String!
  price: Float!
  quantity: Int!
}
```

---

## Queries

### 1. Obtener todos los productos
```graphql
query {
  products {
    _id
    nombre
    precio
    descripcion
    createdAt
    updatedAt
  }
}
```

**Ejemplo de respuesta:**
```json
{
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Producto 1",
        "precio": 29.99,
        "descripcion": "Descripción del producto",
        "createdAt": "2024-01-12T10:00:00.000Z",
        "updatedAt": "2024-01-12T10:00:00.000Z"
      }
    ]
  }
}
```

### 2. Obtener un producto por ID
```graphql
query {
  product(id: "507f1f77bcf86cd799439011") {
    _id
    nombre
    precio
    descripcion
  }
}
```

### 3. Obtener todos los pedidos
**Requiere autenticación de administrador**
```graphql
query {
  orders {
    _id
    user {
      username
      email
    }
    items {
      name
      price
      quantity
    }
    total
    status
    createdAt
  }
}
```

### 4. Obtener pedidos por usuario
**Requiere autenticación**
```graphql
query {
  ordersByUser(userId: "507f1f77bcf86cd799439012") {
    _id
    items {
      name
      price
      quantity
    }
    total
    status
    createdAt
  }
}
```

### 5. Obtener pedidos por estado
**Requiere autenticación de administrador**
```graphql
query {
  ordersByStatus(status: "pendiente") {
    _id
    user {
      username
    }
    total
    createdAt
  }
}
```

### 6. Obtener todos los usuarios
**Requiere autenticación de administrador**
```graphql
query {
  users {
    _id
    username
    email
    role
    createdAt
  }
}
```

### 7. Obtener un usuario por ID
**Requiere autenticación de administrador**
```graphql
query {
  user(id: "507f1f77bcf86cd799439012") {
    _id
    username
    email
    role
    orders {
      _id
      total
      status
    }
  }
}
```

---

## Mutations

### 1. Crear un producto
**Requiere autenticación de administrador**
```graphql
mutation {
  createProduct(input: {
    nombre: "Nuevo Producto"
    precio: 49.99
    descripcion: "Descripción del nuevo producto"
  }) {
    _id
    nombre
    precio
    descripcion
  }
}
```

### 2. Actualizar un producto
**Requiere autenticación de administrador**
```graphql
mutation {
  updateProduct(
    id: "507f1f77bcf86cd799439011"
    input: {
      nombre: "Producto Actualizado"
      precio: 59.99
      descripcion: "Nueva descripción"
    }
  ) {
    _id
    nombre
    precio
    descripcion
  }
}
```

### 3. Eliminar un producto
**Requiere autenticación de administrador**
```graphql
mutation {
  deleteProduct(id: "507f1f77bcf86cd799439011")
}
```

**Respuesta:**
```json
{
  "data": {
    "deleteProduct": true
  }
}
```

### 4. Crear un pedido
**Requiere autenticación**
```graphql
mutation {
  createOrder(input: {
    items: [
      {
        product: "507f1f77bcf86cd799439011"
        name: "Producto 1"
        price: 29.99
        quantity: 2
      }
    ]
    total: 59.98
  }) {
    _id
    user {
      username
    }
    items {
      name
      quantity
      price
    }
    total
    status
    createdAt
  }
}
```

### 5. Actualizar estado de pedido
**Requiere autenticación de administrador**
```graphql
mutation {
  updateOrderStatus(
    id: "507f1f77bcf86cd799439013"
    status: "completado"
  ) {
    _id
    status
    user {
      username
    }
  }
}
```

### 6. Actualizar rol de usuario
**Requiere autenticación de administrador**
```graphql
mutation {
  updateUserRole(
    id: "507f1f77bcf86cd799439012"
    role: "administrador"
  ) {
    _id
    username
    role
  }
}
```

### 7. Eliminar usuario
**Requiere autenticación de administrador**
```graphql
mutation {
  deleteUser(id: "507f1f77bcf86cd799439012")
}
```

---

## Ejemplos de uso con cURL

### Consulta simple
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products { _id nombre precio } }"}'
```

### Consulta con autenticación
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "{ orders { _id total status } }"}'
```

### Mutación con variables
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation CreateProduct($input: ProductInput!) { createProduct(input: $input) { _id nombre precio } }",
    "variables": {
      "input": {
        "nombre": "Producto desde cURL",
        "precio": 39.99,
        "descripcion": "Creado con cURL"
      }
    }
  }'
```

---

## Ejemplos de uso con JavaScript (fetch)

### Consulta productos
```javascript
const query = `
  query {
    products {
      _id
      nombre
      precio
      descripcion
    }
  }
`;

fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query })
})
  .then(res => res.json())
  .then(data => console.log(data.data.products));
```

### Crear pedido (con autenticación)
```javascript
const mutation = `
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      _id
      total
      status
    }
  }
`;

const variables = {
  input: {
    items: [
      {
        product: "507f1f77bcf86cd799439011",
        name: "Producto 1",
        price: 29.99,
        quantity: 2
      }
    ],
    total: 59.98
  }
};

const token = localStorage.getItem('token');

fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ query: mutation, variables })
})
  .then(res => res.json())
  .then(data => console.log(data.data.createOrder));
```

---

## Notas importantes

1. **Autenticación**: Todas las operaciones que modifican datos o acceden a información sensible requieren autenticación mediante JWT.

2. **Roles**: 
   - Usuario regular: Puede crear pedidos y ver sus propios pedidos
   - Administrador: Acceso completo a todas las operaciones

3. **Estados de pedido**: Los pedidos pueden tener dos estados:
   - `pendiente`: Pedido recién creado
   - `completado`: Pedido procesado y completado

4. **Validaciones**: El servidor validará todos los datos de entrada según el schema definido.

5. **Errores**: Los errores se devolverán en el formato estándar de GraphQL:
```json
{
  "errors": [
    {
      "message": "Error message here"
    }
  ]
}
```
