const { status } = require('express/lib/response')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mobile_recharge_history_model = new Schema({
    customer_id: { type: String },
    module_id: { type: String },
    service_id: { type: String },
    request_id: { type: String },
    device_id: { type: String },
    previous_balance: { type: Number },
    amount: { type: Number },
    current_balance: { type: Number },
    cost: { type: Number },
    commission: { type: Number },
    charge: { type: Number },
    phone_number: { type: String },
    type:{type: String},
    admin_id: { type: String },
    order_status: { type: Number, default: 1 }
}, { timestamps: true })

module.exports = mongoose.model('Mobile_recharge_history', mobile_recharge_history_model)