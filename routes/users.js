const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { check } = require("express-validator");
const { asyncHandler, handleValidationErrors } = require("../utils");
const { User } = require('../db/models')
const { getUserToken } = require('../auth')
const validateUsername =
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username");

const validateEmailAndPassword = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
];

// router.post('/',validateUsername,validateEmailAndPassword,handleValidationErrors, asyncHandler(async,(req, res) => {
//  const {username,email,password} = req.body;
//  //todo create user
//  const hashedPassword = await bcrypt.hash(password,10);
//  let user = await User.create({username,email,hashedPassword});
//  const token = getUserToken(user)
//  res.status(201).json({id:user.id},token)
// }));

router.post(
    "/",
    validateUsername,
    validateEmailAndPassword,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, hashedPassword });

      const token = getUserToken(user);
      res.status(201).json({
        user: { id: user.id },
        token,
      });
    })
  );
module.exports = router;
