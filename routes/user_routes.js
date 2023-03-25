const express =require('express')

const rout=express()

rout.set('view engine','ejs')
rout.set('views','./views/user')


rout.use(express.json())
rout.use(express.urlencoded({extended:true}))

const userController= require('../controle/userControls')
//rout.use('/',userController)


//to get the registration form 
rout.get("/register",userController.registerLoad)

//to get the otp page after posting of register and send it to mail
rout.post("/register",userController.veryfiyUser)

//to get the otp page after the entering of verify link in email
rout.get("/otp",userController.otppage)

//to check the otp enterd correct
rout.post("/otp",userController.login2)
rout.get('/',userController.loadLogin)





module.exports=rout



