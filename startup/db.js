const mongoose = require("mongoose")
const config = require("config")
module.exports = mongoose.connect(config.get("db"), {
    useNewUrlParser: true,  //used to ensure compatibility with the latest version of mongodb
    useUnifiedTopology: true
}).then(() => {
    console.log(`Connection Successful! ${config.get("db")}`)
}).catch((err)=>{
    console.log(err)
})
