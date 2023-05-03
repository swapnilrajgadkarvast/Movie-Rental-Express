const genres = require("../routes/genreRoute");
const customers = require("../routes/customerRoute");
const users = require("../routes/userRoute");
const movies = require("../routes/movieRoute");
const rentals = require("../routes/rentalRoute");
const logins = require("../routes/loginRoute");


function allRoutes(app){
    app.use("/genre", genres);
    app.use("/customer", customers);
    app.use("/user", users);
    app.use("/movie", movies);
    app.use("/rental", rentals);
    app.use("/login", logins);
}


module.exports = allRoutes;
