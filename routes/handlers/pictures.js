const db = require("../../models");

exports.handleFollowUser = async function(req, res, next) {
  try {
    const { tryingToFollowUser_id, follower_id } = req.body;
    const foundUser = await db.User.findById(follower_id);
    foundUser.following.push(tryingToFollowUser_id);
    await foundUser.save();
    const foundFollowingUser = await db.User.findById(tryingToFollowUser_id);
    const { _id, username, profileImgUrl, pictures } = foundFollowingUser;
    return res.status(200).json({ _id, username, profileImgUrl, pictures });
  } catch (e) {
    return next(e);
  }
};

exports.handlePictureDelete = async function(req, res, next) {
  try {
    let foundPicture = await db.Picture.findById(req.params.id);
    await foundPicture.remove();
    res.status(200).json();
  } catch (e) {
    return next(e);
  }
};
