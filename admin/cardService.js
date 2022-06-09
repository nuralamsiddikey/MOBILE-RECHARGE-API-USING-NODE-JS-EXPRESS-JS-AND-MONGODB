const router = require('express').Router()
const card_service_model = require('../models/cardService')
const service_model = require('../models/service')
const module_model = require('../models/module')
const {verifyToken} = require('../tokenVerify/index')

//CARD SERVICE CREATE
router.post('/service/add',verifyToken,(req,res)=>{
 
    const service_id = req.body.service_id
    const module_id = req.body.module_id
  const admin_id = req.admin.admin_id
       service_model.findOne({_id: service_id},(err,serviceData)=>{
           if(err){
               res.status(500).json(err)
           }else{
            
               if(serviceData != null){
   
               module_model.findOne({_id: module_id},(err,moduleData)=>{
                   if(err){
                       res.status(500).json(err)
                   }else{
                       if(moduleData != null){
  
  // DATA INSERT INTO CARDSERVICE MODEL
  
  const cardService = card_service_model({
      service_id: req.body.service_id,
      module_id : req.body.module_id,
      card_package_id: req.body.card_package_id,
      customer_id: req.body.customer_id,
      order_status: req.body.order_status,
    
      serial_no : req.body.serial_no,
      status: req.body.status,
     // createDate: Date.now(),
      expire: req.body.expire,
    
      admin_id  : admin_id
  })
  
   cardService.save((err,result)=>{
       if(err){
           res.status(500).json(err)
       }
       else{
           const len = result.length
           res.status(200).json({
               message:"Successfully added card service",
               length: len,
               result,
               error: false
           })
       }
   })
  
   
  
  
  
                       }else{
                           res.status(404).json({
                               message:"module is not available",
                               error: true
                           })
                       }
                   }
               })
  
  
               }else{
                   res.status(404).json({
                       message:" Service is not available",
                       error: true
                   })
               }
           }
       })
  
  
  
  
  })




//UPDATE CARDSERVICE
router.patch('/service/update/:id',verifyToken,(req,res)=>{
 

    const updatedData = {
        $set:{
            service_id : req.body.service_id,
            module_id  : req.body.module_id,
            card_package_id: req.body.card_package_id,
            customer_id: req.body.customer_id,
            order_status: req.body.order_status,
         //   pending_request: req.body.pending_request,
            serial_no  : req.body.serial_no,
            status     : req.body.status,
            expire     : req.body.expire
        }
    }
   
     
   
   
     card_service_model.findByIdAndUpdate({_id: req.params.id},updatedData,(err,result)=>{
         if(err){
             res.status(500).json(err)
         }else{
           
             res.status(200).json({
                 message: "Successfully updated!",
                 error: false
   
             })
         }
     })
   
   })
   

 
// DELETE CARDSERVICE
router.delete('/service/delete/:id',(req,res)=>{
    card_service_model.findByIdAndDelete({_id: req.params.id},(err,result)=>{
        if(err){
            res.status(500).json(err)
        }else{
            res.status(200).json({
                message:"Successfully deleted the card service",
                error: false
            })
        }
    })
  })


 // FIND CARD LIST
 
router.get('/getcardlist', verifyToken, async (req, res,next) => {
 
    try {
        const serviceAllResult = await card_service_model.find({ admin_id: req.admin.admin_id })
        let page = parseInt(req.query.page)
        let limit = parseInt(req.query.limit)

        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 50;
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const result = serviceAllResult.slice(startIndex, endIndex);
     
 

        if (result.length) {


            var data_array = [];
            var my_object = {};

            const allserviceid = result.map((data) => data.service_id)
            const allmoduleid = result.map((data) => data.module_id)
               


            for (let i = 0; i < result.length; i++) {
                const serviceData = await service_model.findOne({ _id: allserviceid[i] })
               
                const moduleData = await module_model.findOne({ _id: allmoduleid[i] })
       
                    my_object.service_name = serviceData.name
                    my_object.module_name = moduleData.name
                    my_object.card_package_id = result[i].card_package_id
                    my_object.customer_id = result[i].customer_id
                    my_object.order_status = result[i].order_status
                    my_object.pending_request = result[i].pending_request
                    my_object.admin_id = result[i].admin_id
                

                 data_array.push(my_object)

               

            }
const len = data_array.length
const results = data_array
 res.status(200).json({
     message: "Showing results",
     length: len,
     results,
     error: false

 })



        }
        else {

            res.status(404).json({
                message: "No list found!",

                error: true
            })
        }



    } catch (err) {
        next(err)
    }



})


  module.exports = router