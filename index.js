var mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalone:Fazil%401996@cluster0.kc1dqhf.mongodb.net/globalcycle");
const path = require("path");
const express = require("express");
const app = express();

const PORT = 3000
// making the folers public
app.use(express.static(path.join(__dirname, "public/user")));
app.use(express.static(path.join(__dirname, "public/admin")));
app.use(express.static(path.join(__dirname, "public/product")));

// console.log(path.join(__dirname,'public'));
const userRout = require("./routes/userRoutes");
const adminRout = require("./routes/adminRoutes");

app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache,private,no-store,must-revalidate");
  next();
});

app.use("/", userRout);
app.use("/admin", adminRout);

app.listen(PORT, () => {
  console.log(`server running on port no:${PORT}`);
});
