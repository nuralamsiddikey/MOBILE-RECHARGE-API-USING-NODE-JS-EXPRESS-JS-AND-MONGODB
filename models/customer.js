
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customer_model = new Schema({

  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String },
  phone: { type: Number, default: null },
  create_customer: { type: Boolean, default: false },
  service_permission:{type:Array , default: null},
  balance: { type: Number, default: 0 },
  device_id: { type: String ,default: null },
  last_login: { type: Date, },
  admin_id: { type: String },
  status: { type: Boolean, default: true },
  parent: { type: Boolean, default: true }

})


module.exports = mongoose.model('Customer', customer_model)



