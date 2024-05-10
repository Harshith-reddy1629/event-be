const Router = require("express").Router();

const {
  inputValidation,
  checkUserAndEmail,
  passwordStrength,
  createUserAndSendMail,
  VerifyMail,
  loginUser,
} = require("../middlewares/user-middlewares");

Router.post(
  "/register-user",
  inputValidation,
  checkUserAndEmail,
  passwordStrength,
  createUserAndSendMail
);

Router.get("/verify/:id", VerifyMail);

Router.post("/login", loginUser);

module.exports = Router;
