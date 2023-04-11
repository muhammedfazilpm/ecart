const Cat=require('../model/catogarymodel')

const pData=require('../model/productmodel')


//for loading of product page
const productPage=async(req,res)=>{
    const productData=await pData.find()
    try {
     res.render('product',{products:productData})
     console.log(products);
        
    } catch (error) {
        console.log();
        
    }
}

//to add new product

const addProdut=async(req,res)=>{
    const catDatas=await Cat.find({blocked:false})

   

    try {
      
     res.render('addproduct',{catDatas})
        
        
    } catch (error) {
        
        console.log(error);
    }
}

//to post it in to database
 
const postProduct=async(req,res)=>{

    const img=[]
    for(let i=0;i<req.files.length;i++){
        img.push(req.files[i].filename)
        console.log(img);

    }
    try { 
        
        
        const data=new pData({
        name:req.body.name,
        catogary:req.body.catogary,
        Quantity:req.body.stock,
        image:img,
        prize:req.body.prize,
        description:req.body.description,
          })
          const proData=await data.save()
          res.redirect('/admin/product')
       
    } catch (error) {
        console.log(error);
    }
}

//to delete product
const delProduct=async(req,res)=>{
    const del=await pData.findById({_id:req.query.id})
    

try {
    await pData.deleteOne({_id:req.query.id})
    res.redirect('/admin/product')
    
} catch (error) {
    console.log(error);
    
}

}

//to block products

const blockproduct=async(req,res)=>{
    const d= await pData.findById({_id:req.query.id})
          
    try {
        
        if(d.blocked==0){
            console.log("if");
            await pData.updateOne({_id:req.query.id},{$set:{blocked:1}})           
            res.redirect('/admin/product')

        }
        else{
          console.log("else");
                await pData.updateOne({_id:req.query.id},{$set:{blocked:0}})
                res.redirect('/admin/product')
    
          
        }

        
    } catch (error) {
        console.log(error);
        
    }
}
const editProduct=async(req,res)=>{
    
    try {
        const edit= await pData.findById({_id:req.query.id})
        const cat= await Cat.find()
        res.render('editproduct',{edit,cat})
    } catch (error) {
        console.log(error);
        
    }
}
const posteditProduct=async(req,res)=>{
    const img=[]
try {
    if(req.files.length !=0){
    for(let i=0;i<req.files.length;i++){
        img.push(req.files[i].filename)
        console.log(img);
    }
    
       
    const productData2=await pData.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,catogary:req.body.catogary,image:img,Quantity:req.body.Quantity,prize:req.body.prize}})

    res.redirect('/admin/product')
    
}else{
    
       
        const productData2=await pData.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,catogary:req.body.catogary,Quantity:req.body.Quantity,prize:req.body.prize}})
        res.redirect('/admin/product')
    
    }

} catch (error) {
    console.log(error);
    
}

}

module.exports={
    productPage,
    addProdut,
    postProduct,
    delProduct,
    blockproduct,
    editProduct,
    posteditProduct

}