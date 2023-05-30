const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) throw new Error(error.message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) res.status(404).json("Invalid email");

  //log in validation
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (isValid) {
    const token = user.getAuthToken();
    res.status(200).send(token);
  } else res.status(401).json("Invalid password");
});

function validate(input) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(input);
}

module.exports = router;
