const mongoose = require('mongoose')
const Joi = require('joi')
const { genreSchema } = require('./genre')
Joi.objectId = require("joi-objectid")(Joi)

const rentalSchema = new mongoose.Schema({
    movie: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            title: {
                type: String,
                minlength: [5, "Error:title should be greater than 5 characters"],
                maxlength: [50, "Error:title should be less than 5 characters"],
                required: true
                },
            dailyRentalRate: {
                type: Number,
                min: 0,
                required: true
            },
            numberInStock: {
                type: Number,
                min: 0,
                required: true
            }
        },
        required: true
    },
    customer: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            name: {
                type: String,
                minlength: [5, "Error: Name letters  should be greater than 5"],
                maxlength: [50, "Error: Name letters should be less than 50"],
                required: true
            },
            phone: {
                type: String,
                minlength: [7, "Error: Enter 7 digit number"],
                maxlength: [10, "Error: Enter 10 digit number"],
                required: true
            }
        },
        required: true

    },
    rentalFee: {
        type: Number,
        min: 0,
        required: true
    },
    dateOut: {
        type: Date,
        default: new Date(),
    },
    dateIn: Date,



})


const Rental = mongoose.model("Rental", rentalSchema)
function validateRental(input){
    const schema = Joi.object({
        // rentalFee : Joi.number().required(),
        customerId : Joi.objectId().required(),
        movieId: Joi.objectId().required()
    })
    return schema.validate(input)
}

module.exports.Rental = Rental
module.exports.validateRental = validateRental 