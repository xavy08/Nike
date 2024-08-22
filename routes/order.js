const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    apartmentSuite:{
        type: String,
    },
    city:{
        type: String,
        required: true
    },
    postalCode:{
        type: String,
    },
    phoneNumber:{
        type: Number,
        required: true
    },
    shipping:{
        type: String,
        default: "Standard"
    },
    payment:{
        type: String,
        default: "COD"
    },
    ordered:{
        type: Array,
        required: true
    },
    country:{
        type: String,
        default: "Pakistan"
    },
    Date:{
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Order",orderSchema)