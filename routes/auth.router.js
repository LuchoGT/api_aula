const express = require("express");
const { createUser, revalidarToken, loginUsuario } = require("../controllers/auth.controller");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validar-campos");
const { validatJWT } = require("../middlewares/validar-jwt");
const router = express.Router();

router.post("/register",
[
    check('name','El nombre de usuario es obligatorio').not().isEmpty(),
    check('password','El password debe de ser de 6 caracteres').isLength({min:6}),
    validarCampos
],
createUser);

router.post("/", 
[
    check('name','El nombre de usuario es obligatorio').not().isEmpty(),
    check('password','El password debe de ser de 6 caracteres').isLength({min:6}),
    validarCampos
],
loginUsuario);

router.get('/renew',
validatJWT,
 revalidarToken
);

module.exports = router;