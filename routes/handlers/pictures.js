const db = require('../../models');

// /api/users/:id/picture
exports.createPicture = async function (req, res, next) {
  try {
    let message = await db.Message.create({
      text: req.body.text,
      user: req.params.id
    });
    let foundUser = await db.User.findById(req.params.id);
    foundUser.messages.push(message.id);
    await foundUser.save();
    let foundMessage = await db.Message.findById(message.id).populate('user', {
      username: true,
      profileImgUrl: true
    });
    console.log(foundMessage);
    return res.status(200).json(foundMessage);
  } catch (err) {
    return next(err);
  }
};
