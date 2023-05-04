module.exports = function(err,req,res,next){
    if(!req.user.isAdmin) return res.status(403).send("Access Forbidden !")
    else next()
}