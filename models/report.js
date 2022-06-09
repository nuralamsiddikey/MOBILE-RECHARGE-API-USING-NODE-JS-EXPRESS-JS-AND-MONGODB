const mongoose = require('mongoose')
const Schema = mongoose.Schema

const report_model = new Schema({
     amount:{type:Number},
     payment_type:{type:String},
     previous_amount: {type:Number},
     current_amount:{type: Number},
     admin_id : {type:String},
     customer_id: {type: String},
     customer_email :{type: String},
     payment_time:{type: String}

})

module.exports = mongoose.model('Report',report_model)