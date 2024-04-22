const {response} = require("express");
const Usuario = require("../models/user.model");
const bcrypt = require('bcryptjs');
const {generarJWT} = require('../helpers/jwt')

const createUser = async(req,res =response)=>{

   
  const { name, password } = req.body;

  try {

    let usuario = await Usuario.findOne({name});

    if (usuario) {
      res.status(400).json({
        ok: false,
        msg: 'Ya existe un usuario con ese nombre',
      });
    }
    usuario = new Usuario(req.body);


    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);


    await usuario.save();

    const token = await generarJWT(usuario.id, usuario.name);


    res.status(201).json({
      ok: true,
      uid:usuario.id,
      name:usuario.name,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Pls hable con el admin',
    });
  }
   
}

const loginUsuario = async(req, res = response ) => {
  const { name, password } = req.body;

    try {
        
        const usuario = await Usuario.findOne({ name });

        if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese name'
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        // Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

const revalidarToken = async(req, res = response) => {

  // const uid = req.uid;
  // const username= req.name;

  const {uid,name} = req;

  //Generar un nuevo JWT y retornarlo en esta peticion

  const token = await generarJWT(uid,name);

  res.json({
      ok:true,
      uid,name,
      token,
  })
};

module.exports = {
    createUser,
    loginUsuario,
    revalidarToken
}