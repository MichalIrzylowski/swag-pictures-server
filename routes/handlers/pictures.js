const mongoose = require("mongoose");
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

exports.handleUserSearch = async function(req, res, next) {
  try {
    const foundUsers = await db.User.find({ username: req.body.username });
    return res.status(200).json(foundUsers);
  } catch (e) {
    return next(e);
  }
};

exports.handlePicturesFind = async function(req, res, next) {
  try {
    let picturesIds = req.body.map(p => new mongoose.Types.ObjectId(p));
    let pictures = await db.Picture.find({ _id: { $in: picturesIds } })
      .sort({ createdAt: "desc" })
      .populate("author", {
        username: true,
        profileImgUrl: true
      });
    return res.status(200).json(pictures);
  } catch (e) {
    return next(e);
  }
};

exports.handleAddComment = async function(req, res, next) {
  try {
    let comment = await db.Comment.create({
      text: req.body.comment,
      author: req.body.authorOfACommentId,
      commentTo: req.body.pictureId
    });
    let foundPicture = await db.Picture.findById(comment.commentTo);
    foundPicture.comments.push(comment.id);
    await foundPicture.save();
    let foundUser = await db.User.findById(comment.author);
    foundUser.comments.push(comment.id);
    await foundUser.save();
    let foundComment = await db.Comment.findById(comment.id).populate(
      "author",
      {
        username: true
      }
    );
    return res.status(200).json(foundComment);
  } catch (error) {
    return next(error);
  }
};
