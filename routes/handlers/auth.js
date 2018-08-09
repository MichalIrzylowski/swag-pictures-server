const jwt = require('jsonwebtoken'),
      db = require('../../models');

exports.register = async function (req, res, next) {
  try {
    //create a user
    let user = await db.User.create(req.body);
    let {id, username, profileImgUrl, description, pictures, following} = user;
      //TOKEN - first we put some payload data (in object) like id, username and proflile img, than we put our secret key
    let token = jwt.sign({
      id,
      username,
      profileImgUrl,
      description,
      pictures,
      following
    }, process.env.SECRET_KEY);
    //create a token (signing a token)
    return res.status(200).json({
      id,
      username,
      profileImgUrl,
      token,
      description,
      pictures
    });
  } catch (err) {
    //if validation fails
    if (err.code === 11000) {
      err.message = 'Sorry, this email is already taken';
    }

    return next({
      status: 400,
      message: err.message
    });

  }
};

exports.login = async function (req, res, next) {
  try {
    let user = await db.User.findOne({
    email: req.body.email
  }).populate('pictures');
    let {id, username, profileImgUrl, pictures, description, following} = user;
    let isMatch = await user.comparePassword(req.body.password);
    if (isMatch) {
      let token = jwt.sign({
        id,
        username,
        profileImgUrl,
        pictures,
        description,
        following
      }, process.env.SECRET_KEY);
      return res.status(200).json({
      id,
      username,
      profileImgUrl,
      token,
      pictures,
      description,
      following
    });
    } else {
      return next({
        status: 400,
        message: 'Invalid email/password'
      });
    }
  } catch (err) {
    return next({
        status: 400,
        message: 'Invalid email/password'
      });
  }
};
