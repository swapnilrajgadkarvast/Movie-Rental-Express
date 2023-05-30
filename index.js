require('./startup/db');
require('express-async-errors')

const cors = require('cors')
const express = require('express')
const app = express();
const Process = require('./startup/logging');
const {startServer} = require('./startup/port');
const error = require("./middlewares/error");
const allRoutes = require("./startup/routes");



app.use(express.json());
app.use(error);
app.use(Process);
app.use(cors())


startServer(app);
allRoutes(app);

module.exports = app

