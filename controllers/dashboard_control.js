const Admin = require("../models/admin");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Products = require("../models/products");
const Emails = require("../models/emails")
const Imports = require("../models/imports")
const User = require("../models/user")

const admin = require('firebase-admin');
const fs = require('fs');
require("dotenv").config();


const serviceAccount = JSON.parse(process.env.SERVER)


const admin_Register = async (req, res) => {
  try {
    const  {firstname,lastname,email, mobile,password, address } = req.body;
    const dublicatedEmail = await Admin.findOne({ email: email });
    
    if (dublicatedEmail) {
      const message = req.language === 'ar' ? 'البريد الإلكتروني موجود بالفعل!!' : 'Email already exists!!';
      return res.status(400).send(message);
    }
    
    const newUser = new Admin( {firstname,lastname,email, mobile,password, address });
    await newUser.save();
    
    const successMessage = req.language === 'ar' ? 'التسجيل ناجح !!' : 'Registration is successful!!';
    res.status(200).send(successMessage);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const admin_Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email: email });
    
    if (!user) {
      const message = req.language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Email or Password is incorrect';
      return res.status(404).send(message);
    }
    
    const isPassword = await bcryptjs.compare(password, user.password);
    if (!isPassword) {
      const message = req.language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Email or Password is incorrect';
      return res.status(404).send(message);
    }
    
    const SECRETKEY = process.env.SECRETKEY;
    const token = jwt.sign({ id: user._id }, SECRETKEY);
    res.cookie("access_token", `Bearer ${token}`, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 1024 * 300),
      httpOnly: true,
    });
    
    user.tokens.push(token);
    await user.save();
    
    const successMessage = req.language === 'ar' ? 'تسجيل الدخول ناجح!' : 'Login is successful!';
    res.status(200).send({ access_token: `Bearer ${token}`, success: successMessage });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const add_product = async (req, res) => {
  try {

        const arabic_name = req.body.arabic_name;
        const english_name = req.body.english_name;
        const price = req.body.price;
        const size = req.body.size;
        const rate = req.body.rate;

    const file = req.files.find(f => f.fieldname === 'file');
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "gs://fireproducts-b6b10.appspot.com"
      });
    }

    const bucket = admin.storage().bucket();
    const blob = bucket.file(file.filename);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype 
      }
    });
      await new Promise((reject) => {
            blobStream.on('error', (err) => {
              reject(err);
            });


    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        fs.unlinkSync(file.path);

    

        const newProduct = new Products({
          arabic_name,
          english_name,
          price,
          size,
          photo: publicUrl,
          rate
        });
       await newProduct.save();

        const successMessage = 'Product added successfully!';
        res.status(200).send( successMessage );
      } catch (err) {
        reject(err)
      }
    });

    fs.createReadStream(file.path).pipe(blobStream);
  })
} catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send(error.message);
  }
};


const get_product = async (req, res) => {
  try {
    const product_id = req.params.product_id;

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      const message = 'ID is not correct!';
      return res.status(400).send(message);
    }

    const data = await Products.findById(product_id);

    if (!data) {
      const message = 'Product not found!';
      return res.status(404).send(message);
    }

    const productData = {
      arabic_name: data.arabic_name ,
      english_name :data.english_name,
      price: data.price,
      size: data.size,
      rate: data.rate,
      photo: data.photo,
      id:data._id
    };

    res.status(200).json(productData);
  } catch (e) {
    res.status(500).send(e.message);
  }
};


const get_all_products = async (req, res) => {
  try {
    const data = await Products.find();

    if (!data) {
      const message = 'No products found!';
      return res.status(404).send(message);
    }

    const productList = data.map(product => ({
      arabic_name:  product.arabic_name ,
      english_name: product.english_name,
      price: product.price,
      size: product.size,
      rate: product.rate,
      photo: product.photo,
      id:product._id
    }));

    res.status(200).json(productList);
  } catch (e) {
    res.status(500).send(e.message);
  }
};


