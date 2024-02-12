const { User, Department } = require("../models");
class AuthController {
  constructor() {
    this.validation = require("../validations/auth.validation");
    this.jwt = require("jsonwebtoken");
    this.messages = require("../messages/auth.messages");
    require("dotenv").config();
  }
  loginUser = async (req, res) => {
    let auth_validation = this.validation.authValidation.validate(req.body);
    if (auth_validation.error) {
      res.status(403).send({
        status: false,
        message: auth_validation.error.details[0].message,
      });
    } else {
      const { email, password } = req.body;
      try {
        // if entered email exists
        let user = await User.findOne({ email, password });
        // if enter password is wrong
        if (!user) {
          return res
            .status(401)
            .send({ message: this.messages.allMessages.LOG_IN_UNAUTHORIZED });
        }

        // Generate a Access token for authentication
        const accessToken = this.jwt.sign(
          {
            email: user.email,
            user_id: user.id,
            users_name: `${user.first_name}`,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME }
        );
        // Login Successfully
        return res.status(200).send({
          message: this.messages.allMessages.LOG_IN_SUCCESS,
          data: {
            // user details
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
            },
          },
          // JWT access token
          accessToken,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          status: false,
          message: this.messages.allMessages.LOG_IN_FAILED,
        });
      }
    }
  };

  signupUser = async (req, res) => {
    let signup_validation = this.validation.signUpValidation.validate(req.body);
    if (signup_validation.error) {
      res.status(403).send({
        status: false,
        message: signup_validation.error.details[0].message,
      });
    } else {
      try {
        const { first_name, last_name, email, password, department_name } = req.body;
        const department = await Department.findOne({
          department_name,
        })
        const userObj = { first_name, last_name, email, password, department_id: department.id };

        // if entered email exists
        let existingUser = await User.findOne({ where: { email } });
        console.log(existingUser, email);
        // if enter password is wrong
        if (existingUser) {
          return res.status(401).send({ message: this.messages.allMessages.USER_ALREADY_EXIST });
        }

        // Create new user
        let user = await User.create(userObj);
        return res.status(200).send({
          message: this.messages.allMessages.SIGN_UP_SUCCESS,
          data: {
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
            },
          },
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          status: false,
          message: this.messages.allMessages.SIGN_UP_FAILED,
        });
      }
    };
  }
}

module.exports = new AuthController();
