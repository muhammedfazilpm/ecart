const express = require("express");
const rout = express();
const session = require("express-session");
const sessionSecret = "mysitesessionsecret";
const cartcontroller = require("../controle/cartcontroller");
const userOrdercontroller = require("../controle/userOrdercontroller");

rout.use(
  session({
    secret: sessionSecret,
    saveUninitialized: true,
    resave: false,
  })
);
const auth = require("../middleware/auth");

rout.set("view engine", "ejs");
rout.set("views", "./views/user");

rout.use(express.json());
rout.use(express.urlencoded({ extended: true }));

const userController = require("../controle/userControls");

//to get the registration form
rout.get("/register", auth.isLogout, userController.registerLoad);

//to get the otp page after posting of register and send it to mail
rout.post("/register", auth.isLogout, userController.veryfiyUser);

//to get the otp page after the entering of verify link in email
rout.get("/otp", auth.isLogout, userController.otppage);

//to check the otp enterd correct
rout.post("/otp", auth.isLogout, userController.login2);

//to get the login page
rout.get("/", auth.isLogout, userController.loadLogin);
rout.get("/login", auth.isLogout, userController.loadLogin);

//to enter the password an email and enter the home page
rout.post("/login", userController.varifyLogin);

//to render the home page
rout.get("/home", auth.isLogin, userController.loadHome);

//for logout
rout.get("/logout", auth.isLogin, userController.logoutHome);

//forget password and to get the window and post for send the otp
rout.get("/forget", auth.isLogout, userController.forget);
rout.post("/forget", auth.isLogout, userController.forgetOtp);

//to varify  the  otp and render the new password page
rout.get("/varifyOtp", auth.isLogout, userController.varifyOtp);
rout.post("/varifyOtp", auth.isLogout, userController.checkOtp);

//root for enter the new password and reset the password
rout.get("/resetpass", auth.isLogout, userController.resetpass);
rout.post("/resetpass", auth.isLogout, userController.writeNewpass);

//root for load product pages
rout.get("/product", auth.isLogin, userController.productPage);

// root for pagination
rout.get("/pagination", auth.isLogin, userController.pagination);

// for search the product
rout.post("/search", auth.isLogin, userController.searchprouct);

// for sort by prize
rout.get("/sort", auth.isLogin, userController.sortproduct);
// for the sort oposit oreder
rout.get("/desort", auth.isLogin, userController.dsortproduct);

//root for see the product view
rout.get("/view-products", auth.isLogin, userController.showProductetails);

//Root to resend otp after countdown
rout.get("/resend", auth.isLogin, userController.countResend);

//Root to get  the catogary page list
rout.get("/category", auth.isLogin, userController.sortCategory);

//ROOT SHOW THE USER PROFILE DETAILS
rout.get("/myprofile", auth.isLogin, userController.showprofile);

// for edit the user profile

rout.get("/editprofile", auth.isLogin, userController.eitprofile);

//to post the edited details
rout.post("/editprofile", auth.isLogin, userController.posteitprofile);



// ------------------------------------cart route----------------------------------------------------------------------------------------------------


//to show the cart page
rout.get("/cart", auth.isLogin, cartcontroller.getCart);

//for the use of cart sending the data to database contain the id of product and user
rout.post("/addtocart", auth.isLogin, cartcontroller.addtoCart);

//root for checkout
rout.get("/checkout", auth.isLogin, cartcontroller.Checkout);

//root for the order placement post the check out
rout.post("/checkout", auth.isLogin, cartcontroller.postCheckout);

//to add a new address for checck out
rout.get("/addadress", auth.isLogin, cartcontroller.addAddress);

//to post address of the address field
rout.post("/addadress", auth.isLogin, cartcontroller.postAddress);

// to remove a item from cart
rout.post("/removeCart", auth.isLogin, cartcontroller.removeItem);

rout.post("/countIncrees", auth.isLogin, cartcontroller.countincrees);

rout.post("/verifyPayment", auth.isLogin, cartcontroller.verifyOnlinePayment);

// for order controller
rout.get("/orderSuccess", auth.isLogin, cartcontroller.ordersuccess);

// for delete address

rout.get("/deleteadress", auth.isLogin, cartcontroller.deleteddress);

//to get the edit address route
rout.get("/editadress", auth.isLogin, cartcontroller.editaddress);

// to post the the edited address
rout.post("/editadress", auth.isLogin, cartcontroller.updateeditaddress);

// to check the coupon is valid or not
rout.post("/couponcheck", auth.isLogin, cartcontroller.checkcoupon);



// --------------------------------------------order routes------------------------------------------------------------------------------



// to get the order page as order list
rout.get("/orderdetals", auth.isLogin, userOrdercontroller.userorderDetails);

//to get the detailes of order product
rout.get("/vieworder", auth.isLogin, userOrdercontroller.Orderview);

// to cancel the order
rout.get("/return", auth.isLogin, userOrdercontroller.orederreturn);

// to return the delivered product
rout.get("/retunorder", auth.isLogin, userOrdercontroller.returnOrder);

// for get and print the invoice

rout.get("/invoice", auth.isLogin, userOrdercontroller.downloadinvoice);

// for the direct buy option
rout.get("/buyNow", auth.isLogin, userOrdercontroller.buyNow);

//  root for the directbuy page
rout.post("/checkoutbuynow", userOrdercontroller.postCheckoutBuy);

module.exports = rout;
