
const express=require('express')
const adminRout=express()
const session=require('express-session')
const sessionSecret='adminsessionsecret'
const multer=require('multer')
const path=require('path')

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/product/images'))
        
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname
        cb(null,name)

    }
})
const upload=multer({storage:storage})


adminRout.use(session({
    secret:sessionSecret,
    saveUninitialized:true,
    resave:false
}))

const adminauth=require("../middleware/adminauth")




adminRout.use(express.json())
adminRout.use(express.urlencoded({extended:true}))



adminRout.set('view engine','ejs')
adminRout.set('views','./views/admin')


const adminController=require("../controle/adminController")
const productContoller=require("../controle/productContoller")
const adminordercontroller=require("../controle/adminordercontroller")

adminRout.get('/',adminauth.isadminLogout, adminController.loadLogin)

adminRout.post('/',adminController.varifyLogin)
adminRout.get('/home',adminauth.isadminLogin, adminController.home)



//to show the user details
adminRout.get('/user',adminauth.isadminLogin, adminController.loadUser)

//to block and unblock the user
adminRout.get('/block-user',adminauth.isadminLogin,adminController.blockUser)

// to show the catogary page

adminRout.get('/catogary',adminauth.isadminLogin,adminController.loadCat)

//to add the catogary and show the winodow

adminRout.get('/addcatogary',adminauth.isadminLogin,adminController.addCat)

//to add new catogary after enering the button POST catogary
adminRout.post('/addcatogary',adminController.postCat)

//to delete the catogary
adminRout.get('/delete-catogary',adminauth.isadminLogin,adminController.deletecat)

// to block the catogary

adminRout.get('/block-catogary',adminauth.isadminLogin,adminController.blockcat)

//to unblock catogary
adminRout.get('/unblock-catogary',adminauth.isadminLogin,adminController.blockcat)


//to logout the section

adminRout.get('/alogout',adminauth.isadminLogout,adminController.adminLogout)

//to loadd the dashboard
adminRout.get('/Dashboard',adminController.dashBoard)


//--------------------------------------------------------------------------------------------
    


//PRODUCT ROUTE                



// starting the product route

adminRout.get('/product',productContoller.productPage)

//to get the  product adding page
adminRout.get('/addproduct',productContoller.addProdut)


//to post the product details in data base
adminRout.post('/addproduct',upload.array('image'), productContoller.postProduct)


//to delete the product
adminRout.get('/delete-product',productContoller.delProduct)


//to block products
adminRout.get('/block-product',productContoller.blockproduct)
adminRout.get('/unblock-product',productContoller.blockproduct)

//to edit product
adminRout.get('/edit-product',productContoller.editProduct)
adminRout.post('/edit-product',upload.array('image'),productContoller.posteditProduct)


//-------------------------------------for order management---------------------------------------------------------------------
//to get the order details to admin page
adminRout.get('/order',adminordercontroller.getOrder)
 
// to make the order pending
adminRout.get('/makepending',adminordercontroller.makepending)

//to make the order place
adminRout.get('/placeOredr',adminordercontroller.placeOrder)

//to make the order status cancel
adminRout.get('/cancelorder',adminordercontroller.cancelOrder)



module.exports=adminRout
