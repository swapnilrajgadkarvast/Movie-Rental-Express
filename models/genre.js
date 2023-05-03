const mongoose = require('mongoose')
const Joi = require('joi')

const genreSchema = new mongoose.Schema({
    name:{
        type:String,
        maxlength: 50,
        minlength :5,
        required:true
    }
})


const Genre = mongoose.model("Genre", genreSchema)
function validateGenre(input){
    const schema = Joi.object({
        name : Joi.string().min(5).max(50).required(),
    })
}

module.exports.Genre = Genre
module.exports.validateGenre = validateGenre
module.exports.genreSchema = genreSchema