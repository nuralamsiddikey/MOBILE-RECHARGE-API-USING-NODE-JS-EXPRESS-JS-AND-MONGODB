
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const cardpackageModel = new Schema({
    name:{type:String},
    amount:{type:Number},
    admin_id:{type:String},
    status :{type:Boolean,default: true}
})

module.exports = mongoose.model("Cardpackage",cardpackageModel)