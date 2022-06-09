
const router = require('express').Router()
const customer_tariff_model = require('../models/customerTariff')
const { verifyToken } = require('../tokenVerify/index')

router.post('/create', verifyToken,(req, res) => {

    customer_tariff_model.findOne({ customer_id: req.body.customer_id }, (err, result) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (result == null) {

                const customer_tariff = new customer_tariff_model({
                    name: req.body.name,
                    customer_id: req.body.customer_id,
                    admin_id: req.admin.admin_id,
                    tariff: req.body.tariff,
                    status: req.body.status
                })
                customer_tariff.save((err, result) => {
                    if (err) {
                        res.status(500).json(err)
                    } else {
                        res.status(200).json({
                            message: "Successfully created customer tariff",
                            error: false
                        })
                    }
                })



            } else {
                res.status(403).json({
                    message: "Customer tariff already exist!",
                    error: true
                })
            }
        }
    })



})


router.put('/update/:id', verifyToken, async (req, res, next) => {
    try {
        const customer = await customer_tariff_model.findOne({ customer_id: req.body.customer_id })
        if (customer != null) {

            const updated_customer_tariff = customer.tariff.concat(req.body.tariff)

            const new_cutomer_tariff = {
                tariff: updated_customer_tariff
            }
            const updated_customer_tariff_response = await customer_tariff_model.findOneAndUpdate({ customer_id: req.body.customer_id }, new_cutomer_tariff)
            res.status(200).json({
                message: "Successfully updated customer tariff!",
                error: false
            })

        } else {
            res.status(404).json({
                message: "Customer tariff doesn't exist!",
                error: true
            })
        }




    } catch (err) {
        next(err)
    }
})








module.exports = router