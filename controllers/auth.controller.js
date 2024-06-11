const { response } = require("express");
const Usuario = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { generarJWT } = require("../helpers/jwt");

const createUser = async (req, res = response) => {
  const { name, password } = req.body;

  try {
    let usuario = await Usuario.findOne({ name });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un usuario con ese nombre",
      });
    }
    usuario = new Usuario(req.body);

    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    const token = await generarJWT(usuario.id, usuario.name);

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Pls hable con el admin",
    });
  }
};

const createUser2 = async (req, res) => {
  try {
    const { name, password, profile } = req.body;

    // Verificar si el nombre de usuario ya existe
    const userExists = await Usuario.findOne({ name });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "Ya existe un usuario con ese nombre de usuario" });
    }

    usuario = new Usuario(req.body);
    // Hashear la contraseña
    const salt = bcrypt.genSaltSync();

    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    const token = await generarJWT(usuario.id, usuario.name);

    return res.status(201).json({
      msg: "User registered successfully",
      uid: usuario.id,
      name: usuario.name,
      profile: profile || "",
      token,
    });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({
      ok: false,
      msg: "Pls hable con el admin",
    });
  }
};

const loginUsuario = async (req, res = response) => {
  const { name, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ name });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario no existe con ese name",
      });
    }

    // Confirmar los passwords
    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Password incorrecto",
      });
    }

    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.name);

    res.json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const revalidarToken = async (req, res = response) => {
  // const uid = req.uid;
  // const username= req.name;

  const { uid, name } = req;

  //Generar un nuevo JWT y retornarlo en esta peticion

  const token = await generarJWT(uid, name);

  res.json({
    ok: true,
    uid,
    name,
    token,
  });
};


const getUser = async (req, res) => {
  const { name } = req.params;

  try {
    if (!name) {
      return res.status(400).json({ error: "Invalid name" });
    }

    const user = await Usuario.findOne({ name });
    if (!user) {
      return res.status(404).json({ error: "Couldn't Find the User" });
    }

    // Remover la contraseña del objeto usuario
    const { password, ...rest } = user.toObject();

    return res.status(200).json({
      ok: "Usuario encontrado",
      uid: user.id,
      name: user.name,
    });
  } catch (error) {
    return res.status(500).json({ error: "Cannot Find User Data" });
  }
};

const updateUser=async (req, res) => {
  const { userId, ...updateData } = req.body;
  try {
    const user = await Usuario.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) return res.status(404).send({ error: "User not found" });
    res.status(200).send({ msg: "User updated successfully", user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
module.exports = {
  createUser,
  loginUsuario,
  revalidarToken,
  createUser2,
  getUser,
  updateUser
};
