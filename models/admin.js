const mongoose = require('mongoose')
const Schema = mongoose.Schema

const admin_model = new Schema({
    email:{type:String,required:true},
    password:{type:String,required:true},
    phone:{type:Number,required:true},
    status:{type:Boolean,default:true}

  
})


module.exports = mongoose.model('Admin',admin_model)