const orederData=require("../model/ordermodel")

//to get the order details in to admin page
const getOrder=async(req,res)=>{
    const orderdata=await orederData.find()

  
    try {
        res.render("adminorder",{orderdata})
    } catch (error) {
        console.log(error);
        
    }
}

//to make the status pending from admin side
const makepending=async(req,res)=>{
    try {
        const pending=await orederData.findByIdAndUpdate(req.query.id,{status:"PENDING"})
      res.redirect("/admin/order")
    } catch (error) {
        console.log(error);
    }
}

// to make the pending order to place order
const placeOrder=async(req,res)=>{
    try {
        const placeorder=await orederData.findByIdAndUpdate(req.query.id,{status:"PLACED"})
        res.redirect("/admin/order")
    } catch (error) {
        console.log(error);
        
    }
}
//to make the order status as cancel

const cancelOrder=async(req,res)=>{
    try {
        const placeorder=await orederData.findByIdAndUpdate(req.query.id,{status:"CANCELED"})
        res.redirect("/admin/order")
    } catch (error) {
        console.log(error);
        
    }
}

module.exports={
    getOrder,
    makepending,
    placeOrder,
    cancelOrder

}