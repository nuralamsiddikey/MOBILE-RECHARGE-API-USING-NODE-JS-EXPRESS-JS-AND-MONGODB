const router = require('express').Router()
const { customerAcessToken } = require('../tokenVerify/index')
const module_model = require('../models/module')
const card_package_model = require('../models/cardpackage')
const card_service_model = require('../models/cardService')
const customer_model = require('../models/customer')
const customer_tariff_model = require('../models/customerTariff')




router.put('/card/buy', customerAcessToken, async (req, res,next) => {

    try {

        const Loggedcustomer = await customer_model.findOne({ _id: req.customer.customer_id })
        const admin_id = Loggedcustomer.admin_id

        const module = await module_model.findOne({ $and: [{ _id: req.body.module_id }, { admin_id: admin_id }] })
        const card_package = await card_package_model.findOne({ $and: [{ _id: req.body.card_package_id }, { admin_id: admin_id }] })

        if (module != null) {
            if (card_package != null) {
                 let service_id = module.service_id
                  const all_card_service = await card_service_model.find({ service_id: service_id })

                if (all_card_service != null) {
                    const available_card_service = []
                    const available_card_service_id = []

                    for (let i = 0; i < all_card_service.length; i = i + 1) {
                        if (all_card_service[i].customer_id == null) {
                            available_card_service.push(all_card_service[i]._id)
                            available_card_service_id.push(all_card_service[i].service_id)
                        }
                    }




                    if (available_card_service.length) {
                        let is_service_permission_available = false

                        const all_service_permission = await customer_model.findOne({ _id: req.customer.customer_id }, { service_permission: 1, _id: 0 })

                        const all_service_permission_id = all_service_permission.service_permission

                        for (let a = 0; a < available_card_service_id.length; a = a + 1) {
                            for (let b = 0; b < all_service_permission_id.length; b = b + 1) {
                                if (available_card_service_id[a] == all_service_permission_id[b]) {
                                    is_service_permission_available = true
                                    break
                                } else {
                                    // console.log("not available")
                                }
                            }
                        }

                        if (is_service_permission_available) {

                            const unit = card_package.amount

                            const customer = await customer_tariff_model.findOne({ customer_id: req.customer.customer_id })
                            const customer_tariff = customer.tariff
                            const customer_tariff_len = customer.tariff.length




                            for (let i = 0; i < customer_tariff_len; i = i + 1) {
                                if (customer.tariff[i].service_id == service_id) {


                                    const cost = customer.tariff[i].cost
                                    const charge = customer.tariff[i].charge
                                    const commission = customer.tariff[i].commission
                                    const amount = card_package.amount



                                    if (commission) {

                                        const total_commission = (amount * commission) / 100

                                        const total_cost = amount * cost
                                        const total_charge = (amount * charge) / 100
                                        const final_cost = (total_charge + total_cost) - total_commission

                                        //  const customer = await customer_model.findOne({_id: req.session._id},{balance: 1 , _id: 0})
                                        const customer_balance = Loggedcustomer.balance

                                        if (customer_balance >= final_cost) {

                                            const newBalance = {
                                                balance: customer_balance - final_cost
                                            }

                                            const newData = {
                                                $set: {
                                                    customer_id: req.customer.customer_id,
                                                    saleDate: new Date().toLocaleString()
                                                }
                                            }

                                            const updated_customer_balance = await customer_model.findOneAndUpdate({ _id: req.customer.customer_id }, newBalance)
                                            const updated_card_service = await card_service_model.findOneAndUpdate({ _id: available_card_service[0] }, newData)

                                            if (updated_card_service != null && updated_customer_balance != null) {
                                                res.status(200).json({
                                                    message: "Card buy successfully",

                                                    error: false
                                                })
                                            }




                                        } else {

                                            res.status(403).json({
                                                message: `Insufficient balance!`,

                                                error: true
                                            })
                                        }

                                    } else {
                                        const total_cost = amount * cost
                                        const total_charge = (amount * charge) / 100
                                        const final_cost = total_charge + total_cost
                                        const customer = await customer_model.findOne({ _id: req.customer.customer_id }, { balance: 1, _id: 0 })
                                        const customer_balance = customer.balance

                                        if (customer_balance >= final_cost) {

                                            const newBalance = {
                                                balance: customer_balance - final_cost
                                            }

                                            const newData = {
                                                $set: {
                                                    customer_id: req.customer_id,
                                                    saleDate: new Date().toLocaleString()
                                                }
                                            }

                                            const updated_customer_balance = await customer_model.findOneAndUpdate({ _id: req.customer.customer_id }, newBalance)
                                            const updated_card_service = await card_service_model.findOneAndUpdate({ _id: available_card_service[0] }, newData)

                                            if (updated_card_service != null && updated_customer_balance != null) {
                                                res.status(200).json({
                                                    message: "Card buy successfully",
                                                    error: false
                                                })
                                            }




                                        } else {

                                            res.status(403).json({
                                                message: "Insufficient balance!",

                                                error: true
                                            })
                                        }





                                    }

                                }










                            }

                        } else {
                            console.log("service permission is not available")
                        }
                    } else {
                        res.status(404).json({
                            message: "Sorry no card service available at this moment!",
                            error: true
                        })
                    }

                } else {
                    res.status(404).json({
                        message: "Card service is not availabe!"
                    })
                }





            } else {
                res.status(404).json({
                    message: "Card_Package is not available!",
                    error: true
                })
            }
        } else {
            res.status(404).json({
                message: " Module is not available!",
                error: true
            })
        }

    } catch (err) {
        next(err)
    }
})


module.exports = router