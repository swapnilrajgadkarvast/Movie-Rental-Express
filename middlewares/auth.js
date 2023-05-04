const jwt = require("jsonwebtoken");
const config = require("config");

const verifyToken = async (req, res, next) => {
  const token = req.headers["x-auth-token"];

  if (!token)
    return res.status(400).send({ success: false, message: "Access Denied !" });
  try {
    const decode = jwt.verify(token, config.get("password"));
    console.log(decode)
    req.user = decode;
  } catch (error) {
    res.status(401).send("Unauthorized....Invalid Token !");
  }
  return next();
};

module.exports = verifyToken;
