const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customer_tariff_model = new Schema({
    name:{type: String},
    customer_id:{type: String},
    admin_id:{type: String},
    tariff: {type: Array},
    status:{type: Boolean, default: true}
})

module.exports = mongoose.model("Customer_tariff", customer_tariff_model)