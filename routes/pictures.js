const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const db = require("../models");
const {
  handleFollowUser,
  handlePicturesFind,
  handleUserSearch,
  handlePictureDelete,
  handleAddComment
} = require("./handlers/pictures");

// === MULTER CONFIGURATION === //
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

// === CLOUDINARY CONFIGURATION === //
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dlxsuuger",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// === ADD COMMENT FLOW === //
router.post("/addComment", handleAddComment);

// === FIND COMMENTS FLOW === //
router.post("/find_comments", async function(req, res, next) {
  try {
    let commentsIds = req.body.map(c => new mongoose.Types.ObjectId(c));
    const populateQuery = [
      { path: "author", select: "username" },
      { path: "commentTo", select: "_id" }
    ];
    let comments = await db.Comment.find({
      _id: { $in: commentsIds }
    }).populate(populateQuery);
    return res.status(200).json(comments);
  } catch (error) {
    return next(error);
  }
});

// === DELETE COMMENT FLOW === //
router.delete("/delete_comment/:id", async function(req, res, next) {
  try {
    let commentToDelete = await db.Comment.findById(req.params.id);
    await commentToDelete.remove();
    return res.status(200).json();
  } catch (error) {
    return next(error);
  }
});

// === FIND FOLLOWERS PICTURES === //
router.post("/getPictures", handlePicturesFind);

// === SEARCH USERS === //
router.post("/search_users", handleUserSearch);

// === HANDLE FOLLOW USER === //
router.post("/follow_user", handleFollowUser);

// === HANDLE PICTURE DELETE === //
router.delete("/:id", handlePictureDelete);

// === HANDLE PICTURE CREATE ===//
router.post("/:id/picture", upload.single("picture"), async function(
  req,
  res,
  next
) {
  cloudinary.uploader.upload(req.file.path, async function(result) {
    try {
      let picture = await db.Picture.create({
        imgUrl: result.secure_url,
        title: req.body.title,
        description: req.body.description,
        author: req.params.id
      });
      let foundUser = await db.User.findById(req.params.id);
      foundUser.pictures.push(picture.id);
      await foundUser.save();
      let foundPicture = await db.Picture.findById(picture.id).populate(
        "author",
        {
          username: true,
          profileImgUrl: true
        }
      );
      return res.status(200).json(foundPicture);
    } catch (err) {
      return next(err);
    }
  });
});

// === HANDLE UPDATE PROFILE === //
router.put("/:id", upload.single("picture"), async function(req, res, next) {
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, async function(result) {
      try {
        let user = await db.User.findById(req.params.id);
        user.profileImgUrl = result.secure_url;
        user.username = req.body.username;
        user.description = req.body.description;
        await user.save();
        return res.status(200).json({
          profileImgUrl: user.profileImgUrl,
          username: user.username,
          description: user.description
        });
      } catch (e) {
        return next(e);
      }
    });
  } else {
    try {
      let user = await db.User.findById(req.params.id);
      user.username = req.body.username;
      user.description = req.body.description;
      await user.save();
      return res
        .status(200)
        .json({ username: user.username, description: user.description });
    } catch (e) {
      return next(e);
    }
  }
});

module.exports = router;
