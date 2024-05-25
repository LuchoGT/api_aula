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

// const getUser=(req,res)=>{

//   const { name } = req.params;

//   try {

//       if(!name) return res.status(501).send({ error: "Invalid name"});

//       Usuario.findOne({ name }, function(err, user){
//           if(err) return res.status(500).send({ err });
//           if(!user) return res.status(501).send({ error : "Couldn't Find the User"});

//           /** remove password from user */
//           // mongoose return unnecessary data with object so convert it into json
//           const { password, ...rest } = Object.assign({}, user.toJSON());

//           return res.status(201).send(rest);
//       })

//   } catch (error) {
//       return res.status(404).send({ error : "Cannot Find User Data"});
//   }

// }

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

const updateUser2 = async (req, res = response) => {
 
  // const {id} = req.params;
  // const body = req.body;

  // res.json({
  //   ok:true,
  //   msg:"Update user",
  //   data:body,
  //   id,
  // })

  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // Actualizar los datos del usuario
      Usuario.updateOne({ _id: userId }, body, async function (err, data) {
        if (err) throw err;

        // Generar un nuevo token JWT con los datos actualizados del usuario
        const token = await generarJWT(userId, body.name); // Puedes ajustar los datos según lo que necesites

        return res.status(201).send({ msg: "Record Updated...!", token });
      });

    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }

  } catch (error) {
    return res.status(401).send({ error });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params; // Supongo que el userId se pasa como parámetro en la URL
  const { name, password, profile, email } = req.body;

  try {
    // Verificar que el usuario exista
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }

    // Actualizar los campos necesarios
    if (name) {
      user.name = name;
    }
    // if (password) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   user.password = hashedPassword;
    // }
    if (profile) {
      user.profile = profile;
    }
    if (email) {
      user.email = email;
    }

    // Guardar los cambios en la base de datos
    await user.save();

    // Generar un nuevo token JWT
    const token = await generarJWT(user._id, user.name);

    return res.status(200).send({
      msg: 'Usuario actualizado exitosamente',
      name: user.name,
      token
    });
  } catch (error) {
    return res.status(500).send({ error: 'Error al actualizar el usuario' });
  }
};
module.exports = {
  createUser,
  loginUsuario,
  revalidarToken,
  createUser2,
  getUser,
  updateUser
};
