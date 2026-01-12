const Producto = require('../models/Producto');
const Order = require('../models/Order');
const Usuario = require('../models/Usuario');

const resolvers = {
  // Query resolvers
  products: async () => {
    try {
      return await Producto.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching products: ' + error.message);
    }
  },

  product: async ({ id }) => {
    try {
      return await Producto.findById(id);
    } catch (error) {
      throw new Error('Error fetching product: ' + error.message);
    }
  },

  orders: async () => {
    try {
      return await Order.find()
        .populate('user')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching orders: ' + error.message);
    }
  },

  order: async ({ id }) => {
    try {
      return await Order.findById(id).populate('user');
    } catch (error) {
      throw new Error('Error fetching order: ' + error.message);
    }
  },

  ordersByUser: async ({ userId }) => {
    try {
      return await Order.find({ user: userId })
        .populate('user')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching user orders: ' + error.message);
    }
  },

  ordersByStatus: async ({ status }) => {
    try {
      return await Order.find({ status })
        .populate('user')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching orders by status: ' + error.message);
    }
  },

  users: async () => {
    try {
      return await Usuario.find().select('-password').sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  },

  user: async ({ id }) => {
    try {
      return await Usuario.findById(id)
        .select('-password')
        .populate('orders');
    } catch (error) {
      throw new Error('Error fetching user: ' + error.message);
    }
  },

  // Mutation resolvers
  createProduct: async ({ input }) => {
    try {
      const newProduct = new Producto(input);
      return await newProduct.save();
    } catch (error) {
      throw new Error('Error creating product: ' + error.message);
    }
  },

  updateProduct: async ({ id, input }) => {
    try {
      const updated = await Producto.findByIdAndUpdate(id, input, { new: true });
      if (!updated) {
        throw new Error('Product not found');
      }
      return updated;
    } catch (error) {
      throw new Error('Error updating product: ' + error.message);
    }
  },

  deleteProduct: async ({ id }) => {
    try {
      const deleted = await Producto.findByIdAndDelete(id);
      return !!deleted;
    } catch (error) {
      throw new Error('Error deleting product: ' + error.message);
    }
  },

  createOrder: async ({ input }, context) => {
    try {
      // Get user from context (authenticated user)
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const newOrder = new Order({
        user: context.user.id,
        items: input.items,
        total: input.total,
        status: 'pendiente'
      });

      const savedOrder = await newOrder.save();

      // Add order to user's order history
      await Usuario.findByIdAndUpdate(
        context.user.id,
        { $push: { orders: savedOrder._id } }
      );

      return await Order.findById(savedOrder._id).populate('user');
    } catch (error) {
      throw new Error('Error creating order: ' + error.message);
    }
  },

  updateOrderStatus: async ({ id, status }) => {
    try {
      const updated = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('user');

      if (!updated) {
        throw new Error('Order not found');
      }
      return updated;
    } catch (error) {
      throw new Error('Error updating order status: ' + error.message);
    }
  },

  updateUserRole: async ({ id, role }) => {
    try {
      // Validate role
      if (!['usuario', 'administrador'].includes(role)) {
        throw new Error('Invalid role. Must be "usuario" or "administrador"');
      }

      const updated = await Usuario.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password');

      if (!updated) {
        throw new Error('User not found');
      }
      return updated;
    } catch (error) {
      throw new Error('Error updating user role: ' + error.message);
    }
  },

  deleteUser: async ({ id }) => {
    try {
      const deleted = await Usuario.findByIdAndDelete(id);
      return !!deleted;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
};

module.exports = resolvers;
