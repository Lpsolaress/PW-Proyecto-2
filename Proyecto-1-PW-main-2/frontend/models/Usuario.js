const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El nombre de usuario es requerido"],
    unique: true,
    trim: true,
    minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"]
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Email inválido"]
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"]
  },
  role: {
    type: String,
    enum: {
      values: ["usuario", "administrador"],
      message: "El rol debe ser 'usuario' o 'administrador'"
    },
    default: "usuario"
  }
}, {
  timestamps: true
});

// Middleware para hashear la contraseña antes de guardar
usuarioSchema.pre("save", async function() {
  // Solo hashear si la contraseña ha sido modificada
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// No devolver la contraseña en las consultas por defecto
usuarioSchema.methods.toJSON = function() {
  const usuario = this.toObject();
  delete usuario.password;
  return usuario;
};

module.exports = mongoose.model("Usuario", usuarioSchema);
