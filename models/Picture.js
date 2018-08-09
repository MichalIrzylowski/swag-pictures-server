const mongoose = require("mongoose"),
      User = require("./User");

const pictureSchema = new mongoose.Schema({
    imgUrl: {
      type: String,
      required: true
    },
    title: String,
    description: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

pictureSchema.pre('remove', async function (next) {
  try {
    //find a user
    let user = await User.findById(this.author);
    //remove picture form their pictures list
    user.pictures.remove(this.id);
    //save user
    await user.save();
    //return next
    return next();
  } catch (err) {
    return next(err);
  }
});

const Picture = mongoose.model('Picture', pictureSchema);

module.exports = Picture;