const editData = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      const message = req.language === 'ar' ? 'المعرف غير صحيح!' : 'ID is not correct!';
      return res.status(404).send(message);
    }

    const file = req.files.find(f => f.fieldname === 'file')
    if (!file) {
      const { arabic_name, english_name, price, size, rate } = req.body;
      const newdata = await Products.findByIdAndUpdate(product_id, { arabic_name, english_name, price, size, rate }, { new: true }) 
      
      await newdata.save();
      
      const successMessage = req.language === 'ar' ? 'تم تحديث البيانات بنجاح!' : 'Data updated successfully!';
     return res.status(200).send({ message: successMessage, newdata });
     
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "gs://fireproducts-b6b10.appspot.com"

      });
    }

    const bucket = admin.storage().bucket();
    const blob = bucket.file(file.filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: 'image/jpg'
      }
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error uploading file.');
    });

    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        fs.unlinkSync(file.path);

   
    
    const { arabic_name, english_name, price, size, rate } = req.body;
    const newdata = await Products.findByIdAndUpdate(product_id, { arabic_name, english_name, price, size, photo:publicUrl, rate }, { new: true }) 
    
    await newdata.save();
    
    const successMessage = req.language === 'ar' ? 'تم تحديث البيانات بنجاح!' : 'Data updated successfully!';
    res.status(200).send({ message: successMessage, newdata });
   
  } catch (err) {
    console.error(err);
    res.status(500).send('Error making file public.');
  }
});

fs.createReadStream(file.path).pipe(blobStream);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const delete_product = async (req, res) => {
    try {
        const product_id = req.params.product_id;

        if (!mongoose.Types.ObjectId.isValid(product_id)) {
            const message = 'ID is not correct!';
            return res.status(404).send(message);
        }

        const product = await Products.findByIdAndDelete(product_id);

        if (!product) {
            const message = 'Product not found!';
            return res.status(404).send(message);
        }

     
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: "gs://fireproducts-b6b10.appspot.com"

            });
        }

        const bucket = admin.storage().bucket();
        const file = bucket.file(product.photo.split('/').pop()); 

        await file.delete();
        
        await User.updateMany(
            { "cart.product_id": product_id },
            { $pull: { cart: { product_id: product_id } } }
        );

        await User.updateMany(
            { "my_save_products.product_id": product_id },
            { $pull: { my_save_products: { product_id: product_id } } }
        );

        const successMessage = 'Product deleted successfully and removed from carts, saved products, and Firebase storage!';
        res.status(200).send(successMessage);
    } catch (e) {
        res.status(500).send(e.message);
    }
};

const delete_all_products = async (req, res) => {
  try {
    await Products.deleteMany();
    
    const successMessage = req.language === 'ar' ? 'تم حذف جميع المنتجات بنجاح!' : 'All products deleted successfully!';
    res.status(200).send(successMessage);
  } catch (e) {
    res.status(500).send(e.message);
  }
};


const get_all_users_emails = async (req, res) => {
  try {
    const data = await Emails.find();

    if (!data) {
      const message = 'No products found!';
      return res.status(404).send(message);
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const get_imports = async (req, res) => {
  try {
    const data = await Imports.find();

    if (!data) {
      return res.status(404).send('No Imports found!');
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const delete_imports = async (req, res) => {
  try {
    const import_id = req.params.import_id;
    
    if (!mongoose.Types.ObjectId.isValid(import_id)) {
      const message =  'ID is not correct!';
      return res.status(404).send(message);
    }
    
    await Imports.findByIdAndDelete(import_id);
    
    const successMessage = 'import deleted successfully!';
    res.status(200).send(successMessage);
  } catch (e) {
    res.status(500).send(e.message);
  }
};


const delete_all_imports = async (req, res) => {
 try {
 await Imports.deleteMany();
 const successMessage = req.language === 'ar' ? 'تم حذف جميع الطلبات بنجاح!' : 'All imports deleted successfully!';
 res.status(200).send(successMessage);
 } catch (e) { res.status(500).send(e.message); } };

module.exports = {
  admin_Register,
  admin_Login,
  add_product,
  get_product,
  editData,
  get_all_products,
  delete_product,
  delete_all_products,
  get_all_users_emails,
  get_imports,
  delete_imports,
delete_all_imports

};
