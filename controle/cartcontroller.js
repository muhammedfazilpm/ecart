const cartData=require("../model/cartmodel")
const productData=require("../model/productmodel")
const userData=require("../model/usermodel")
const addressData=require("../model/addressmodel")
const orderDatas=require("../model/ordermodel")
let products;
let Total;
let orerstatus
const addtoCart =async (req,res)=>{
    try {

        //finding the id sof product and user
        const productId= req.body.id
        const UserId= await userData.findOne({_id:req.session.user_id})
       
       
        //database checking
        const productDatas = await productData.findById(productId)
        const Usercart =await cartData.findOne({user:UserId})
      
        if(Usercart) {

         
            //checking cart prodcut avaliable
            const productavaliable = await Usercart.product.findIndex( product => product.productId == productId)
           
          
            if(productavaliable != -1){
               
                //if have product in cart the qnty increse
                await cartData.findOneAndUpdate({user : UserId, "product.productId" : productId},{$inc : {"product.$.quantity" : 1}})
              
                res.json({success:true})
                
            }else{
               

                //if no product in cart add product
                await cartData.findOneAndUpdate({user : UserId},{$push : {product:{productId : productId, price : productDatas.prize}}})
                res.json({success:true})
            }

        }else{
            const CartDatas =new cartData({
                user:UserId._id,
                product:[{
                    productId:productId,
                    price:productDatas.prize
                }]

            })
            const cartDatas=await CartDatas.save();
            if(cartDatas){
                res.json({success:true})
            }else{
                res.redirect('/home')
            }
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}


// to load the cart and show the cart detail 
const getCart = async(req,res)=>{
    try {
        
        // const data =await productDB.find()
        const userd=await userData.findOne({_id:req.session.user_id})
        const id =req.session.user_id
      
        const cartDatas=await cartData.findOne({user:req.session.user_id}).populate('product.productId')
 if(cartDatas!=null){
         products=cartDatas.product
      
 }
 else{
  
     products=1
    
 }
 
    
        if(cartDatas){
           
          
            if(cartDatas.product.length>0){
                
                const total = await cartData.aggregate([{$match:{user:userd._id}},

                    {$unwind:"$product"},

                    {$project:{price:"$product.price",quantity:"$product.quantity"}},

                    {$group:{_id:null,total:{$sum:{$multiply:["$price","$quantity"]}}}}]);

                    console.log('cart data taken');
                  
                   
                    Total= total[0].total;
                     

                    const useRID=userd._id
            
                    res.render('cart',{user:userd.name,products:products, Total,useRID})
            }else{
             

                res.render('cart',{user:userd.name,message:"hi"})
            }

        }else{
        
            const userd=await userData.findOne({_id:req.session.user_id})
            res.render('cart',{products:products,user:userd.name,Total:0})
        }

        
        
    } catch (error) {
       
        console.log(error.message);
        
    }
}
const Checkout=async(req,res)=>{
    const user=req.session.user_id
    const addressdata=await addressData.findOne({user:user})
    try {
        res.render("checkout",{addressdata})
        
    } catch (error) {
        console.log(error);
        
    }
}
//to get the adress fiel to fill the address
const addAddress=async(req,res)=>{
   

    try {
        res.render("address")
     
        
    } catch (error) {
        
        console.log(error);
    }
}

//to post the address in to the database

const postAddress=async(req,res)=>{
    try {
        const user=req.session.user_id
       const userexist=await addressData.findOne({user:user})
       if(userexist){
        const user=req.session.user_id
        await  addressData.updateOne({user:user},{$push:{address:{ name:req.body.name, lastname:req.body.lastname, pin:req.body.pin, phone:req.body.phone,  place:req.body.place, fulladdress:req.body.fulladdress,}}})
       }
       else{
        const address=new addressData({
            user:req.session.user_id,
            address:[{
            name:req.body.name,
            lastname:req.body.lastname,
            pin:req.body.pin,
            phone:req.body.phone,
            place:req.body.place,
            fulladdress:req.body.fulladdress,

            }]
        })
        const addressdata2=await address.save()
    }
        res.redirect("/checkout")
    } catch (error) {
       
        console.log(error);
        
    }
}

//to proceed checkout with details of payment mode user and cart details
const postCheckout=async(req,res)=>{
    try {
   

        const userData1=await userData.findOne({_id:req.session.user_id})
 
       if(req.body.paymentMethod=="COD")
       {
        orerstatus="PLACED"
       }
       else{
        orerstatus="PENDING"
       }
          if(orerstatus=="PLACED")      {     
        const cartData1=await cartData.findOne({user:userData1._id})
        
        const productData=cartData1.product

        const orderdetails=new orderDatas({
            deliverydetails:req.body.address,
            user:userData1.name,
            paymentmethod:req.body.paymentMethod,
            product:productData,
            totalamount:Total,
            date:Date.now(),
            status:orerstatus
           
        })
       
        const saveOrder=orderdetails.save()
        await cartData.deleteOne({user:userData1._id})
        res.render('ordersuccess')
    }
    else{
        res.redirect("/checkout")
    }
    } catch (error) {
        console.log(error);
        
    }
}


module.exports={
    addtoCart,
    getCart,
    Checkout,
    addAddress,
    postAddress,
    postCheckout
}