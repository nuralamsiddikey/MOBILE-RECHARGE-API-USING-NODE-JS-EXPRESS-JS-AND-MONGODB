const router = require('express').Router()
const { verifyToken, customerAcessToken } = require('../tokenVerify')
const customer_model = require('../models/customer')
const module_model = require('../models/module')
const customer_tariff_model = require('../models/customerTariff')
const mobile_recharge_history_model = require('../models/mobileRechargeHistory')
const { verify } = require('jsonwebtoken')



router.put('/bkas', customerAcessToken, async (req, res, next) => {

    try {

        const Loggedcustomer = await customer_model.findOne({ _id: req.customer.customer_id })
        const admin_id = Loggedcustomer.admin_id
        const device_id = Loggedcustomer.device_id
        const module = await module_model.findOne({ $and: [{ _id: req.body.module_id }, { admin_id: admin_id }] })

        if (module != null) {

            let service_id = module.service_id

            const customer = await customer_tariff_model.findOne({ customer_id: req.customer.customer_id })
            const customer_tariff = customer.tariff


            const customer_tariff_len = customer_tariff.length



            for (let i = 0; i < customer_tariff_len; i = i + 1) {
                console.log(customer_tariff[i].service_id)
                if (customer.tariff[i].service_id == service_id) {

                    const amount = req.body.amount
                    const charge = customer.tariff[i].charge
                    const commission = customer.tariff[i].commission
                    const cost = customer.tariff[i].cost


                    const all_service_permission = await customer_model.findOne({ _id: req.customer.customer_id }, { service_permission: 1, _id: 0 })
                    const all_service_permission_id = all_service_permission.service_permission


                    for (let a = 0; a < all_service_permission_id.length; a = a + 1) {
                        for (let b = 0; b < all_service_permission_id.length; b = b + 1) {
                            if (all_service_permission_id[a] == all_service_permission_id[b]) {

                                const customer_data = await customer_model.findOne({ _id: req.customer.customer_id })

                                let customer_balance = Loggedcustomer.balance

                                if (commission) {


                                    const total_commission = (amount * commission) / 100
                                    const total_charge = (amount * charge) / 100

                                    const total_cost = amount * cost

                                    const final_cost = (total_charge + total_cost) - total_commission




                                    if (customer_balance >= final_cost) {
                                        let customer_current_balance = customer_balance - final_cost
                                        const newCustomer_data = {
                                            balance: customer_current_balance
                                        }

                                        await customer_model.findOneAndUpdate({ _id: req.customer.customer_id }, newCustomer_data)
                                        const a = await customer_model.findOne({ _id: customer.customer_id })
                                        const adminId = a.admin_id

                                        const new_mobile_recharge_history = new mobile_recharge_history_model({
                                            customer_id: req.customer.customer_id,
                                            admin_id: adminId,
                                            module_id: req.body.module_id,
                                            service_id: service_id,
                                            request_id: Math.floor(100000 + Math.random() * 900000),
                                            device_id: device_id,
                                            previous_balance: customer_balance,
                                            amount: req.body.amount,
                                            current_balance: customer_current_balance,
                                            cost: total_cost,
                                            commission: total_commission,
                                            charge: total_charge,
                                            phone_number: req.body.phone_number,
                                            type: req.body.type,
                                            admin_id: adminId



                                        })


                                        await new_mobile_recharge_history.save()

                                        res.status(200).json({
                                            message: "Mobile recharge succesful",

                                            error: false
                                        })


                                    } else {
                                        res.status(403).json({
                                            message: "insufficient balance!",
                                            error: false
                                        })
                                    }






                                } else {

                                    const total_cost = amount * cost
                                    const total_charge = (amount * charge) / 100
                                    const final_cost = total_charge + total_cost
                                    const total_commission = 0

                                    if (customer_balance >= final_cost) {



                                        const newCustomer_data = {
                                            balance: customer_balance - amount
                                        }

                                        const updated_customer_data = await customer_model.findOneAndUpdate({ _id: req.customer.customer_id }, newCustomer_data)
                                        const a = await customer_model.findOne({ _id: req.customer.customer_id })
                                        const adminId = a.admin_id
                                        const new_mobile_recharge_history = new mobile_recharge_history_model({
                                            customer_id: req.customer.customer_id,
                                            admin_id: adminId,
                                            module_id: req.body.module_id,
                                            service_id: service_id,
                                            request_id: Math.floor(100000 + Math.random() * 900000),
                                            device_id: device_id,
                                            previous_balance: customer_balance,
                                            amount: req.body.amount,
                                            current_balance: customer_balance - amount,
                                            cost: total_cost,
                                            commission: total_commission,
                                            phone_number: req.body.phone_number,
                                            admin_id: adminId



                                        })


                                        const result = await new_mobile_recharge_history.save()

                                        res.status(200).json({
                                            message: "Mobile recharge succesful",
                                            result,
                                            error: false
                                        })

                                    } else {
                                        res.status(403).json({
                                            message: "insufficient balance!",
                                            error: false
                                        })
                                    }


                                }


                            } else {
                                res.send("service permission is not found")
                            }
                        }
                    }



                } else {
                    if (i == customer_tariff_len - 1) {
                        res.status(404).json({
                            message: "Customer tariff is not available",
                            error: false
                        })
                    }
                }
            }





        } else {
            res.status(404).json({
                message: "Module is not available!",
                error: true
            })
        }



    } catch (err) {
        next(err)
    }

})



