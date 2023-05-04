const express = require("express");
const router = express.Router();
const { Genre, validateGenre } = require("../models/genre");
const { validateUser } = require("../models/user");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateId = require("../middlewares/validateId");
const error = require("../middlewares/error");
const verifyToken = require("../middlewares/auth");

router.get("/", async (req, res, next) => {
  const genres = await Genre.find();
  res.send(genres);
});

router.get("/:id", auth, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre with given id is not found.");
  res.send(genre);
});

router.post("/", async (req, res) => {
  const validation = validateGenre(req.body);
  if (!validation)
    return res.status(400).send(validation.error.details[0].message);
  const genre = new Genre({ name: req.body.name });
  await genre.save();
  res.send(genre);
});

router.put("/:id", auth, async (req, res) => {
  const validation = validateGenre(req.body);
  if (!validation) return res.status(400).send(validation.error);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) return res.status(404).send("Genre with given id is not found.");
  res.send(genre);
});

router.delete("/:id", admin,auth, async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre) return res.status(403).send("Genre with given id is not found.")
  res.send(genre)

});

module.exports = router;
