const express = require('express');
const multer = require('multer');
const db = require('../models')
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dlxsuuger',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

router.get('/getAllPictures', async function (req, res, next) {
  try {
    let pictures = await db.Picture.find().sort({createdAt: 'desc'}).populate('author', {
      username: true,
      profileImgUrl: true
    });
    return res.status(200).json(pictures);
  } catch (e) {
    return next(e);
  }
});

router.post('/search_users', async function(req, res, next) {
  try {
    const foundUsers = await db.User.find({username: req.body.username});
    return res.status(200).json(foundUsers);
  } catch (e) {
    return res.status(500).json(e)
  }
});

router.post('/follow_user', async function(req, res, next) {
  try {
    const {tryingToFollowUser_id, follower_id} = req.body;
    const foundUser = await db.User.findById(follower_id);
    foundUser.following.push(tryingToFollowUser_id);
    await foundUser.save();
    return res.status(200).json(tryingToFollowUser_id);
  } catch (e) {
    return next(e);
  }
})

router.post('/:id/picture', upload.single('picture'), async function (req, res, next) {
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
      let foundPicture = await db.Picture.findById(picture.id).populate('author', {
        username: true,
        profileImgUrl: true
      });
      return res.status(200).json(foundPicture);
    } catch (err) {
      return next(err);
    }
  });
});

router.delete('/:id', async function (req, res, next) {
  try {
    let foundPicture = await db.Picture.findById(req.params.id);
    await foundPicture.remove();
    res.status(200).json();
  } catch (e) {
    return next(e);
  }
});

router.put('/:id', upload.single('picture'), async function (req, res, next) {
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, async function (result) {
      try {
        let user = await db.User.findById(req.params.id);
        user.profileImgUrl = result.secure_url;
        user.username = req.body.username;
        user.description = req.body.description;
        await user.save();
        return res.status(200).json({profileImgUrl: user.profileImgUrl, username: user.username, description: user.description});
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
      return res.status(200).json({username: user.username, description: user.description});
    } catch (e) {
      return next(e);
    }
  }
});


module.exports = router;
