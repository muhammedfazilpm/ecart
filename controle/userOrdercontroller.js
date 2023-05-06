const orderDetails = require("../model/ordermodel");
const userdetails = require("../model/usermodel");
const productData = require("../model/productmodel");
const addressData = require("../model/addressmodel");
const wallet = require("../model/walletmodel");
const coupon = require("../model/couponModel");
const cart = require("../model/cartmodel");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");

// to show the orerdetaols in order page
const userorderDetails = async (req, res) => {
  try {
    const orderdetails = await orderDetails.find({
      userid: req.session.user_id,
    });

    res.render("orderpage", { orderdetails });
  } catch (error) {
    console.log(error);
  }
};
// to view the order details of order
const Orderview = async (req, res) => {
  try {
    const orderdetails = await orderDetails
      .findOne({ _id: req.query.id })
      .populate("product.productId");
    const products = orderdetails.product;
    res.render("vieworder", { products, orderdetails });
  } catch (error) {
    console.log(error);
  }
};

//  to cancel the the order
const orederreturn = async (req, res) => {
  try {
    id = req.query.id;
    const orderdetails = await orderDetails.findOne({ _id: id });
    const orderstatus = orderdetails.status;
    const ordermethod=orderdetails.paymentmethod

    if(ordermethod=="COD"&&orderstatus=="PLACED"){
      const cancelorder = await orderDetails.findByIdAndUpdate(
        id,
        { $set: { status: "CANCELED" } },
        { new: true }
      ); 

      res.redirect("/orderdetals");
    }
   else{
   if (orderstatus != "PAYMENTPENING") {
      const cancelorder = await orderDetails.findByIdAndUpdate(
        id,
        { $set: { status: "CANCELED" } },
        { new: true }
      ); 
  
      
   
      const totalamount1 = cancelorder.totalamount;
      const coupon=cancelorder.couponamount
      console.log(coupon);
      const totalamount=totalamount1-coupon
      const walletchange = await wallet.findOneAndUpdate(
        { user: req.session.user_id },
        { $inc: { walletbalance: totalamount } }
      );

      res.redirect("/orderdetals");
    } else {
      const cancelorder = await orderDetails.findByIdAndUpdate(
        id,
        { $set: { status: "CANCELED" } },
        { new: true }
      );}
      res.redirect("/orderdetals");
    }
    
  } catch (error) {
    console.log(error);
  }
};

// to return the deliverd product
const returnOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderreturn=await orderDetails.findOne({_id:id})  
    const walletreturn=orderreturn.totalamount-orderreturn.couponamount
    const walletchange = await wallet.findOneAndUpdate(
      { user: req.session.user_id },
      { $inc: { walletbalance: walletreturn } }
    );
    const returnOrder = await orderDetails.updateOne(
      { _id: id },
      { status: "ORDER RETURNED" }
    );
    res.redirect("/orderdetals");
  } catch (error) {
    console.log(error);
  }
};

// download invoice
const downloadinvoice = async (req, res) => {
  try {
    const id = req.query.id;
    const orderdetails = await orderDetails
      .findOne({ _id: id })
      .populate("product.productId");
    const orderData = orderdetails.product;
    const data = {
      report: orderdetails,
      data: orderData,
    };

    const filepath = path.resolve(__dirname, "../views/user/invoicepdf.ejs");
    const htmlstring = fs.readFileSync(filepath).toString();

    let option = {
      format: "A3",
    };

    const ejsData = ejs.render(htmlstring, data);
    pdf.create(ejsData, option).toFile("Invoice.pdf", (err, response) => {
      if (err) console.log(err);
      const filepath = path.resolve(__dirname, "../invoice.pdf");
      fs.readFile(filepath, (err, file) => {
        if (err) {
          console.log(err);
          return res.status(500).send("could not download file");
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attatchment;filename="Purchase Invoice.pdf"'
        );

        res.send(file);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

//for the option of buynow and render the check out page
const buyNow = async (req, res) => {
  try {
    const productdetails = await productData.findOne({ _id: req.query.id });

    const addressdata = await addressData.findOne({
      user: req.session.user_id,
    });
    const Total = productdetails.prize;

    res.render("buynowcheckout", { addressdata, productdetails, Total });
  } catch (error) {
    console.log(error);
  }
};

// for the post the details of checkout

const postCheckoutBuy = async (req, res) => {
  try {
    const address = req.body.address;
    const paymentMethod = req.body.paymentMethod;
    const prodcut = req.body.productdetails;
    if (paymentMethod == "COD") {
      const orderdetails1 = new orderDetails({
        deliverydetails: req.body.address,
        user: req.session.user_id,
        paymentmethod: paymentMethod,
        product: prodcut,
        totalamount: req.body.Total,
        date: Date.now(),
        status: "placed",
        userid: req.session.user_id,
      });

      const saveOrder = await orderdetails1.save();

      await cartData.deleteOne({ user: userData1._id });

      res.json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userorderDetails,
  Orderview,
  buyNow,
  postCheckoutBuy,
  downloadinvoice,
  orederreturn,
  returnOrder,
};
