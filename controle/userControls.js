const User= require("../model/usermodel")
const bcrypt=require('bcrypt');
const nodemailer = require('nodemailer');
const { updateOne } = require("../model/usermodel");
let otp
let email2

const securePassword=async(password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
        
    }

}
//for send mail and otp
const sendVerifyMail=async(name,email,otp)=>{
try {
    const transporter=nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:'globalcycle12@gmail.com',
            pass:'qczqlrbodytlorvl'
        }
    })
    const mailOPtion={
        form:'globalcycle12@gmail.com',
        to:email,
        subject:'for verification mail',
        html:'<p>hi'+name+',please click here to<a href="http://localhost:8080/otp">varify</a> and enter the'+otp+' for your verification '+email+ '</p>',
       
       
    }
  
    transporter.sendMail(mailOPtion,function(error,info){

        if(error){
            console.log(error);
        }
        else{
            console.log("email has been send",info.response);
        }
    })
    
} catch (error) {
    console.log(error.message)
    
}


}


const registerLoad = async (req,res)=>{
    try {
        
        res.render("register")



    } catch (error) {
        console.log(error.message);
        
    }
}



//resistration form submission 
const veryfiyUser= async (req,res)=>{

 
        try {
            const spassword=await securePassword(req.body.password);
            const email = req.body.email;
            const alreyMail = await User.findOne({email:email})
            email2=email
            
            if(alreyMail){
                res.render('register',{message:"EMAIL ALREADY EXIST "})
            }

else{
        
        const data =new User({
        name:req.body.name,
        email:req.body.email,
        mob:req.body.number,
        password:spassword,
       
       
    })
  

    const Udata = await data.save()
    
    if(Udata){
        
        //otp generation
        var randomNumber = Math.floor(Math.random() * 9000) + 1000;
        otp=randomNumber




  sendVerifyMail(req.body.name,req.body.email,randomNumber)
  

        res.render('register',{message:"OTP is send to your mail please varify"})
       
    }else{
        res.render('register',{alert:'note done'})

    }}
  } catch (error) {

    console.log(error.message);
        
    }
}

//for login page
const loadLogin=async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
        
    }
}

//for otp page while clicking the verify in mail
const otppage=async(req,res)=>{
    try {
        
        res.render('verify')
        
    } catch (error) {
        console.log(error.message)
        
    }
    
    }



    //for otp verification
const login2=async(req,res)=>{
    try {
  
   var otp2=req.body.otp
  
  
   if(otp2==otp){
    
    const email3 = await User.findOneAndUpdate({email:email2},{$set:{is_varified:1}})
   

    res.render('login')
   }
   else{
    res.render('verify',{message:"Please enter the correct otp"}) 
   }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    registerLoad,
    veryfiyUser,
    loadLogin,
    otppage,
    login2,

}