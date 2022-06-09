
const router = require('express').Router()
const res = require('express/lib/response')
const admin = require('../models/admin')
const customer_model = require('../models/customer')
const report_model = require('../models/report')
const {verifyToken}= require('../tokenVerify/index')

//CREATE PAYMENT HISTORY
router.post('/createpayment/:id',verifyToken,async(req,res)=>{
  const customer = await customer_model.findOne({_id: req.params.id})
  let current_amount

       const amount =  parseInt(req.body.amount) 
       const payment_type = req.body.payment_type
       const previous_amount = customer.balance
       if(payment_type ==="payment"){
         current_amount = previous_amount+ amount
       }else{
        current_amount = previous_amount- amount
       }
      
       const admin_id = req.admin.admin_id
       const customer_id = req.params.id
       const customer_email = customer.email
       const current_time = new Date().toDateString()
     
       const report_generate = new report_model({
               amount         : amount,
               payment_type   : payment_type,
               previous_amount: previous_amount,
               current_amount : current_amount,
               admin_id       : admin_id,
               customer_id    : customer_id,
               customer_email : customer_email,
               payment_time   : current_time
       })
     report_generate.save((err,report_generate_data)=>{
         if(err){
             res.status(500).json(err)
         }else{
            //  res.status(200).json({
            //      message: "Successfully created report",
            //      error: false
            //  })
         }
     })
let newBalance 
    customer_model.findOne({_id: req.params.id},(err,customerData)=>{
            if(payment_type === "payment"){
                newBalance = customerData.balance + amount
            }else{
                newBalance = customerData.balance - amount
            }

          customer_model.findByIdAndUpdate({_id: req.params.id},{
              $set:{balance: newBalance}
          },(err,updatedAmountData)=>{
                if(err){
                    res.status(500).json(err)
                }else{
                    res.status(200).json({
                        message: "Successfully created report & updated the customer amount",
                        error: false
                    })
                }
          })

    })


      })
      



router.get('/findpaymentreport',verifyToken,(req,res)=>{
    const admin_id = req.session._id
     report_model.find({admin_id: admin_id},(err,result)=>{
         if(err){
             res.status(500).json(err)
         }else{
             const len = result.length
             res.status(200).json({
                 message: "showing result",
                 count: len,
                 result,
                 error: false
             })
         }
     })
})





module.exports = router