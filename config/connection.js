const mongoose = require("mongoose")
require("dotenv").config()


const url= process.env.MONGODB
const DBconnection =()=>{ 
mongoose.connect(url)
.then(()=>{console.log('done connection !!')})
.catch((e)=>{console.log(e.message)})
}


module.exports= DBconnection;


