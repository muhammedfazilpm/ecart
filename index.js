var mongoose = require("mongoose");
<<<<<<< HEAD
let dotenv=require('dotenv')
dotenv.config()
console.log(process.env.MONGO_URL)
=======
mongoose.connect("");
>>>>>>> 3a7d4ce5b2cdc1ef8a93bf7f05f580ac5a85a4e3
const path = require("path");


mongoose.connect(process.env.MONGO_URL);
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
