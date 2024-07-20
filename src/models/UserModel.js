var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    description: { type: String },
    role: { type: String, enum: ["blogger", "admin"], default: "blogger" },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

UserSchema.virtual("isAdmin").get(() => {
  return this.role === "admin";
});
UserSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("User", UserSchema);
