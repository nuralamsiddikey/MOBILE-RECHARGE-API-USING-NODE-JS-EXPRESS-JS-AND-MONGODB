const mongoose = require('mongoose')
const Schema = mongoose.Schema

const rateModel = new Schema({
    name: { type: String },
    admin_id:{type:String},
     tariff: {type:Array}
    // [
    //     {
    //         service_id: { type: String },
    //         module_id: { type: String },
    //         cost: { type: Number, default: null },
    //         charge: { type: Number, default: null },
    //         commission: { type: Number, default: null },
    //         status: { type: Boolean, default: true },
    //         admin_id: { type: String }
    //     }
    // ]
})


module.exports = mongoose.model('Ratemodule', rateModel)

