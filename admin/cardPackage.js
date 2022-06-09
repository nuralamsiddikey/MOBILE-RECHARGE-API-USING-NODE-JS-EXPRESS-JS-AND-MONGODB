const router = require('express').Router()
const card_package_model = require('../models/cardpackage')
const {verifyToken} = require('../tokenVerify/index')

//CREATE CARDPACKAGE
router.post('/create/cardpackage',verifyToken,(req,res)=>{

    
    const card_package = new card_package_model({
        name    : req.body.name,
        amount  : req.body.amount,
        admin_id: req.admin.admin_id,
        status  : req.body.status
    })
    card_package.save((err,result)=>{
        if(err){
            res.status(500).json(err)
        }else{
            res.status(200).json({
                message: "successfully created card package",
                error: false
            })
        }
    })
   

})


// UPDATE CARDPACKAGE
router.patch('/update/cardpackage/:id',verifyToken,(req,res)=>{
   
        card_package_model.findByIdAndUpdate({_id: req.params.id},{
            $set:{
                name: req.body.name,
                amount: req.body.amount,
                status: req.body.status
            }
        },(err,result)=>{
              if(err){
                  res.status(500).json(200)
              }else{
                  res.status(200).json({
                      message: "Successfully updated the cardpackage",
                   
                      error: false
                  })
              }
        })
     
 
})


//DELETE CARD PACKAGE
router.delete('/delete/cardpackage/:id',verifyToken,(req,res)=>{
    card_package_model.findByIdAndDelete({_id: req.params.id},(err,result)=>{
      
           if(result){
            res.status(200).json({
                message: "successfully deleted",
                error: false
            })
           }else{
               res.status(400).json({
                   message: "Package id couldn't found!",
                   error: true
               })
           }
        
    })
})










module.exports = router