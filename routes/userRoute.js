const express = require('express')
const router = express.Router()
const { User, validateUser} = require("../models/user")
const Joi = require("joi")
const bcrypt = require('bcrypt')
const _ = require("lodash");
const auth = require("../middlewares/auth")
const admin = require('../middlewares/admin')
const validateId = require("../middlewares/validateId")
const config = require("config")
const nodemailer = require("nodemailer")

router.get("/",async (req, res) => {
    const users = await User.find();
    res.send(users)
});

router.get("/:id",auth,async(req,res) => {
    const users = await User.findById(req.params.id)
    if (!users) return res.status(404).send("User with given id is not found.")
    res.send(users)
})

router.post("/", async(req, res) => {
    const validation = validateUser(req.body);
    if (!validation) return res.status(400).send(validation.details[0].message)

    let user = await User.findOne({ email : req.body.email})
    if (user) return res.status(400).send("User already registered !")

    const users = new User({
        name: req.body.name,
        email : req.body.email,
        password : req.body.password,
        isAdmin : req.body.isAdmin
    });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.get("email"),
            pass: config.get("devpassword")
        }
    })

    const textMessage = `Hello ${users.name}. Welcome to Movie Rental Portal. Your registration is successful and your password is ${req.body.password}`
    const message = {
        from: config.get("email"),
        to: users.email,
        subject: "Movie Rental Registration Successful",
        text: textMessage
    }

    transporter.sendMail(message, (error) => {
        if (error) {
            return res.status(500).json({ error })
        } else {
            const userData = _.pick(users, ["_id", "name", "email", "isAdmin"])
            res.send("Email sent successfully", userData)
        }
    })

    users.password = await bcrypt.hash(users.password,10)
    await users.save();
    res.send(_.pick(users, ["name","email","isAdmin"]));
})

router.put("/:id",auth,async (req, res) => {

    const users = await User.findByIdAndUpdate(
        req.params.id,
        {name: req.body.name},
        {email : req.body.email},
        {password : req.body.password},
        {isAdmin : req.body.isAdmin},
        {new : true}
    );

    if (!users) return res.status(404).send("User with given id is not found.")
    res.send(users)
})


router.delete("/:id",admin, async(req, res) => {
    const users = await User.findByIdAndDelete(req.params.id)

    if (!users) return res.status(404).send("User with given id is not found.")
    res.send(users)

})

module.exports = router;