const mongoose = require('mongoose')
module.exports = function(req,res,next){
    const isValid = mongoose.Types.ObjectId(req.params.id)
    if (!isValid) return res.status(401).send("Given Id is Invalid !")
    return next()
}
