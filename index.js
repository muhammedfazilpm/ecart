var mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/eCommerce");
const path = require("path");
const express = require("express");
const app = express();

const PORT = 8080;
// making the folers public
app.use(express.static(path.join(__dirname, "public/user")));
app.use(express.static(path.join(__dirname, "public/admin")));
app.use(express.static(path.join(__dirname, "public/product")));

// console.log(path.join(__dirname,'public'));
const userRout = require("./routes/user_routes");
const adminRout = require("./routes/admin _Routes");

app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache,private,no-store,must-revalidate");
  next();
});

app.use("/", userRout);
app.use("/admin", adminRout);

app.listen(PORT, () => {
  console.log(`server running on port no:${PORT}`);
});
