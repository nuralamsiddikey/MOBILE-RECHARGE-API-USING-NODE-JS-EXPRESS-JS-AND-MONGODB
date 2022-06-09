const res = require('express/lib/response')

const router = require('express').Router()
const Customer = require('../models/customer')
const {customerAcessToken} = require('../tokenVerify')

router.get('/findCustomer',customerAcessToken,async(req,res)=>{
 try{
    const customer_id = req.customer.customer_id
 
    const result = await   Customer.findById({_id: customer_id})

    if(result != null){
        res.status(200).json({
            message:"Showing result",
            count: result.length,
            result,
            error: false

        })
    }else{
        res.status(404).json({
            message: "No customer found!",
            error: false
        })
    }



 }catch(err){
     res.status(400).send(err.message)
 }
   
})

module.exports = router