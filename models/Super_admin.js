const mongoose = require('mongoose')
const Schema = mongoose.Schema

const super_admin_model = new Schema({
    email:{type:String,required:true},
    password:{type:String,required:true},
  
})


module.exports = mongoose.model('Super_admin',super_admin_model)