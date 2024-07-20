var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BufferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    coverPicUrl: { type: String, unique: true, required: true },
    category: {
      type: String,
      enum: ["food", "travel", "technology", "others"],
      default: "Others",
    },
    tags: { type: Array, default: [] },
    user: [{ type: Schema.Types.ObjectId, ref: "UserSchema" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Buffer", BufferSchema);
