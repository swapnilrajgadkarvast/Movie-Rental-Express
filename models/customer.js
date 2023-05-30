const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    minlength: 5,
    isrequired: true,
  },
  phone: {
    type: String,
    maxlength: 10,
    minlength: 7,
    isrequired: true,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});

const Customer = mongoose.model("Customer", customerSchema);
function validateCustomer(input) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(7).max(10).required(),
    isGold: Joi.boolean().required(),
  });
  return schema.validate(input);
}

module.exports = { Customer, validateCustomer };
