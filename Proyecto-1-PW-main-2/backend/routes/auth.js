const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Función para generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d" // El token expira en 7 días
  });
};

// POST /auth/registro - Registrar nuevo usuario
router.post("/registro", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Por favor proporciona username, email y password."
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      $or: [{ email }, { username }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: "El usuario o email ya está registrado."
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      username,
      email,
      password,
      role: role || "usuario" // Por defecto es "usuario"
    });

    await nuevoUsuario.save();

    // Generar token
    const token = generarToken(nuevoUsuario._id);

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login - Iniciar sesión
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: "Por favor proporciona email y password."
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({
        error: "Credenciales inválidas."
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);

    if (!passwordValida) {
      return res.status(401).json({
        error: "Credenciales inválidas."
      });
    }

    // Generar token
    const token = generarToken(usuario._id);

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/perfil - Obtener perfil del usuario autenticado
router.get("/perfil", async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Acceso denegado. Token no proporcionado."
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id).select("-password");

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado."
      });
    }

    res.json({ usuario });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado." });
    }
    next(error);
  }
});

module.exports = router;
