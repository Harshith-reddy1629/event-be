const Router = require("express").Router();

const {
  inputValidation,
  checkUserAndEmail,
  passwordStrength,
  createUserAndSendMail,
  VerifyMail,
  loginUser,
  resendVerificationMail,
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

Router.post("/resend-mail", resendVerificationMail);

module.exports = Router;
