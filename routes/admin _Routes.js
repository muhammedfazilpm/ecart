const express = require("express");
const adminRout = express();
const session = require("express-session");
const sessionSecret = "adminsessionsecret";
const path = require("path");
const multer=require("../middleware/multer")

adminRout.use(
  session({
    secret: sessionSecret,
    saveUninitialized: true,
    resave: false,
  })
);

const adminauth = require("../middleware/adminauth");

adminRout.use(express.json());
adminRout.use(express.urlencoded({ extended: true }));

adminRout.set("view engine", "ejs");
adminRout.set("views", "./views/admin");

const adminController = require("../controle/adminController");
const productContoller = require("../controle/productContoller");
const adminordercontroller = require("../controle/adminordercontroller");

adminRout.get("/", adminauth.isadminLogout, adminController.loadLogin);

adminRout.post("/", adminController.varifyLogin);
adminRout.get("/home", adminauth.isadminLogin, adminController.home);

//to show the user details
adminRout.get("/user", adminauth.isadminLogin, adminController.loadUser);

//to block and unblock the user
adminRout.get("/block-user", adminauth.isadminLogin, adminController.blockUser);

// to show the catogary page

adminRout.get("/catogary", adminauth.isadminLogin, adminController.loadCat);

//to add the catogary and show the winodow

adminRout.get("/addcatogary", adminauth.isadminLogin, adminController.addCat);

//to add new catogary after enering the button POST catogary
adminRout.post("/addcatogary", adminauth.isadminLogin, adminController.postCat);

//to delete the catogary
adminRout.get(
  "/delete-catogary",
  adminauth.isadminLogin,
  adminController.deletecat
);

//to edit the catogary name
adminRout.get(
  "/edit-catogary",
  adminauth.isadminLogin,
  adminController.editcat
);

// to post the edit catogary
adminRout.post(
  "/edit-catogary",
  adminauth.isadminLogin,
  adminController.postedit
);

// to block the catogary

adminRout.get(
  "/block-catogary",
  adminauth.isadminLogin,
  adminController.blockcat
);

//to unblock catogary
adminRout.get(
  "/unblock-catogary",
  adminauth.isadminLogin,
  adminController.blockcat
);

//to logout the section

adminRout.get("/alogout", adminauth.isadminLogout, adminController.adminLogout);

//to loadd the dashboard
adminRout.get("/Dashboard", adminauth.isadminLogin, adminController.dashBoard);

// to get the coupon page
adminRout.get("/coupon", adminauth.isadminLogin, adminController.getCoupon);

// to get the add coupon page
adminRout.get(
  "/addcoupon",
  adminauth.isadminLogin,
  adminController.getaddCoupon
);

//to post the addcoupon
adminRout.post(
  "/addcoupon",
  adminauth.isadminLogin,
  adminController.postCoupon
);

// edit coupon
adminRout.get("/editcopon", adminauth.isadminLogin, adminController.editcoupon);

// to post the edit
adminRout.post(
  "/editcopon",
  adminauth.isadminLogin,
  adminController.posteditcoupon
);

// to delete post
adminRout.post(
  "/deletecoupon",
  adminauth.isadminLogin,
  adminController.deleteCoupon
);

//-------------------product route------------------------------------------------

// starting the product route

adminRout.get("/product", adminauth.isadminLogin, productContoller.productPage);

//to get the  product adding page
adminRout.get(
  "/addproduct",
  adminauth.isadminLogin,
  productContoller.addProdut
);

//to post the product details in data base
adminRout.post(
  "/addproduct",
  multer.upload.array("image"),
  productContoller.postProduct
);

//to delete the product
adminRout.get(
  "/delete-product",
  adminauth.isadminLogin,
  productContoller.delProduct
);

//to block products
adminRout.get(
  "/block-product",
  adminauth.isadminLogin,
  productContoller.blockproduct
);
adminRout.get(
  "/unblock-product",
  adminauth.isadminLogin,
  productContoller.blockproduct
);

//to edit product
adminRout.get(
  "/edit-product",
  adminauth.isadminLogin,
  productContoller.editProduct
);
adminRout.post(
  "/edit-product",
  multer.upload.array("image"),
  productContoller.posteditProduct
);

// to delete the one image
adminRout.get(
  "/deleteone",
  adminauth.isadminLogin,
  productContoller.deleteImage
);

//-------------------------------------for order management---------------------------------------------------------------------
//to get the order details to admin page
adminRout.get("/order", adminauth.isadminLogin, adminordercontroller.getOrder);

// TO MAKE THE COD INTO DELIVER
adminRout.get(
  "/deliver",
  adminauth.isadminLogin,
  adminordercontroller.deliverOrder
);

// to get the salesreport
adminRout.get(
  "/salesreport",
  adminauth.isadminLogin,
  adminordercontroller.getSales
);

// root to make the sales report to sort
adminRout.post(
  "/sortdate",
  adminauth.isadminLogin,
  adminordercontroller.sortDateSale
);

//to download the sales report
adminRout.get(
  "/download",
  adminauth.isadminLogin,
  adminordercontroller.download
);

// to make the order pending
adminRout.get(
  "/makepending",
  adminauth.isadminLogin,
  adminordercontroller.makepending
);

//to make the order place
adminRout.get(
  "/placeOredr",
  adminauth.isadminLogin,
  adminordercontroller.placeOrder
);

//to make the order status cancel
adminRout.get(
  "/cancelorder",
  adminauth.isadminLogin,
  adminordercontroller.cancelOrder
);

// to show the detailed view of a order
adminRout.get(
  "/vieworder",
  adminauth.isadminLogin,
  adminordercontroller.vieworer
);

module.exports = adminRout;
