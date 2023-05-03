const winston = require("winston");
const config = require("config");

winston.configure({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" }),
  ],
});

process.on("uncaughtException", (err) => {
  winston.error(`We have uncaught exception ${err.message}`);
  setTimeout(() => {
    process.exit(1);
  }, 2000);
});

process.on("unhandledRejection", (err) => {
  winston.error(`We have caught unhandled exception ${err.message}`);
});

if (!config.get("password")) {
  console.log("jwtPrivateKey is not set.");
}

module.exports = function Process(req, res, next) {
  req.process = process;
  next();
};
// module.exports.handleErrors = handleErrors;
