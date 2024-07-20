const articleRoute = require("express").Router();
const jwt = require("jsonwebtoken");
const articles = require("../models/ArticleModel");
const buffers = require("../models/BufferModel");
const { authenticateUser } = require("../authentication");

articleRoute.post("/approve", authenticateUser, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  bufferId = req.body.id;
  var buffer = await buffers
    .findById(bufferId, (err, buffer) => {
      if (err) {
        return res.status(404).json({ msg: "Buffer Item Doesnot exist" });
      }
      return buffer;
    })
    .select({ createdAt: 0, updatedAt: 0, _id: 0, __v: 0 })
    .exec();
  if (!buffer) {
    return res.status(404).json({ msg: "Buffered Article Not found" });
  }

  var bufferedArticle = (({
    title,
    author,
    content,
    category,
    tags,
    coverPicUrl,
    user,
  }) => ({ title, author, content, category, tags, coverPicUrl, user }))(
    buffer
  );
  bufferedArticle.views = 0;
  const article = await articles.create(bufferedArticle, (err, article) => {
    console.log("ERR", err);
    if (err) {
      console.log("CONDITION PASSED");
      return res.status(500).json({ msg: "Cannot able to create article" });
    }
    buffers.findByIdAndRemove(bufferId, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ msg: "cannot remove article from buffer" });
      }
      return res
        .status(200)
        .json({ id: article._id, msg: "Article approved successfully" });
    });
  });
});

articleRoute.get("/read/:id", async (req, res) => {
  var article = await articles.findById(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ msg: err });
    }
  });
  if (!article) {
    return res.status(404).json({ msg: "Article Not found" });
  }
  await articles.findByIdAndUpdate(
    req.params.id,
    { views: article.views + 1 },
    (err) => {
      if (err) {
        return res.status(500).json({ msg: err });
      }
    }
  );
  return res.status(200).json(article);
});

articleRoute.get("/", (req, res) => {
  return res.status(200);
});

articleRoute.get("/latest", async (req, res) => {
  res.json({
    articles: await articles.find().sort({ _id: -1 }).limit(3),
  });
});

articleRoute.get("/trending", async (req, res) => {
  res.json({
    articles: await articles.find().sort({ views: -1 }).limit(3),
  });
});

articleRoute.get("/getCount", async (req, res) => {
  return res.status(200).json({ count: await articles.countDocuments() });
});
module.exports = articleRoute;
