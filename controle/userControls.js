const User = require("../model/usermodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pRData = require("../model/productmodel");
const session = require("express-session");
const categoryData = require("../model/catogarymodel");
const address = require("../model/addressmodel");
const wallet = require("../model/walletmodel");
let dotenv = require("dotenv");
dotenv.config();
const { updateOne } = require("../model/usermodel");
const { find } = require("../model/cartmodel");
let otp;
let otp2;
let email2;
let forgetmail;
let nameresend;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//for send mail and otp
const sendVerifyMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.user,

        pass: process.env.pass,
      },
    });
    const mailOPtion = {
      form: "globalcycle12@gmail.com",
      to: email,
      subject: "for verification mail",
      html:
        "<p>hi" +
        name +
        ',please click here to<a href="http://localhost:8080/otp">varify</a> and enter the' +
        otp +
        " for your verification " +
        email +
        "</p>",
    };

    transporter.sendMail(mailOPtion, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been send", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//forget otp sending to mail

const sendVerifyMail2 = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.user,

        pass: process.env.pass,
      },
    });
    const mailOPtion = {
      form: "globalcycle12@gmail.com",
      to: email,
      subject: "for resetb your password",
      html:
        '<p>hi please click here to reset your password <a href="http://localhost:8080/varifyOtp">varify</a> and enter the' +
        otp +
        " for your verification of yor mail " +
        email +
        "</p>",
    };

    transporter.sendMail(mailOPtion, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been send", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const registerLoad = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

//resistration form submission
const veryfiyUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const email = req.body.email;
    const alreyMail = await User.findOne({ email: email });
    email2 = email;
    nameresend = req.body.name;
    if (alreyMail) {
      res.render("register", { message: "EMAIL ALREADY EXIST " });
    } else {
      if (req.body.name.trim().length == 0 || req.body.password.trim() == 0) {
        res.render("register", { message: "SPACE NOT ALLOWED" });
      }
      const data = new User({
        name: req.body.name,
        email: req.body.email,
        mob: req.body.number,
        password: spassword,
      });

      const Udata = await data.save();

      if (Udata) {
        //otp generation

        randomNumber = Math.floor(Math.random() * 9000) + 1000;
        otp = randomNumber;

        sendVerifyMail(req.body.name, req.body.email, randomNumber);

        res.redirect("/otp");
      } else {
        res.render("register", { alert: "note done" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for login page
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//for otp page while clicking the verify in mail
const otppage = async (req, res) => {
  try {
    res.render("verify");
  } catch (error) {
    console.log(error.message);
  }
};

//for otp verification
const login2 = async (req, res) => {
  try {
    var otp2 = req.body.otp;

    if (otp2 == otp) {
      const email3 = await User.findOneAndUpdate(
        { email: email2 },
        { $set: { is_varified: 1 } }
      );

      res.redirect("/login");
    } else {
      res.render("verify", { message: "Please enter the correct otp" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// for user login by checking mail password varified and block
const varifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_varified == 1) {
          if (userData.is_block == 0) {
            req.session.user_id = userData._id;
                   
            res.redirect("/home");
          } else {
            res.render("login", {
              message: " you are blocked contact admin  ",
            });
          }
        } else {
          res.render("login", { message: "PLEASE VERIFY YOUR MAIL" });
        }
      } else {
        res.render("login", {
          message: "check your email or password entered correcltly",
        });
      }
    } else {
      res.render("login", { message: "ENTER THE CORRECT MAIL OR REGISTER" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//to get the home
const loadHome = async (req, res) => {
  try {
    if (req.session.user_id) {
      const user=req.session.user_id
      const newuser = new wallet({ user: user });
      const data = await newuser.save();
      res.render("home");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};

//for the section of logout

const logoutHome = async (req, res) => {
  try {
    req.session.user_id = false;
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

//to get the forget pasword otp sending interface
const forget = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error);
  }
};

const forgetOtp = async (req, res) => {
  try {
    forgetmail = req.body.email;
    const forgetemail = await User.findOne({ email: forgetmail });

    if (forgetemail) {
      var randomNumber = Math.floor(Math.random() * 9000) + 1000;
      otp2 = randomNumber;
      sendVerifyMail2(forgetmail, randomNumber);
      res.render("varifyOtp");
    } else {
      res.render("forget", {
        message: "The email is invalid enter a valied mail or register first",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//after sending the otp to get the new otp entering page
const varifyOtp = async (req, res) => {
  try {
    res.render("varifyOtp");
  } catch (error) {}
};

//to check the otp and show the windows for reset password

const checkOtp = async (req, res) => {
  let Otp = await req.body.otp;

  try {
    if (otp2 == Otp) {
      res.redirect("/resetpass");
    } else {
      res.render("varifyOtp", {
        message: "enter the correct otp for reset your password",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
//for enter the new password and reset the password

const resetpass = async (req, res) => {
  try {
    res.render("resetpass");
  } catch (error) {
    console.log(error);
  }
};

const writeNewpass = async (req, res) => {
  let newPass = await req.body.password;
  const passwordHash2 = await bcrypt.hash(newPass, 10);
  let Data = await User.findOneAndUpdate(
    { email: forgetmail },
    { $set: { password: passwordHash2 } }
  );
  console.log(forgetmail);
  console.log(Data);

  try {
    res.render("login", {
      message: "your password is upated please login with new password",
    });
  } catch (error) {
    console.log(error);
  }
};

//for load the product page

const productPage = async (req, res) => {
  const products = await pRData.find({ blocked: 0 }).limit(6);
  const products2 = await pRData.find({ blocked: 0 });
  const category = await categoryData.find({ blocked: false });
  const totalProducts = products2.length;
  const category1=1
  const sort=1

  const totalpage = Math.ceil(totalProducts / 6);

  try {
    res.render("Uproduct", { products, category, totalpage,category1,sort });
  } catch (error) {
    console.log(error);
  }
};
// pagination of products
const pagination = async (req, res) => {
  const tagid = req.query.id;
  const page = parseInt(req.query.page) || 1;
  const sort=req.query.sort
  const limit = 6;
  const category1=req.query.category
  
  const startindex = (page - 1) * limit;

  
  try {
    if (category1==1){
      if(sort==1){
        const category = await categoryData.find({ blocked: false });
        const products = await pRData
          .find({ blocked: 0})
          .skip(startindex)
          .limit(limit).sort({prize:1}).sort({prize:1});
          const products2 = await pRData.find({ blocked: 0 });
          const totalProducts=products2.length
          const totalpage = Math.ceil(totalProducts / 6);
        res.render("Uproduct", { products, category,totalpage,category1,sort });
  
      }
      else{
        const category = await categoryData.find({ blocked: false });
        const products = await pRData
          .find({ blocked: 0 })
          .skip(startindex)
          .limit(limit).sort({prize:1}).sort({prize:-1});
          const products2 = await pRData.find({ blocked: 0 });
          const totalProducts=products2.length
          const totalpage = Math.ceil(totalProducts / 6);
        res.render("Uproduct", { products, category,totalpage,category1,sort });
      }

    }
    else{
      if(sort==1){
        const category = await categoryData.find({ blocked: false });
        const products = await pRData
          .find({ blocked: 0,catogary:category1})
          .skip(startindex)
          .limit(limit).sort({prize:1}).sort({prize:1});
          const products2 = await pRData.find({ blocked: 0 });
          const totalProducts=products2.length
          const totalpage = Math.ceil(totalProducts / 6);
        res.render("Uproduct", { products, category,totalpage,category1,sort });
  
      }
      else{
        const category = await categoryData.find({ blocked: false });
        const products = await pRData
          .find({ blocked: 0,catogary:category1 })
          .skip(startindex)
          .limit(limit).sort({prize:1}).sort({prize:-1});
          const products2 = await pRData.find({ blocked: 0 });
          const totalProducts=products2.length
          const totalpage = Math.ceil(totalProducts / 6);
        res.render("Uproduct", { products, category,totalpage,category1,sort });
      }
    }
    
   
  } catch (error) {
    console.log(error);
  }
};

// to search prouct from proucts
const searchprouct = async (req, res) => {
  
  const products2 = await pRData.find({ blocked: 0 });
  const totalProducts=products2.length
  const totalpage = Math.ceil(totalProducts / 6);
  const category1=req.body.category
  const sort=req.body.sort
 
  try {
    let products
    const searchValue = req.body.search;
    const search = searchValue.trim();

    if (search != "") {
      if(sort==1){
        if (category1==1) {
          products = await pRData.find({
            $and: [
              { name: { $regex: `^${search}`, $options: "i" } },
              { blocked: 0 },
            ]
          }).sort({prize:1});
          
        }
        else {
         products = await pRData.find({catogary:category1,
          $and: [
            { name: { $regex: `^${search}`, $options: "i" } },
            { blocked: 0 },
          ]
        }).sort({prize:1});}
       
        const category = await categoryData.find({ blocked: false });
        res.render("Uproduct", { products, category,totalpage,category1,sort});
      }
      else{
        if (category1==1) {
          products = await pRData.find({
            $and: [
              { name: { $regex: `^${search}`, $options: "i" } },
              { blocked: 0 },
            ]
          }).sort({prize:-1});
          
        }
        else {
         products = await pRData.find({catogary:category1,
          $and: [
            { name: { $regex: `^${search}`, $options: "i" } },
            { blocked: 0 },
          ]
        }).sort({prize:-1});}
       
        const category = await categoryData.find({ blocked: false });
        res.render("Uproduct", { products, category,totalpage,category1,sort});
      }


      }




     
  } catch (error) {
    console.log(error);
  }
};
// to sort the product by its prize
const sortproduct=async(req,res)=>{
  const products2 = await pRData.find({ blocked: 0 });
  const totalProducts=products2.length
  const totalpage = Math.ceil(totalProducts / 6);
  const category1=req.query.category
  let sort=req.query.sort
  console.log(sort);
  try {
  
    if(category1==1){
      const products=await pRData.find({ blocked: 0}).sort({prize:1})
    const category = await categoryData.find({ blocked: false });
    res.render("Uproduct", { products, category,totalpage,category1,sort });

    }
    else{
    const products=await pRData.find({ blocked: 0,catogary:category1}).sort({prize:1})
    const category = await categoryData.find({ blocked: false });
    res.render("Uproduct", { products, category,totalpage,category1,sort });
    }
  } catch (error) {
    console.log(error);
    
  }
}

// to sort the product by its prize in oposit order
const dsortproduct=async(req,res)=>{
  const products2 = await pRData.find({ blocked: 0 });
  const totalProducts=products2.length
  const category1=req.query.category
  const totalpage = Math.ceil(totalProducts / 6);
  let sort=req.query.sort
  try {
    if(category1==1){
      const products=await pRData.find({ blocked: 0}).sort({prize:-1})
    const category = await categoryData.find({ blocked: false });
    res.render("Uproduct", { products, category,totalpage,category1,sort});

    }
    else{
    const products=await pRData.find({ blocked: 0,catogary:category1}).sort({prize:-1})
    const category = await categoryData.find({ blocked: false });
    res.render("Uproduct", { products, category,totalpage,category1,sort});
    }
  } catch (error) {
    console.log(error);
    
  }
}

// to show the product details
const showProductetails = async (req, res) => {
  try {
    const id = await req.query.id;
    const product = await pRData.findById({ _id: id });

    res.render("productView", { product });
  } catch (error) {
    console.log(error);
  }
};

//resend otp after countdown
const countResend = async (req, res) => {
  try {
    randomNumber = Math.floor(Math.random() * 9000) + 1000;
    otp = randomNumber;

    sendVerifyMail(nameresend, email2, otp);
    res.render("verify");
  } catch (error) {
    console.log(error);
  }
};

//to render the page of category

const sortCategory = async (req, res) => {
  const category1 = req.query.name;
 const sort=1
  const products = await pRData.find({ catogary: category1, blocked: 0 });

  const category = await categoryData.find({ blocked: false });
  const products2 = await pRData.find({ blocked: 0 });
      const totalProducts=products2.length
      const totalpage = Math.ceil(totalProducts / 6);
  try {
    res.render("Uproduct", { products, category,totalpage,category1,sort });

  } catch (error) {
    console.log(error);
  }
};

//to show the cart page

const cart = async (req, res) => {
  try {
    res.render("cart");
  } catch (error) {
    console.log(error);
  }
};

// to show the user profile
const showprofile = async (req, res) => {
  const user = req.session.user_id;
  try {
   

    const userprofile = await User.findById({ _id: req.session.user_id });
    const useraddress1 = await address.findOne({ user: req.session.user_id });
    const wallets = await wallet.find({ user: req.session.user_id });
    const walletbalanc = wallets[0].walletbalance;
   if(useraddress1){
    var useraddress=useraddress1
   }else{
    useraddress=0
   }
   console.log(useraddress1);
    res.render("userprofile", { userprofile, useraddress, walletbalanc });
  } catch (error) {
    console.log(error);
  }
};

// for edit the profile details
const eitprofile = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.session.user_id });
    res.render("editprofile", { user });
  } catch (error) {
    console.log(error);
  }
};

// for post the edited detais
const posteitprofile = async (req, res) => {
  try {
    const useredit = await User.findByIdAndUpdate(
      { _id: req.session.user_id },
      { $set: { name: req.body.name, mob: req.body.number } }
    );
    res.redirect("/myprofile");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  registerLoad,
  veryfiyUser,
  loadLogin,
  otppage,
  login2,
  varifyLogin,
  loadHome,
  logoutHome,
  forget,
  forgetOtp,
  varifyOtp,
  checkOtp,
  resetpass,
  writeNewpass,
  productPage,
  showProductetails,
  countResend,
  sortCategory,
  cart,
  showprofile,
  eitprofile,
  posteitprofile,
  searchprouct,
  pagination,
  sortproduct,
  dsortproduct
};
