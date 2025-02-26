const mongoose = require('mongoose'); 

var importsSchema = new mongoose.Schema({
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    client_name:{
        type:String,
        required:true,
    },
    client_address:{
        type:String,
        required:true,
    },
    client_mobile:{
        type:String,
        required:true,
    },
    product_names: [{ 
        type: String,
        required: true,
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    delivery_fee: {
        type: Number,  
        required: true,
    },
    is_buy:{
        type:Boolean,
        default:false
    },
    transactionNo:{
        type: String
    },
    deliveryTime:{
        type: String 
   },
    location:{ 
        type: String
   }

});

module.exports = mongoose.model('Imports', importsSchema);
