const mongoose = require('mongoose')
const Schema = mongoose.Schema

const country_model = new Schema({
    name:{type:String,required:true},
    flag:{type:String,required:true},
   
    status:{type:Boolean,default:true}

  
})


module.exports = mongoose.model('Country',country_model)