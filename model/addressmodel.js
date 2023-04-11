const mongoose=require("mongoose")

const addressschema =new mongoose.Schema({
    user:{
        type:String,
        ref:"user",
        required:false,

    },

address:[{
    name:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    
    },
pin:{
    type:Number,
    required:true
},
phone:{
    type:Number,
    required:true
},
place:{
    type:String,
    required:true

},
fulladdress:{
    type:String,
    required:true
}
}]



})


module.exports=mongoose.model("address",addressschema)