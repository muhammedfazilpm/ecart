const User = require("../model/usermodel");
const Cat = require("../model/catogarymodel");
const bcrypt = require("bcrypt");
const { findByIdAndDelete } = require("../model/usermodel");

const loadLogin = async (req, res) => {
  try {
    res.render("adminlogin");
  } catch (error) {
    console.log(error);
  }
};

const varifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await User.findOne({ email: email });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        if (adminData.is_admin == 1) {
          req.session.admin_id = adminData._id;
          res.redirect("/admin/home");
        } else {
          res.render("adminlogin", {
            message: "you are not verified as admin",
          });
        }
      } else {
        res.render("adminlogin", { message: "enter the correct password" });
      }
    } else {
      res.render("adminlogin", { message: "enter your email correctly" });
    }
  } catch (error) {
    console.log(error);
  }
};

//to show the user detail in admin pannel
const loadUser = async (req, res) => {
  try {
    const userDatas = await User.find({ is_admin: 0 });

    res.render("user", { users: userDatas });
  } catch (error) {
    console.log(error);
  }
};

//to block and un block the user from admin pannel

const blockUser = async (req, res) => {
  try {
    const blockedUser = await User.findById({ _id: req.query.id });

    if (blockedUser.is_block == 1) {
      await User.updateOne({ _id: req.query.id }, { $set: { is_block: 0 } });
      res.redirect("/admin/user");
    } else {
      await User.updateOne({ _id: req.query.id }, { $set: { is_block: 1 } });
      res.redirect("/admin/user");
    }
  } catch (error) {
    console.log(error);
  }

  // to load the catogary page
};
const loadCat = async (req, res) => {
  try {
    const CatogoryData = await Cat.find();

    res.render("catogary", { catogaries: CatogoryData });
  } catch (error) {
    console.log(error);
  }
};

//to render the page of catogary add

const addCat = async (req, res) => {
  try {
    res.render("addcatogary");
  } catch (error) {
    console.log(error);
  }
};

//to add the catogary in to database
const postCat = async (req, res) => {
  try {
    const data = new Cat({
      name: req.body.catname,
    });
    if (req.body.catname.trim().length === 0) {
      res.render("addcatogary", { alert: "you must fill the spaces" });
    } else {
      const name = req.body.catname;
      const already = await Cat.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') }});
      if (already) {
        res.render("addcatogary", { alert: "the catogary is already added" });
      } else {
        const catData = await data.save();
        res.redirect("/admin/catogary");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//to delete the catogary

const deletecat = async (req, res) => {
  try {
    await Cat.deleteOne({ _id: req.query.id });
    res.redirect("/admin/catogary");
  } catch (error) {
    console.log(error);
  }
};

//to block the catogary

const blockcat = async (req, res) => {
  const a = await Cat.findById({ _id: req.query.id });

  try {
    if (a.blocked == false) {
      await Cat.updateOne({ _id: req.query.id }, { $set: { blocked: true } });
      res.redirect("/admin/catogary");
    } else {
      await Cat.updateOne({ _id: req.query.id }, { $set: { blocked: false } });
      res.redirect("/admin/catogary");
    }
  } catch (error) {
    console.log(error);
  }
};

//for logout
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
 
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

//to get the home page-----------------------------------HOME
const home = async (req, res) => {
  try {
    res.render("adminHome");
  } catch (error) {
    console.log(error);
  }
};

const dashBoard = async (req, res) => {
  try {
    res.redirect("/admin/home");
  } catch (error) {}
};

module.exports = {
  loadLogin,
  varifyLogin,
  loadUser,
  blockUser,
  loadCat,
  addCat,
  postCat,
  deletecat,
  blockcat,
  adminLogout,
  home,
  dashBoard,
};
