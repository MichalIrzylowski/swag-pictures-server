const mongoose = require("mongoose"),
      bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: 'Username'
  },
  password: {
    type: String,
    required: true
  },
  profileImgUrl: {
    type: String,
    default: 'http://via.placeholder.com/152x152'
  },
  description: {
    type: String,
    default: 'Edit your profile to add something about you!'
  },
  pictures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Picture'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

//HASHING PASSWORDS
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    let hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err) {
    return next(err);
  }
});

//HELPER FUNCTION
userSchema.methods.comparePassword = async function (candidatePassword, next) {
  try {
    let isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    return next(err);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
