const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const userRoute = require("./src/routes/user");
const bufferRoute = require("./src/routes/buffer");
const articles = require("./src/models/ArticleModel");
const articleRoute = require("./src/routes/article");
const app = express();
const cors = require("cors");

app.use(bodyParser.json());
var mongoose = require("mongoose");
const connectionString = process.env.MONGO_URL;
mongoose.Promise = global.Promise;
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected.....");
  })
  .catch((err) => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept, Authorization"
  );
  next();
});
app.use("/user", userRoute);
app.use("/buffer", bufferRoute);
app.use("/article", articleRoute);
app.use("/images", express.static(path.join(__dirname, "src/images")));

app.listen(process.env.PORT || 4000, () => {
  console.log(`Node server is listening`);
});
