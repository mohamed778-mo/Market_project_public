const mongoose = require('mongoose'); 

var productsSchema = new mongoose.Schema({
    arabic_name:{
        type:String,
        required:true
    },
    english_name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    rate:{
        type:Number,
        default:0
    },
    
    size:{
        type:String,
        required:true
    },
   
    photo:{
        type:String,
        default:'empty'
    },
   
},
{
    timestamps:true
}


);

module.exports = mongoose.model('Products', productsSchema);
