const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Middleware para verificar el token JWT
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Acceso denegado. No se proporcionó token de autenticación."
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id).select("-password");

    if (!usuario) {
      return res.status(401).json({
        error: "Token inválido. Usuario no encontrado."
      });
    }

    // Agregar el usuario al request para usarlo en las rutas
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado." });
    }
    return res.status(500).json({ error: "Error en la autenticación." });
  }
};

// Middleware para verificar roles de usuario
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: "Debe estar autenticado para acceder a este recurso."
      });
    }

    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(" o ")}.`
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
