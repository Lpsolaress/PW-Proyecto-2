const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { authenticate, authorize } = require('../middlewares/auth');

// Middleware: todas las rutas requieren autenticación de admin
router.use(authenticate);
router.use(authorize('administrador'));

// GET /users - Obtener todos los usuarios
router.get('/', async (req, res, next) => {
  try {
    const users = await Usuario.find()
      .select('-password')
      .populate('orders')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /users/:id - Obtener un usuario por ID
router.get('/:id', async (req, res, next) => {
  try {
    const user = await Usuario.findById(req.params.id)
      .select('-password')
      .populate('orders');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /users/:id/role - Actualizar rol de usuario
router.put('/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!role || !['usuario', 'administrador'].includes(role)) {
      return res.status(400).json({ 
        error: 'Rol inválido. Debe ser "usuario" o "administrador"' 
      });
    }
    
    const updated = await Usuario.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id - Eliminar usuario
router.delete('/:id', async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.usuario._id.toString()) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta' 
      });
    }
    
    const deleted = await Usuario.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
