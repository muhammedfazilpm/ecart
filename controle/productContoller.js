const Cat = require("../model/catogaryModel");

const pData = require("../model/productmodel");
const sharp = require("sharp");
const fs = require("fs");
const imgurUploader = require("imgur-uploader");
const path = require("path");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: "469946896698292",
  api_secret:process.env.api_secret
});

//for loading of product page
const productPage = async (req, res) => {
  const productData = await pData.find();
  try {
    res.render("product", { products: productData });
    console.log(products);
  } catch (error) {
    console.log();
  }
};

//to add new product

const addProdut = async (req, res) => {
  const catDatas = await Cat.find({ blocked: false });

  try {
    res.render("addproduct", { catDatas });
  } catch (error) {
    console.log(error);
  }
};

//to post it in to database

const postProduct = async (req, res) => {
  try {
    const img = [];
    cloudcdn=[]
    for (let i = 0; i < req.files.length; i++) {
      img.push(req.files[i].filename);
      await sharp("./public/product/img/" + req.files[i].filename)
        .resize(300, 200)
        .toFile("./public/product/images/" + req.files[i].filename);

        const data= await cloudinary.uploader.upload("./public/product/images/" + req.files[i].filename)
        cloudcdn.push(data.secure_url)
    }

    const data = new pData({
      name: req.body.name,
      catogary: req.body.catogary,
      Quantity: req.body.stock,
      image: cloudcdn,
      prize: req.body.prize,
      description: req.body.description,
    });
    const proData = await data.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};

//to delete product
const delProduct = async (req, res) => {
  const del = await pData.findById({ _id: req.query.id });

  try {
    await pData.deleteOne({ _id: req.query.id });
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};

//to block products

const blockproduct = async (req, res) => {
  const d = await pData.findById({ _id: req.query.id });

  try {
    if (d.blocked == 0) {
      await pData.updateOne({ _id: req.query.id }, { $set: { blocked: 1 } });
      res.redirect("/admin/product");
    } else {
      await pData.updateOne({ _id: req.query.id }, { $set: { blocked: 0 } });
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error);
  }
};
const editProduct = async (req, res) => {
  try {
    const edit = await pData.findById({ _id: req.query.id });
    const cat = await Cat.find();
    res.render("editproduct", { edit, cat });
  } catch (error) {
    console.log(error);
  }
};
const posteditProduct = async (req, res) => {
  const img = [];
  const cloudcdn=[]
  try {
    if (req.files.length != 0) {
      for (let i = 0; i < req.files.length; i++) {
        

        await sharp("./public/product/img/" + req.files[i].filename)
          .resize(300, 200)
          .toFile("./public/product/images/" + req.files[i].filename);
          const data= await cloudinary.uploader.upload("./public/product/images/" + req.files[i].filename)
        cloudcdn.push(data.secure_url)
      }

      const productData2 = await pData.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            catogary: req.body.catogary,
            Quantity: req.body.Quantity,
            prize: req.body.prize,
          },
        }
      );
      for (let i = 0; i < req.files.length; i++) {
        const dataa = await pData.findByIdAndUpdate(
          { _id: req.body.id },
          { $push: { image: cloudcdn } }
        );
      }
      res.redirect("/admin/product");
    } else {
      const productData2 = await pData.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            catogary: req.body.catogary,
            Quantity: req.body.Quantity,
            prize: req.body.prize,
          },
        }
      );
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error);
  }
};

// to delete the unwanted images while editing

const deleteImage = async (req, res) => {
  const deleteimg = await pData.findOneAndUpdate(
    { image: req.query.id },
    { $pull: { image: req.query.id } }
  );

  res.redirect("/admin/product");
  try {
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  productPage,
  addProdut,
  postProduct,
  delProduct,
  blockproduct,
  editProduct,
  posteditProduct,
  deleteImage,
};
