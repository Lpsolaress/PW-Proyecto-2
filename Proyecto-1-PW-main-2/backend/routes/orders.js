const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Usuario = require('../models/Usuario');
const { authenticate, authorize } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST /orders - Crear un nuevo pedido
router.post('/', async (req, res, next) => {
  try {
    const { items, total } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Los items del pedido son requeridos' 
      });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({ 
        error: 'El total del pedido debe ser mayor a 0' 
      });
    }
    
    const newOrder = new Order({
      user: req.usuario._id,
      items,
      total,
      status: 'pendiente'
    });
    
    const savedOrder = await newOrder.save();
    
    // Agregar pedido al historial del usuario
    await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { $push: { orders: savedOrder._id } }
    );
    
    const populatedOrder = await Order.findById(savedOrder._id).populate('user');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
});

// GET /orders - Obtener pedidos (todos para admin, propios para usuario)
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    // Si no es admin, solo ver sus propios pedidos
    if (req.usuario.role !== 'administrador') {
      query.user = req.usuario._id;
    }
    
    // Filtrar por status si se proporciona
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', '-password')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /orders/:id - Obtener un pedido específico
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', '-password');
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Si no es admin, solo puede ver sus propios pedidos
    if (req.usuario.role !== 'administrador' && 
        order.user._id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        error: 'No tienes permiso para ver este pedido' 
      });
    }
    
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PUT /orders/:id/status - Actualizar estado del pedido (solo admin)
router.put('/:id/status', authorize('administrador'), async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pendiente', 'completado'].includes(status)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Debe ser "pendiente" o "completado"' 
      });
    }
    
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', '-password');
    
    if (!updated) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
