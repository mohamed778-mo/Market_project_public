const mongoose = require('mongoose'); 

var emailsSchema = new mongoose.Schema({
  
    email:{
        type:String,
    }
},
{
    timestamps:true
}


);

module.exports = mongoose.model('Emails', emailsSchema);
