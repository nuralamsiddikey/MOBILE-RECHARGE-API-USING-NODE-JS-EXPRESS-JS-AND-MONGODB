
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const module_model = new Schema({
    name:{type:String,required:true},
    service_id:{type:String,required:true},
    country_id:{type:String,required:true},
    flag:{type:String},
    prefix:{type:String,required:true},
    admin_id:{type:String,required:true},
    status:{type:Boolean,default:true}

  
})


module.exports = mongoose.model('Module',module_model)



