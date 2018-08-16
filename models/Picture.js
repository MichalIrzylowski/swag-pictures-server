const mongoose = require("mongoose"),
  User = require("./User");

const pictureSchema = new mongoose.Schema(
  {
    imgUrl: {
      type: String,
      required: true
    },
    title: String,
    description: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
  },
  {
    timestamps: true
  }
);

pictureSchema.pre("remove", async function(next) {
  try {
    let user = await User.findById(this.author);
    user.pictures.remove(this.id);
    await user.save();
    return next();
  } catch (err) {
    return next(err);
  }
});

const Picture = mongoose.model("Picture", pictureSchema);

module.exports = Picture;
