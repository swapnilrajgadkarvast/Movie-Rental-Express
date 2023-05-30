const mongoose = require('mongoose')
module.exports = function(req,res,next){
    const isValid = new mongoose.Types.ObjectId(req.params.id)
    if (!isValid) return res.status(400).send("Given Id is Invalid !")
    return next()
}
