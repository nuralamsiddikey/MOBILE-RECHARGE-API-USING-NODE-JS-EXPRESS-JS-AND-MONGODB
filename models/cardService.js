const mongoose = require('mongoose')
const Schema = mongoose.Schema

const card_service_model = new Schema({
              service_id:{type:String,required:true},
              module_id:{type:String,required:true},
              card_package_id :{type:String},
              customer_id: {type:String,default: null},
              order_status:{type:String},
              pending_request:{type:Boolean,default: true},
              serial_no:{type:String, required: true},
              status:{type:Boolean,default:true},
              createDate:{type: Date },
    
              expire:{type:Date, required:true},
              saleDate:{type:Date , default:null},
              admin_id: {type:String,required:true}


},{timestamps: true})


module.exports = mongoose.model('CardService',card_service_model)