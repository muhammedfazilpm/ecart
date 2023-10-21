const User = require("../model/usermodel");
const Cat = require("../model/catogarymodel");
const Order = require("../model/ordermodel");
const product = require("../model/productmodel");
const coupon = require("../model/couponModel");
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
      const user = req.query.id;
      console.log(req.query.id);
      req.session.user_id = false;

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
      const already = await Cat.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
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
// to eit the catogary
const editcat = async (req, res) => {
  const edit = await Cat.findOne({ _id: req.query.id });

  try {
    const id = req.query.id;
    const alert = undefined;
    res.render("editcat", { edit, alert });
  } catch (error) {
    console.log(error);
  }
};

// post the edit catogary
const postedit = async (req, res) => {
  try {
    if (req.body.catname.trim().length === 0) {
      const edit = await Cat.findOne({ _id: req.query.id });

      res.render("editcat", { alert: "you must fill the spaces", edit });
    } else {
      const edit = await Cat.findOne({ _id: req.query.id });
      const name = req.body.catname;
      const already = await Cat.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
      if (already) {
        const edit = await Cat.findOne({ _id: req.query.id });
        res.render("editcat", { alert: "the catogary is already added", edit });
      } else {
        const postcat = await Cat.findOneAndUpdate(
          { _id: req.body.id },
          { $set: { name: req.body.catname } }
        );
        res.redirect("/admin/catogary");
      }
    }
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

//to get the home page
const home = async (req, res) => {
  try {
    const orderdata = await Order.find({ status: { $ne: "CANCELED" } });
    let subtotal = 0;
    orderdata.forEach(function (value) {
      subtotal = subtotal + value.totalamount;
    });
    const cod = await Order.find({ paymentmethod: "COD" }).count();
    const online = await Order.find({ paymentmethod: "ONLINE" }).count();
    const totalOrder = await Order.find({
      status: { $ne: "CANCELED" },
    }).count();
    const totalUser = await User.find().count();
    const totalProducts = await product.find().count();
    const date = new Date();
    const year = date.getFullYear();
    const currentYear = new Date(year, 0, 1);
    const salesByYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentYear },
          status: { $ne: "CANCELED" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    let sales = [];
    for (i = 1; i < 13; i++) {
      let result = true;
      for (j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) {
        sales.push({ _id: i, total: 0, count: 0 });
      }
    }
    let yearChart = [];
    for (i = 0; i < sales.length; i++) {
      yearChart.push(sales[i].count);
    }

    res.render("adminHome", {
      data: orderdata,
      total: subtotal,
      cod,
      online,
      totalOrder,
      totalUser,
      totalProducts,
      yearChart,
    });
  } catch (error) {
    console.log(error);
  }
};
// to load the dash borad
const dashBoard = async (req, res) => {
  try {
    res.redirect("/admin/home");
  } catch (error) {}
};

// to get the coupon page
const getCoupon = async (req, res) => {
  const coupondata = await coupon.find({});

  try {
    res.render("coupon", { coupondata });
  } catch (error) {
    console.log(error);
  }
};
// to get the add coupon page
const getaddCoupon = async (req, res) => {
  res.render("addcoupon");
  try {
  } catch (error) {
    console.log(error);
  }
};

// to post the coupon details

const postCoupon = async (req, res) => {
  try {
    const coupondata = new coupon({
      code: req.body.coupon,
      discountAmount: req.body.amount,
      maxcartamount: req.body.cartamount,
      maxcount: req.body.couponcount,
      expiryDate: req.body.date,
    });
    const copond = await coupondata.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
  }
};

// to get the edit coupon
const editcoupon = async (req, res) => {
  const coupenedit = await coupon.find({ _id: req.query.id });

  try {
    res.render("editcoupon", { coupenedit });
  } catch (error) {
    console.log(error);
  }
};

// post the edite coupon
const posteditcoupon = async (req, res) => {
  try {
    const coupons = await coupon.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          code: req.body.coupon,
          discountAmount: req.body.amount,
          maxcartamount: req.body.cartamount,
          maxcount: req.body.couponcount,
          expiryDate: req.body.date,
        },
      }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
  }
};
// to delete that coupon

const deleteCoupon = async (req, res) => {
  try {
    console.log(req.body.id);
    const deletecoupon = await coupon.findOneAndDelete({ _id: req.body.id });
    res.json({ status: true });
  } catch (error) {
    console.log(error);
  }
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
  editcat,
  postedit,
  adminLogout,
  home,
  dashBoard,
  getCoupon,
  getaddCoupon,
  postCoupon,
  editcoupon,
  posteditcoupon,
  deleteCoupon,
};
