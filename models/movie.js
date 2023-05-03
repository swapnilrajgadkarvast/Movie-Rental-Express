const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genre");
Joi.objectId = require("joi-objectid")(Joi);

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: [2, "Error:title should be greater than 5 characters"],
    maxlength: [50, "Error:title should be less than 5 characters"],
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    required: true,
  },
  numberInStock: {
    type: Number,
    min: 0,
    required: true,
  },
  genre: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  liked: {
    type: Boolean,
    default: false,
  },
});

const Movie = mongoose.model("Movie", movieSchema);
function validateMovie(input) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(50).required(),
    dailyRentalRate: Joi.number().min(0).required(),
    numberInStock: Joi.number().min(0).required(),
    genreId: Joi.objectId(),
    liked: Joi.boolean(),
  });
  return schema.validate(input);
}

module.exports.Movie = Movie;
module.exports.validateMovie = validateMovie;
