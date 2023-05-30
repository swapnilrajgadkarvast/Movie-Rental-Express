const express = require("express");
const router = express.Router();
const { Customer, validateCustomer } = require("../models/customer");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateId = require("../middlewares/validateId");

router.get("/", async (req, res) => {
  const customers = await Customer.find();
  res.send(customers);
});

router.get("/:id", auth, async (req, res) => {
  const customers = await Customer.findById(req.params.id);
  if (!customers)
    return res.status(404).send("Customer with given id is not found.");
  res.send(customers);
});

router.post("/", async (req, res) => {
  const validation = validateCustomer(req.body);
  if (!validation)
    return res.status(400).send(validation.error.details[0].message);
  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });
  await customer.save();
  res.send(customer);
});

router.put("/:id", auth, async (req, res) => {
  const validation = validateCustomer(req.body);
  if (!validation) return res.status(400).send(validation.error);

  const customers = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { phone: req.body.phone },
    { isGold: req.body.isGold },
    { new: true }
  );

  if (!customers)
    return res.status(404).send("Customer with given id is not found.");
  res.send(customers);
});

router.delete("/:id", auth, admin, validateId, async (req, res) => {
  const customers = await Customer.findByIdAndDelete(req.params.id);

  if (!customers)
    return res.status(403).send("Customer with given id is not found.");
  res.send(customers);
});

module.exports = router;
