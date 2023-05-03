const user = require("../model/usermodel");

const isLogin = async (req, res, next) => {
  try {
    const currentuser = await user.find({ _id: req.session.user_id });

    if (req.session.user_id) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      console.log("3");
      res.redirect("/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  isLogin,
  isLogout,
};
