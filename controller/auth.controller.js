const { User, Department } = require("../models");
class AuthController {
  constructor() {
    this.validation = require("../validations/auth.validation");
    this.jwt = require("jsonwebtoken");
    this.messages = require("../messages/auth.messages");
    this.helpers = require("../helpers/helper");
    this.Op = require("sequelize").Op;
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
        let user = await User.findOne({ where: { email, password } });

        // if enter password is wrong
        if (!user) {
          return res.status(401).send({ message: this.messages.allMessages.LOG_IN_UNAUTHORIZED });
        }

        // Generate a Access token for authentication
        const accessToken = this.jwt.sign(
          {
            email: user.email,
            user_id: user.id,
            user_name: `${user.first_name} ${user.last_name}`,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME }
        );

        // Login Successfully
        return res.status(200).send({
          status: true,
          message: this.messages.allMessages.LOG_IN_SUCCESS,
          data: {
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              user_code: user.user_code,
            },
          },
          // JWT access token
          accessToken,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).send({
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
          where: { department_name, }
        })
        const userObj = { first_name, last_name, email, password, department_id: department.id };

        // Generate user code
        const userCode = await this.helpers.generateUserCode();
        userObj.user_code = userCode;

        // if entered email exists
        let existingUser = await User.findOne({
          where: {
            [this.Op.or]: [
              { email: email },
              { user_code: userCode },
            ],
          },
        });
        // if enter password is wrong
        if (existingUser) {
          return res.status(401).send({ status: false, message: this.messages.allMessages.USER_ALREADY_EXIST });
        }

        // Create new user
        let user = await User.create(userObj);
        return res.status(200).send({
          status: true,
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
        return res.status(500).send({
          status: false,
          message: this.messages.allMessages.SIGN_UP_FAILED,
        });
      }
    };
  }
}

module.exports = new AuthController();
