const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Product {
    _id: ID!
    nombre: String!
    precio: Float!
    descripcion: String!
    createdAt: String
    updatedAt: String
  }

  type OrderItem {
    product: ID!
    name: String!
    price: Float!
    quantity: Int!
  }

  type Order {
    _id: ID!
    user: User!
    items: [OrderItem!]!
    total: Float!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    role: String!
    orders: [Order]
    createdAt: String
    updatedAt: String
  }

  input ProductInput {
    nombre: String!
    precio: Float!
    descripcion: String!
  }

  input OrderItemInput {
    product: ID!
    name: String!
    price: Float!
    quantity: Int!
  }

  input OrderInput {
    items: [OrderItemInput!]!
    total: Float!
  }

  type Query {
    # Product queries
    products: [Product!]!
    product(id: ID!): Product

    # Order queries
    orders: [Order!]!
    order(id: ID!): Order
    ordersByUser(userId: ID!): [Order!]!
    ordersByStatus(status: String!): [Order!]!

    # User queries
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    # Product mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Order mutations
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!

    # User mutations
    updateUserRole(id: ID!, role: String!): User!
    deleteUser(id: ID!): Boolean!
  }
`);

module.exports = schema;
