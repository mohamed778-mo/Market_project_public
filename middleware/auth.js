const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");

const auth = async (req, res, next) => {
  try {

    if (!req.headers) {
        return res.status(404).send(" please login !");
      }
     
      const token = req?.headers?.authorization.split(" ")[1];
      
    if (!token) {
      return res.status(401).send(" please login !");
    }

    const SECRETKEY = process.env.SECRETKEY;

    const result =  jwt.verify(token, SECRETKEY, { complete: true });

    if (!result) {
      return res.status(400).send(" please signup or login !");
    }

    const user_1 = await User.findById(result.payload.id);
     if (!user_1) {
      return res.status(401).send("User not found!");
    }
    req.user = user_1;

    next();
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const adminAuth = async (req, res, Next) => {
  try {
    

    if (!req.headers) {
      return res.status(404).send(" please login !");
    }

    const token = req?.headers?.authorization.split(" ")[1];
    
    if (!token) {
      return res.status(401).send(" please login !");
    }
    
    const SECRETKEY = process.env.SECRETKEY;

    const result =  jwt.verify(token, SECRETKEY, { complete: true });

    if (!result) {
      return res.status(400).send(" please signup or login !");
    }

    const user_1 = await Admin.findById(result.payload.id);
     if (!user_1) {
      return res.status(401).send("Admin not found!");
    }
    req.user = user_1;

   
      Next();
    
  } catch (e) {
    res.status(500).send(e.message);
  }
};


module.exports = {
  auth,
  adminAuth,
};
