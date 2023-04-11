const mongoose=require("mongoose")
const orderscema=new mongoose.Schema({
    deliverydetails:{
        type:String,
        require:true,
    },
    user:{
        type:String
    },
    paymentmethod:{
        type:String
    },
    product:[{
        productId:{
        type:mongoose.Types.ObjectId,
        ref:"product",
        required:true
    },
    quantity:{
        type:Number,
        required:true
    }
}],
totalamount:{
    type:Number,

},
date:{
    type:Date,
},
status:{
    type:String,
},
paymentid:{
    type:String
}
},{
    timestamps:true
}

);
module.exports=mongoose.model("order",orderscema)



