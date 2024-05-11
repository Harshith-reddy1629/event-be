const userSchema = require("../Models/user_schema");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();

const sendMail = require("../mailer");

const inputValidation = (request, response, next) => {
  try {
    const { username, password, email, name } = request.body;

    const errors = {};

    if (!username) {
      errors.username = "Please enter the username";
    }
    if (!name) {
      errors.name = "Please enter the name";
    }
    if (!email) {
      errors.email = "Please enter the email";
    }
    if (!password) {
      errors.password = "Please enter the password";
    }

    if (!username || !password || !email || !name) {
      response.status(400).send(errors);
    } else {
      next();
    }
  } catch (error) {
    response.status(501).send({ error: error.message });
  }
};

const checkUserAndEmail = async (request, response, next) => {
  const { username, password, email, name } = request.body;
  try {
    const existingUser = await userSchema.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const errors = {};

      if (existingUser?.username === username) {
        errors.username = "User already exists with this username";
      }

      if (existingUser?.email === email) {
        errors.email = "User already exists with this email";
      }

      response.status(400).send(errors);
    } else {
      next();
    }
  } catch (error) {
    response.status(501).send({ error: error.message });
  }
};

const passwordStrength = (request, response, next) => {
  try {
    const { password } = request.body;

    if (password?.length > 16 || password?.length < 8) {
      response
        .status(400)
        .send({ password: "password length should be between 8-16" });
    } else {
      next();
    }
  } catch (error) {
    response.status(501).send({ error: error.message });
  }
};

const createUserAndSendMail = async (req, res) => {
  try {
    const { username, name, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const addUser = await userSchema.create({
      username,
      name,
      password: hashedPassword,
      email,
    });

    const mailStatus = await sendMail(
      email,
      "Welcome!",
      `Hi ${addUser.name}
      Please Verify Your Email to Use Event Services, Click here https://event-ashy-omega.vercel.app/verification/${addUser.verificationId}`
    );
    console.log(mailStatus);
    if (mailStatus) {
      res.status(200).send(addUser);
    } else {
      res.status(400).send({ error: "failed to send mail but created user" });
    }
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

const VerifyMail = async (req, res) => {
  try {
    const { id } = req.params;

    const findIdAndVerify = await userSchema.findOneAndUpdate(
      { verificationId: id, isVerified: false },
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );

    if (findIdAndVerify) {
      res.status(200).send(findIdAndVerify);
    } else {
      res.status(404).send({ error: "Invalid Request or Already Verified" });
    }
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUserWithMail = await userSchema.findOne({ email });

    if (findUserWithMail) {
      const isValidPassword = await bcrypt.compare(
        password,
        findUserWithMail.password
      );

      if (isValidPassword) {
        const { username, name, isVerified } = findUserWithMail;

        if (isVerified) {
          const payload = { email, username, name };

          const generateToken = jwt.sign(payload, process.env.MY_SECRET_TOKEN);

          res.status(200).send({ token: generateToken });
        } else {
          res.status(403).send({ error: "User is not verified" });
        }
      } else {
        res.status(400).send({ password: "Invalid email or password" });
      }
    } else {
      res.status(404).send({ email: "Invalid email address" });
    }
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

const resendVerificationMail = async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      const findEmail = await userSchema.findOne({ email });

      if (findEmail) {
        if (!findEmail.isVerified) {
          const mailStatus = await sendMail(
            email,
            "Resend verification",
            `Hi ${findEmail.name}, 
             Please Verify Your Email to Use Event Services, Click here https://event-ashy-omega.vercel.app/verification/${findEmail.verificationId}`
          );
          if (mailStatus) {
            res.status(200).send({ message: "Mail sent" });
          } else {
            res
              .status(400)
              .send({ error: "failed to send mail Check mail address" });
          }
        } else {
          res.status(400).send({ error: "Already Verified" });
        }
      } else {
        res.status(404).send({ error: "Couldn't find your mail address" });
      }
    } else {
      res.status(400).send({ error: "Please Enter Valid Email address" });
    }
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

module.exports = {
  inputValidation,
  checkUserAndEmail,
  passwordStrength,
  createUserAndSendMail,
  VerifyMail,
  loginUser,
  resendVerificationMail,
};
