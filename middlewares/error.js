const winston = require('winston')
module.exports = function(err,req,res, next){
    winston.error(err.message)
    res.send("Something Went Wrong !");
}