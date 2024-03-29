const express = require("express");
const router = express.Router();
const { Movie, validateMovie } = require("../models/movie");
const { Genre } = require("../models/genre");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateId = require("../middlewares/validateId");

router.get("/", async (req, res) => {
  const movies = await Movie.find();
  res.send(movies);
});

router.get("/count", async (req, res) => {
  const { genreName, title } = req.query;
  let query = {};
  if (genreName) {
    query["genre.name"] = genreName;
  }
  if (title) {
    query["title"] = new RegExp(`^${title}`, "i");
  }
  const totalMovies = await Movie.find(query).countDocuments();
  res.send({ totalMovies });
});

router.post("/pfs", async (req, res) => {
  //pagination filtering & sorting
  const { currentPage, pageSize, genreName, title, sortColumn } = req.body;
  let query = {};
  const { path, order } = sortColumn;
  if (genreName) {
    query["genre.name"] = genreName;
  }
  if (title) {
    query["title"] = new RegExp(`^${title}`, "i");
  }
  let skip = (currentPage - 1) * pageSize;
  const movies = await Movie.find(query)
    .limit(pageSize)
    .skip(skip)
    .sort({ [path]: order });
  res.send(movies);
});

router.get("/:id", auth, validateId, async (req, res) => {
  const movies = await Movie.findById(req.params.id);
  if (!movies) return res.status(404).send("Movie with given id is not found.");
  res.send(movies);
});

router.post("/", async (req, res) => {
  const validation = validateMovie(req.body);
  if (!validation) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Genre is not found");
  // console.log(genre)

  const { title, numberInStock, dailyRentalRate, liked } = req.body;
  const movies = new Movie({
    title,
    numberInStock,
    dailyRentalRate,
    liked,
    genre: {
      name: genre.name,
      _id: genre._id,
    },
  });
  await movies.save();
  res.send(movies);
});

router.put("/:id", auth, async (req, res) => {
  const validation = validateMovie(req.body);
  if (!validation) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Genre is not found");

  const { title, numberInStock, dailyRentalRate, liked } = req.body;
  const movies = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title,
      numberInStock,
      dailyRentalRate,
      liked,
      genre: {
        name: genre.name,
        _id: genre._id,
      },
    },
    { new: true }
  );
  if (!movies) return res.status(404).send("Movie with given id is not found.");
  res.send(movies);
});

router.patch("/:id", validateId, async (req, res) => {
  let movie = await Movie.findById(req.params.id);
  console.log(movie);
  if (!movie) return res.status(404).send("Movie with given id is not found.");

  const isLiked = !movie.liked;

  let newMoive = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      $set: { liked: isLiked },
    },
    { new: true }
  );
  if (!newMoive) {
    return res.status(404).send("Movie with given id is not found.");
  }
  console.log(newMoive);
  res.send(newMoive);
});

router.delete("/:id", admin, auth, validateId, async (req, res) => {
  const movies = await Movie.findByIdAndDelete(req.params.id);

  if (!movies) return res.status(403).send("Movie with given id is not found.");
  res.send(movies);
});

module.exports = router;
