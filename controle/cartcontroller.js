const cartData = require("../model/cartmodel");
const productData = require("../model/productmodel");
const userData = require("../model/usermodel");
const addressData = require("../model/addressmodel");
const orderDatas = require("../model/ordermodel");
const wallet = require("../model/walletmodel");
const coupon = require("../model/couponModel");
const { default: mongoose } = require("mongoose");
const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_zm2sqh9UiAQ8QG",
  key_secret: "Qy89CcneisBJHA1WHZZB4C3I",
});
let products;
let Total;
let orderstatus;
const addtoCart = async (req, res) => {
  try {
    //finding the id of product and user
    const productId = req.body.id;
    const UserId = await userData.findOne({ _id: req.session.user_id });

    //database checking
    const productDatas = await productData.findById(productId);
    const Usercart = await cartData.findOne({ user: UserId });

    if (Usercart) {
      //checking cart prodcut avaliable
      const productavaliable = await Usercart.product.findIndex(
        (product) => product.productId == productId
      );

      if (productavaliable != -1) {
        //if have product in cart the qnty increse
        await cartData.findOneAndUpdate(
          { user: UserId, "product.productId": productId },
          { $inc: { "product.$.quantity": 1 } }
        );

        res.json({ success: true });
      } else {
        //if no product in cart add product
        await cartData.findOneAndUpdate(
          { user: UserId },
          {
            $push: {
              product: { productId: productId, price: productDatas.prize },
            },
          }
        );
        res.json({ success: true });
      }
    } else {
      const CartDatas = new cartData({
        user: UserId._id,
        product: [
          {
            productId: productId,
            price: productDatas.prize,
          },
        ],
      });
      const cartDatas = await CartDatas.save();
      if (cartDatas) {
        res.json({ success: true });
      } else {
        res.redirect("/home");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// to load the cart and show the cart detail
const getCart = async (req, res) => {
  try {
    // const data =await productDB.find()
    const userd = await userData.findOne({ _id: req.session.user_id });
    const id = req.session.user_id;

    const cartDatas = await cartData
      .findOne({ user: req.session.user_id })
      .populate("product.productId");

    if (cartDatas != null) {
      products = cartDatas.product;

      if (products.length <= 0) {
        products = 1;
      }
    } else {
      products = 1;
    }

    if (cartDatas) {
      if (cartDatas.product.length > 0) {
        const total = await cartData.aggregate([
          { $match: { user: userd._id } },

          { $unwind: "$product" },

          {
            $project: {
              price: "$product.price",
              quantity: "$product.quantity",
            },
          },

          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
          },
        ]);

        Total = total[0].total;

        const useRID = userd._id;

        res.render("cart", {
          user: userd.name,
          products: products,
          Total,
          useRID,
          cartDatas,
        });
      } else {
        res.render("cart", { user: userd.name });
      }
    } else {
      const userd = await userData.findOne({ _id: req.session.user_id });

      res.render("cart", { products: products, user: userd.name, Total: 0 });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const Checkout = async (req, res) => {
  const user = req.session.user_id;
  const addressdata = await addressData.findOne({ user: user });
  const walletamount = await wallet.findOne({ user: user });
  const discount = 0;
 const date=Date.now()
 
  const Coupons=await coupon.find({maxcount:{$gt:0},user:{$nin:user}})
 
  try {
    res.render("checkout", {
      addressdata,
      Total,
      walletamount,
      discount,
      Coupons,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
};
//to get the adress fiel to fill the address
const addAddress = async (req, res) => {
  try {
    res.render("address");
  } catch (error) {
    console.log(error);
  }
};

//to post the address in to the database

const postAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    const userexist = await addressData.findOne({ user: user });
    if (userexist) {
      const user = req.session.user_id;
      await addressData.updateOne(
        { user: user },
        {
          $push: {
            address: {
              name: req.body.name,
              lastname: req.body.lastname,
              pin: req.body.pin,
              phone: req.body.phone,
              place: req.body.place,
              fulladdress: req.body.fulladdress,
            },
          },
        }
      );
    } else {
      const address = new addressData({
        user: req.session.user_id,
        address: [
          {
            name: req.body.name,
            lastname: req.body.lastname,
            pin: req.body.pin,
            phone: req.body.phone,
            place: req.body.place,
            fulladdress: req.body.fulladdress,
          },
        ],
      });
      const addressdata2 = await address.save();
    }
    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

//to proceed checkout with details of payment mode user and cart details
const postCheckout = async (req, res) => {
  try {
    const userData1 = await userData.findOne({ _id: req.session.user_id });
    //CHECKING THE MODE OF PAYMENT AND ASSIGN THE ORDER STATUS
    if (req.body.paymentMethod == "COD") {
      orderstatus = "PLACED";
    } else if ((req.body.paymentMethod = "ONLINE")) {
      orderstatus = "PAYMENTPENING";
    } else {
      orderstatus = "PENDING";
    }

    const userexist = await orderDatas.findOne({ userid: req.session.user_id });
    // TO CHECK THE USER IS EXIS OR NOT
    if (userexist) {
      if (orderstatus == "PLACED") {
        const cartData1 = await cartData.findOne({ user: userData1._id });

        const walletdata = await wallet.findOne({ user: req.session.user_id });
        const walletbalance = walletdata.walletbalance;
        if (walletbalance == 0) {
          var paidamount1 = Total - req.body.discount;
        } else if (walletbalance >= Total) {
          const total = Total - req.body.discount;
          const decwallet = await wallet.findOneAndUpdate(
            { user: req.session.user_id },
            { $inc: { walletbalance: -total } }
          );

          paidamount1 = 0;
        } else {
          const decwallet = await wallet.findOneAndUpdate(
            { user: req.session.user_id },
            { $inc: { walletbalance: -walletbalance } }
          );
          paidamount1 = Total - walletbalance - req.body.discount;
        }

        const productData = cartData1.product;

        const orderdetails = new orderDatas({
          deliverydetails: req.body.address,
          user: userData1.name,
          paymentmethod: req.body.paymentMethod,
          product: productData,
          totalamount: Total,
          date: Date.now(),
          status: orderstatus,
          userid: req.session.user_id,
          paidamount: paidamount1,
          couponamount: req.body.discount
        });

        const saveOrder = orderdetails.save();
        await cartData.deleteOne({ user: userData1._id });

        res.json({ success: true });

        // TO CHECK THE IS THAT ONLINE PAYMENT
      } else if (orderstatus == "PAYMENTPENING") {
        const cartData1 = await cartData.findOne({ user: userData1._id });

        const walletdata = await wallet.findOne({ user: req.session.user_id });
        const walletbalance = walletdata.walletbalance;
        if (walletbalance == 0) {
          var paidamount1 = Total - req.body.discount;
        } else if (walletbalance >= Total) {
          const total = Total - req.body.discount;
          const decwallet = await wallet.findOneAndUpdate(
            { user: req.session.user_id },
            { $inc: { walletbalance: -total } }
          );

          paidamount1 = 1;
        } else {
          const decwallet = await wallet.findOneAndUpdate(
            { user: req.session.user_id },
            { $inc: { walletbalance: -walletbalance } }
          );
          paidamount1 = Total - walletbalance - req.body.discount;
        }

        const productData = cartData1.product;

        const orderdetails = new orderDatas({
          deliverydetails: req.body.address,
          user: userData1.name,
          paymentmethod: req.body.paymentMethod,
          product: productData,
          totalamount: Total,
          date: Date.now(),
          status: orderstatus,
          userid: req.session.user_id,
          paidamount: paidamount1,
          couponamount: req.body.discount,
        });

        const saveOrder = await orderdetails.save();
        await cartData.deleteOne({ user: userData1._id });

        // PAYMENT INSTANCE FOR RAZORPAY---------------

        const orderid = saveOrder._id;
        const totalamount = saveOrder.paidamount;
        var options = {
          amount: totalamount * 100,
          currency: "INR",
          receipt: "" + orderid,
        };

        instance.orders.create(options, function (err, order) {
          console.log("after the send data");

          res.json({ order });
        });
      }
    }

    // IF USER NOT EXIST AND COD ,ONLINE PAYMENT DONE

    //for cash on delivery
    else if (orderstatus == "PLACED") {
      const cartData1 = await cartData.findOne({ user: userData1._id });

      const productData = cartData1.product;

      const orderdetails = new orderDatas({
        deliverydetails: req.body.address,
        user: userData1.name,
        paymentmethod: req.body.paymentMethod,
        product: productData,
        totalamount: Total,
        date: Date.now(),
        status: orderstatus,
        userid: req.session.user_id,
      });

      const saveOrder = await orderdetails.save();
      await cartData.deleteOne({ user: userData1._id });
      res.json({ success: true });
    }

    //for onlinepayment if user not exist
    else if (orderstatus == "PAYMENTPENING") {
      const cartData1 = await cartData.findOne({ user: userData1._id });

      const productData = cartData1.product;

      const orderdetails = new orderDatas({
        deliverydetails: req.body.address,
        user: userData1.name,
        paymentmethod: req.body.paymentMethod,
        product: productData,
        totalamount: Total,
        date: Date.now(),
        status: orderstatus,
        userid: req.session.user_id,
      });

      const saveOrder = await orderdetails.save();
      await cartData.deleteOne({ user: userData1._id });
      const orderid = saveOrder._id;
      const totalamount = saveOrder.totalamount;
      var options = {
        amount: totalamount * 100,
        currency: "INR",
        receipt: "" + orderid,
      };

      instance.orders.create(options, function (err, order) {
        console.log("after the send data");
        console.log(order);
        res.json({ order });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// ---------------------TO VERIFYONLINE PAYMENT-------------------------------------------------------
const verifyOnlinePayment = async (req, res) => {
  try {
    const details = req.body;
    console.log(details);
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "Qy89CcneisBJHA1WHZZB4C3I");
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );

    hmac = hmac.digest("hex");
    console.log(hmac);

    console.log(details.payment.razorpay_signature);

    if (hmac == details.payment.razorpay_signature) {
      console.log("test444");

      await orderDatas.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "PLACED" } }
      );
      await orderDatas.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentid: details.payment.razorpay_payment_id } }
      );
      await cartData.deleteOne({ user: req.session.user_id });
      res.json({ success: true });
    } else {
      await order.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ----------------------------------------------------------------------------
// to remove a item from cart

const removeItem = async (req, res) => {
  try {
    const removeCart = await cartData.updateOne(
      { user: req.session.user_id },
      { $pull: { product: { productId: req.body.productId } } }
    );
    const cartdata = await cartData.find({ user: req.session.user_id });
    if (cartdata[0].product.length > 0) {
      res.json({ status: true });
    } else {
      const delet = await cartData.deleteOne({ user: req.session.user_id });
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error);
  }
};

//to increment the count of product
const countincrees = async (req, res) => {
  try {
    if (req.body.count == 1) {
      const decproduct = await cartData.updateOne(
        { user: req.session.user_id, "product._id": req.body.id },
        { $inc: { "product.$.quantity": req.body.count } }
      );
      res.json({ success: true });
    } else if (req.body.quantity > 1) {
      const decproduct = await cartData.updateOne(
        { user: req.session.user_id, "product._id": req.body.id },
        { $inc: { "product.$.quantity": req.body.count } }
      );

      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
const ordersuccess = async (req, res) => {
  try {
    res.render("ordersuccess");
  } catch (error) {
    console.log(error);
  }
};

//for the option of buynow
const buyNow = async (req, res) => {
  try {
    const productdetails = await productData.findOne({ _id: req.query.id });

    const addressdata = await addressData.findOne({
      user: req.session.user_id,
    });

    res.render("buynowcheckout", { addressdata, productdetails });
  } catch (error) {
    console.log(error);
  }
};
//for delete the address
const deleteddress = async (req, res) => {
  try {
    console.log(req.session.user_id);
    const address = await addressData.updateOne(
      { user: req.session.user_id },
      { $pull: { address: { _id: req.query.id } } }
    );

    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};
// for edit address
const editaddress = async (req, res) => {
  try {
    const result = await addressData.findOne({
      "address._id": new mongoose.Types.ObjectId("" + req.query.id),
    });
    const matchaddress = result.address.filter((address) =>
      address._id.equals("" + req.query.id)
    );

    res.render("addressedit", { matchaddress });
  } catch (error) {
    console.log(error);
  }
};

// to update edited address
const updateeditaddress = async (req, res) => {
  try {
    const result = await addressData.findOneAndUpdate(
      {
        "address._id": new mongoose.Types.ObjectId("" + req.body.id),
      },
      {
        $set: {
          address: {
            name: req.body.name,
            lastname: req.bodylastname,
            pin: req.body.pin,
            phone: req.body.phone,
            place: req.body.place,
            fulladdress: req.body.fulladdress,
          },
        },
      }
    );

    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

// to check the coupon exist or not
const checkcoupon = async (req, res) => {
  const user = req.session.user_id;
  const Coupons=await coupon.find({maxcount:{$gt:0},user:{$nin:user}})
  try {
    const coupons = req.body.coupon;
    const coupondatas = await coupon.findOne({ code: coupons });
    if (coupondatas != null) {
      var maxcount1 = coupondatas.maxcount;
      var status1 = coupondatas.status;
      var maxicartamount = coupondatas.maxcartamount;
    }
    else{
      res.redirect("/checkout")
    }
   
    const addressdata = await addressData.findOne({ user: user });
    const walletamount = await wallet.findOne({ user: user });
    if (
      coupondatas != null &&
      maxcount1 != 0 &&
      status1 &&
      Total >= maxicartamount
    ) {
      const discount = coupondatas.discountAmount;
      const updatecoupon = await coupon.updateOne(
        { code: coupons },
        { $push: { user: req.session.user_id } }
      );
      const updateamount = await coupon.findOneAndUpdate(
        { code: coupons },
        { $inc: { maxcount: -1 } }
      );
     
      res.render("checkout", {
        addressdata,
        Total,
        walletamount,
        discount,
        message: "COUPON ADDED",
        Coupons
      });
    } else {
     console.log(coupondatas.maxcount);
      if(coupondatas.maxcount==0){
        const deletezero=await coupon.deleteMany({maxcount:0})
        console.log("hii");
      }
      else{
        console.log("helo");
      }
      const discount = 0;
      res.render("checkout", {
        addressdata,
        Total,
        walletamount,
        discount,
        Coupons,
        message: "CHECK YOUR COUPON CODE OR CART AMOUNT",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addtoCart,
  getCart,
  Checkout,
  addAddress,
  postAddress,
  postCheckout,
  removeItem,
  countincrees,
  verifyOnlinePayment,
  ordersuccess,
  deleteddress,
  editaddress,
  updateeditaddress,
  checkcoupon,
};
