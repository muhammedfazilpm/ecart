const orederData = require("../model/ordermodel");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const user = require("../model/usermodel");
const wallet = require("../model/walletmodel");

//to get the order details in to admin page
const getOrder = async (req, res) => {
  const orderdata = await orederData.find({});

  try {
    res.render("adminorder", { orderdata });
  } catch (error) {
    console.log(error);
  }
};
// to make the order into deliverd
const deliverOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const deliver = await orederData.updateOne(
      { _id: id },
      { $set: { status: "DELIVERD" } }
    );
    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};
//to make the status pending from admin side
const makepending = async (req, res) => {
  try {
    const pending = await orederData.findByIdAndUpdate(req.query.id, {
      status: "PENDING",
    });
    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};

// to make the pending order to place order
const placeOrder = async (req, res) => {
  try {
    const placeorder = await orederData.findByIdAndUpdate(req.query.id, {
      status: "PLACED",
    });
    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};
//to make the order status as cancel

const cancelOrder = async (req, res) => {
  try {
    const order = await orederData.find({ _id: req.query.id });
    const orderamount1 = order[0].totalamount;
    const user = order[0].userid;
    const orderamount = order[0].walletbalance;

    const walletdata = new wallet({
      user: user,
      walletbalance: orderamount,
    });

    const walletdatas = await walletdata.save();

    const placeorder = await orederData.findByIdAndUpdate(req.query.id, {
      status: "CANCELED",
    });
    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};
// to detailed view of the order
const vieworer = async (req, res) => {
  try {
    const details = await orederData
      .findOne({ _id: req.query.id })
      .populate("product.productId");
    const products = details.product;

    res.render("orderview", { details, products });
  } catch (error) {
    console.log(error);
  }
};

//to get the sales details
let orderdetails;
const getSales = async (req, res) => {
  try {
    orderdetails = await orederData
      .find({ status: { $ne: "CANCELED" } })
      .sort({ date: -1 });

    res.render("salesreport", { orderdetails });
  } catch (error) {
    console.log(error);
  }
};
// to sort the sales by date
const sortDateSale = async (req, res) => {
  try {
    const from = req.body.from;
    const to = req.body.to;
    orderdetails = await orederData
      .find({ status: { $ne: "CANCELED" }, date: { $gt: from, $lte: to } })
      .sort({ date: -1 });
    res.render("salesreport", { orderdetails });
  } catch (error) {
    console.log(error);
  }
};

// TO dOWNLOAD THE SALES REPORT

const download = async (req, res) => {
  try {
    const data = {
      report: orderdetails,
    };

    const filepath = path.resolve(
      __dirname,
      "../views/admin/salesreportpdf.ejs"
    );

    const htmlstring = fs.readFileSync(filepath).toString();

    let option = {
      format: "A3",
    };
    const ejsData = ejs.render(htmlstring, data);

    pdf.create(ejsData, option).toFile("salesreport.pdf", (err, response) => {
      if (err) console.log(err);

      const filepath = path.resolve(__dirname, "../salesReport.pdf");

      fs.readFile(filepath, (err, file) => {
        if (err) {
          console.log(err);
          return res.status(500).send("could not download file");
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attatchment;filename="sales Report.pdf"'
        );

        res.send(file);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getOrder,
  makepending,
  placeOrder,
  cancelOrder,
  getSales,
  download,
  vieworer,
  sortDateSale,
  deliverOrder,
};
