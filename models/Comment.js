const mongoose = require("mongoose"),
  User = require("./User"),
  Picture = require("./Picture");

const commentSchema = new mongoose.Schema(
  {
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    commentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Picture"
    }
  },
  {
    timestamps: true
  }
);

commentSchema.pre("remove", async function(next) {
  try {
    let user = await User.findById(this.author);
    user.comments.remove(this.id);
    await user.save();
    let picture = await Picture.findById(this.commentTo);
    picture.comments.remove(this.id);
    await picture.save();
    return next();
  } catch (error) {
    return next(error);
  }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
