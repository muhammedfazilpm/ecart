const express = require("express");

const rout = express();
const session = require("express-session");
const sessionSecret = "mysitesessionsecret";
const cartcontroller=require("../controle/cartcontroller")

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
rout.post("/register", userController.veryfiyUser);

//to get the otp page after the entering of verify link in email
rout.get("/otp", auth.isLogout, userController.otppage);

//to check the otp enterd correct
rout.post("/otp", userController.login2);

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
rout.post("/forget", userController.forgetOtp);

//to varify  the  otp and render the new password page
rout.get("/varifyOtp", auth.isLogout, userController.varifyOtp);
rout.post("/varifyOtp", userController.checkOtp);

//root for enter the new password and reset the password
rout.get("/resetpass", auth.isLogout, userController.resetpass);
rout.post("/resetpass", userController.writeNewpass);

//root for load product pages
rout.get("/product", auth.isLogin, userController.productPage);

//root for see the product view
rout.get("/view-products", auth.isLogin, userController.showProductetails);

//Root to resend otp after countdown
rout.get("/resend", userController.countResend);


//Root to get  the catogary page list
rout.get("/category", userController.sortCategory);


//ROOT SHOW THE USER PROFILE DETAILS
rout.get("/myprofile", userController.showprofile);






// ----------------------------------------------------------------------------------------------------------------------------------------
//to show the cart page
rout.get("/cart", cartcontroller.getCart);


//for the use of cart sending the data to database contain the id of product and user 
 rout.post("/addtocart",cartcontroller.addtoCart)


 //root for checkout
 rout.get("/checkout", cartcontroller.Checkout);


 //root for the order placement post the check out
 rout.post("/checkout", cartcontroller.postCheckout);
 

  
//to add a new address for checck out
rout.get("/addadress", cartcontroller.addAddress);

//to post address of the address field
rout.post("/addadress", cartcontroller.postAddress);



module.exports = rout;
