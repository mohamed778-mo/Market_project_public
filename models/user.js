const mongoose = require('mongoose'); 
const validator = require('validator')
const bcryptjs = require('bcryptjs')

var cartItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
});

var userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true, 
        unique: true 
        },
    lastname: { 
        type: String,
        required: true 
        },
    email: { 
        type: String, 
        required: true,
        unique: true, 
        trim: true,
        validate(value) { 
         if (!validator.isEmail(value)) {
             throw new Error("Invalid email") } } 
            },
    mobile: { 
        type:String, 
        required: true,
        trim: true 
        },
    password: { 
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value) { 
        const StrongPassword = new RegExp("^(?=.*[a-z])(?=.*[0-9])");
        if (!StrongPassword.test(value)) { throw new Error(" Password must contain ' ^(?=.*[a-z])(?=.*[0-9]) ' ") } } },
    address: { 
        type: String, 
        required: true 
    },
    tokens: [{ 
        type: String, 
        expiresIn: "120d" 
    }],
    my_save_products: [{
        product_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Products" 
        },
        product_name: { 
            type: String 
        },
        product_rate: { 
            type: Number 
        },
        product_price: { 
            type: Number 
        },
        product_photo: { 
            type: String 
        },
    }],
    cart: [cartItemSchema],

     passwordChangedAt: {
        type:Date
    },
    passwordResetToken: {
        type:String
    },
    passwordResetExpires: {
        type:Date
    },

}, 
{ timestamps: true }
);

userSchema.pre("save",async function(){

    try {
     const user = this 
        if(!user.isModified("password")){
        
          return
        }
            user.password = await bcryptjs.hash( user.password , 8)
      
      }
   catch (error) {
        console.log(error)
  } 
     })     
    
     userSchema.methods.toJSON = function(){
        const user = this 
        const dataToObject = user.toObject()
        delete dataToObject.password
        delete dataToObject.tokens
       
        return dataToObject
      }

module.exports = mongoose.model('User', userSchema);
