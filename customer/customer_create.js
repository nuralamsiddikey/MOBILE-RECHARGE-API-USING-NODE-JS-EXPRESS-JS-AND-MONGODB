const router = require('express').Router()
const customer_model = require('../models/customer')
const {verifyToken} = require('../tokenVerify/index')
const CryptoJS = require('crypto-js')


router.post('/createcustomer', verifyToken, async (req, res,next) => {
   
   try{

    const isCustomer = await customer_model.findOne({
        _id: req.admin.admin_id
    })
    let customer_status = true

    if (isCustomer == null)
        customer_status = false
    else
        customer_status = true



    customer_model.findOne({
        email: req.body.email
    }, (err, result) => {

        if (result == null) {

            const customer = new customer_model({

                email: req.body.email,
                password: CryptoJS.AES.encrypt(req.body.password, process.env.CUSTOMER_PASS_SEC).toString(),
                name: req.body.name,
                phone: req.body.phone,
                create_customer: req.body.create_user,
                service_permission: req.body.service_permission,
                balance: req.body.balance,
                device_id: req.body.device_id,
                device_id: req.body.device_id,
                admin_id: req.admin.admin_id,
                status: req.body.status,
                parent: customer_status


            })

            customer.save((err, result) => {
                if (err) {
                    res.status(500).json(err)
                } else {
                    res.status(200).json({
                        message: "Successfully created customer",
                        error: false,
                        
                    })
                }
            })




        } else if (result != null) {
            if (req.body.email != result.email) {


                const customer = new customer_model({

                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    phone: req.body.phone,
                    create_customer: req.body.create_user,
                    balance: req.body.balance,
                    device_id: req.body.device_id,
                    admin_id: req.session._id,
                    parent: customer_status


                })

                customer.save((err, result) => {
                    if (err) {
                        res.status(500).json(err)
                    } else {
                        res.status(200).json({
                            message: "Successfully created customer",
                            error: false
                        })
                    }
                })


            } else {
                res.status(403).json({
                    message: "User already exist!",
                    error: true
                })
            }
        }

    })

   }catch(err){
         next(err)
   }
})


module.exports = router