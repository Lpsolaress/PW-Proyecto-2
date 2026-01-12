const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");
const { authenticate, authorize } = require("../middlewares/auth");

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /productos - Obtener todos los productos (usuarios y administradores)
router.get("/", async (req, res, next) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (err) {
    next(err);
  }
});

// GET /productos/:id - Obtener un producto por ID (usuarios y administradores)
router.get("/:id", async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (err) {
    next(err);
  }
});

// POST /productos - Crear nuevo producto (solo administradores)
router.post("/", authorize("administrador"), async (req, res, next) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
});

// PUT /productos/:id - Actualizar producto (solo administradores)
router.put("/:id", authorize("administrador"), async (req, res, next) => {
  try {
    const actualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
});

// DELETE /productos/:id - Eliminar producto (solo administradores)
router.delete("/:id", authorize("administrador"), async (req, res, next) => {
  try {
    const eliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ mensaje: "Producto eliminado exitosamente" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
