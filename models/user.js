const mongoose = require('mongoose')
const Joi = require('joi')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const config = require("config")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        maxlength: 50,
        minlength :5,
        required:true
    },
    email:{
        type:String,
        validate: {
            validator: function (value) {
                return /^\S+@\S+\.\S+$/.test(value);
            },
            message: 'Error: Please enter a valid email'
        },
        required:true,

    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        required:true
    }
})

userSchema.methods.getAuthToken = function(){
    return jwt.sign({_id:this._id, isAdmin : this.isAdmin}, config.get('password'))
}

const User = mongoose.model("User", userSchema)
function validateUser(input){
    const schema = Joi.object({
        name : Joi.string().min(5).max(50).required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        isAdmin : Joi.boolean().required()
    })
    return schema.validate(input)
}

module.exports = {User, validateUser}
module.exports.getAuthToken=userSchema.methods.getAuthToken;