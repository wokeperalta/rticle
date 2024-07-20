const userRoute = require("express").Router();
const jwt = require("jsonwebtoken");
const users = require("../models/UserModel");
const mongoose = require("mongoose");
const _ = require("lodash");
const multer = require("multer");
const { uploadImage } = require("../utils/imageUpload");
const { authenticateUser } = require("../authentication");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

userRoute.post("/login", async (req, res) => {
  user = await users.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ msg: "User Not Found" });
  }

  if (user.password !== req.body.password) {
    return res.status(401).json({ msg: "Incorrect password" });
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );

  return res.json({
    accessToken,
    email: user.email,
  });
});

userRoute.post("/register", upload.single("profileImage"), async (req, res) => {
  req.file
    ? (req.body.imageUrl = await uploadImage(req.file))
    : (req.body.imageUrl = null);

  if (await users.findOne({ email: req.body.email })) {
    return res.status(409).json({ msg: "User already exists" });
  }
  await users.create(req.body, (err) => {
    if (err) {
      return res.status(500).json({ msg: err });
    }
    return res.status(201).json({ msg: "User Created Successfully" });
  });
});

userRoute.get("/user-info", authenticateUser, async (req, res) => {
  const user = await users.findOne({ email: req.user.email });
  if (user) {
    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
  return res.status(404);
});

userRoute.get("/profile-img", authenticateUser, async (req, res) => {
  const user = await users.findOne({ email: req.user.email });
  if (user) {
    return res.status(200).send(user.imageUrl);
  }
  return res.status(404);
});

userRoute.get("/getCount", async (req, res) => {
  return res.status(200).json({ count: await users.countDocuments() });
});

module.exports = userRoute;
