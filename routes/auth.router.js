const express = require("express");
const {
  createUser,
  revalidarToken,
  loginUsuario,
  createUser2,
  getUser,
  updateUser,
} = require("../controllers/auth.controller");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validar-campos");
const { validatJWT } = require("../middlewares/validar-jwt");
const router = express.Router();

router.post(
  "/register",
  [
    check("name", "El nombre de usuario es obligatorio").not().isEmpty(),
    check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener al menos 6 caracteres")
    .matches(/[A-Z]/)
    .withMessage("El password debe contener al menos una mayúscula")
    .matches(/[a-z]/)
    .withMessage("El password debe contener al menos una minúscula")
    .matches(/[0-9]/)
    .withMessage("El password debe contener al menos un número"),
    validarCampos,
  ],
  createUser2
);

router.post(
  "/",
  [
    check("name", "El nombre de usuario es obligatorio").not().isEmpty(),
    check("password"),
    validarCampos,
  ],
  loginUsuario
);

router.get("/renew", validatJWT, revalidarToken);

router.get('/:name', getUser) // user with username


// router.put('/updateuser/:id',updateUser)
router.put('/updateuser',updateUser)
module.exports = router;