// FIND MOBILE RECHARGE HISTORY BY ADMIN


router.get('/recharge/history', verifyToken, (req, res) => {
    try {

        mobile_recharge_history_model.find({}, (err, mobile_recharge_history) => {
            if (err) {
                res.status(500).json(err)
            } else {

                if (mobile_recharge_history != null) {
                    let page = parseInt(req.query.page)
                    let limit = parseInt(req.query.limit)

                    if (!page) {
                        page = 1;
                    }
                    if (!limit) {
                        limit = 30;
                    }

                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;
                    const result = mobile_recharge_history.slice(startIndex, endIndex);
                    const len = result.length

                    res.status(200).json({
                        message: "Showing result",
                        count: len,
                        result,
                        error: false
                    })

                } else {
                    res.status(404).json({
                        message: "Couldn't find any module"
                    })
                }





            }
        })




    } catch (err) {
        res.status(500).json(err.message)
    }
})




// FIND MOBILE RECHARGE HISTORY BY CUSTOMER

router.get('/recharge/history/customer', customerAcessToken, async (req, res) => {
    const logged_device_id = req.customer.device_id
    const logged_customer_id = req.customer.customer_id

    const customer_device = await customer_model.findOne({ _id: logged_customer_id }, { device_id: 1, _id: 0 })
    const a = customer_device.device_id

    if (logged_device_id != a) {
        res.status(400).json({
            message: "device did't match",
            error: true
        })
    } else {
        const recharge_history = await mobile_recharge_history_model.find({ customer_id: logged_customer_id })

        if (recharge_history != null) {


            let page = parseInt(req.query.page)
            let limit = parseInt(req.query.limit)

            if (!page) {
                page = 1;
            }
            if (!limit) {
                limit = 30;
            }

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const result = recharge_history.slice(startIndex, endIndex);
            const len = result.length


            res.json({
                message: "Showing results",
                length: len,
                result,
                error: false
            })
        } else {
            res.status(200).json({
                message: "No recharge history!",

            })
        }



    }



})


//MOBILE RECHARGE HISTORY SEARCH BY MULTIPLE CONDITION
router.get('/recharge/history/filter', verifyToken, async (req, res, next) => {
    try {

        const all_history = await mobile_recharge_history_model.find({
            "admin_id": req.admin.admin_id, $and: [
                { "customer_id": req.body.customer_id },
                { "module_id": req.body.module_id },
                { "service_id": req.body.service_id },
                { "request_id": req.body.request_id }

            ]
        })

        res.status(200).json({
            message: "Showing results",
            length: all_history.length,
            all_history,
            error: false
        })




    } catch (err) {
        next(err)
    }
})









module.exports = router