const User = require("../models/user");
const Imports = require("../models/imports")
const Products = require("../models/products")
const Emails = require("../models/emails")
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const user_Register = async (req, res) => {
  try {
    const   {firstname,lastname,email, mobile,password, address } = req.body;
    const dublicatedEmail = await User.findOne({ email: email });
    if (dublicatedEmail) {
      const message = req.language === 'ar' ? 'البريد الإلكتروني موجود بالفعل!' : 'Email already exists!';
      return res.status(400).send({message});
    }
    const newUser = new User({firstname,lastname,email, mobile,password, address });
    await newUser.save();
    
    const message = req.language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration successful!';
    res.status(200).send({message});
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const user_Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const message = req.language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Email or password is incorrect';
      return res.status(404).send({message});
    }
    const isPassword = await bcryptjs.compare(password, user.password);
    if (!isPassword) {
      const message = req.language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Email or password is incorrect';
      return res.status(404).send({message});
    }

    const SECRETKEY = process.env.SECRETKEY;
    const token = jwt.sign({ id: user._id }, SECRETKEY);
    res.cookie("access_token", `Bearer ${token}`, {
      expires: new Date(Date.now() + 60 * 60 * 24 * 1024 * 300),
      httpOnly: true,
    });

    user.tokens.push(token);
    await user.save();

    const message = req.language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!';
    res.status(200).send({ access_token: `Bearer ${token}`, success: message });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const user_get_product = async (req, res) => {
  try {
    const product_id = req.params.product_id;

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      const message = req.language === 'ar' ? 'المعرف غير صحيح!' : 'ID is not correct!';
      return res.status(400).send(message);
    }

    const data = await Products.findById(product_id);

    if (!data) {
      const message = req.language === 'ar' ? 'المنتج غير موجود!' : 'Product not found!';
      return res.status(404).send(message);
    }

    const productData = {
      name: req.language === 'ar' ? data.arabic_name : data.english_name,
      price: data.price,
      size: data.size,
      rate: data.rate,
      photo: data.photo
    };

    res.status(200).send(productData);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const user_get_all_products = async (req, res) => {
  try {
    const data = await Products.find();

    if (!data || data.length === 0) {
      const message = req.language === 'ar' ? 'لم يتم العثور على المنتجات!' : 'No products found!';
      return res.status(404).send({message});
    }

    const productList = data.map(product => ({
      name: req.language === 'ar' ? product.arabic_name : product.english_name,
      price: product.price,
      size: product.size,
      rate: product.rate,
      photo: product.photo,
      id: product._id
    }));

    res.status(200).send(productList);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const save_product = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).send("Please login or signup!!");
    }

    const product_id = req.params.product_id;
    const productdata = await Products.findById(product_id);

    if (!productdata) {
      const message = req.language === 'ar' ? 'المنتج غير موجود!' : 'Product not found!';
      return res.status(404).send({message});
    }

    const productExists = user.my_save_products.find(savedProduct => 
      savedProduct.product_id && savedProduct.product_id.toString() === product_id.toString()
    );

    if (productExists) {
      const message = req.language === 'ar' ? 'المنتج موجود بالفعل في المنتجات المحفوظة!' : 'Product already exists in saved products!';
      return res.status(400).send({message});
    }

    user.my_save_products.push({
      product_id: productdata._id,
      product_name: req.language === 'ar' ? productdata.arabic_name : productdata.english_name,
      product_rate: productdata.rate,
      product_price: productdata.price,
      product_photo: productdata.photo,
    });

    await user.save();

    const message = req.language === 'ar' ? 'تم حفظ المنتج بنجاح!' : 'Product saved successfully!';
    res.status(200).send({ message });
  } catch (e) {
    res.status(500).send(e.message);
  }
};


const delete_save_product = async (req, res) => {
  try {
    const user = req.user;
     if(!user){return res.status(400).send("please login or signup !!")}
  
    const product_id = new mongoose.Types.ObjectId(req.params.product_id);


   const result = await User.findOneAndUpdate(
  { _id: user._id },
  { $pull: { my_save_products: { product_id: product_id } } },
  { new: true }
);

if (!result) {
  return res.status(404).send('لم يتم العثور على المستخدم أو المنتج!');
}


    const message = req.language === 'ar' ? 'تمت إزالة المنتج من المحفوظات بنجاح!' : 'Product successfully removed from saved products!';
    res.status(200).send({message});
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const get_all_save_products = async (req, res) => {
  try {
    const user = req.user;
 if(!user){return res.status(400).send("please login or signup !!")}
    const user_data = await User.findById(user._id)
    if (!user_data) {
      const message = req.language === 'ar' ? ' المستخدم غير موجود برجاء تسجيل الدخول !' : 'User not found!';
      return res.status(404).send({message});
    }
    const products_data = user_data.my_save_products
    res.status(200).send(products_data);
  } catch (e) {
    res.status(500).send(e.message);
  }
};


const addToCart = async (req, res) => {
  try {
      const user = req.user;
     if(!user){return res.status(400).send("please login or signup !!")}
      const product_id = req.params.product_id;

      const product = await Products.findById(product_id);
      if (!product) {
          const message = req.language === 'ar' ? 'المنتج غير موجود!' : 'Product not found!';
          return res.status(404).send({message});
      }

 
      const userCart = user.cart.find(item => item.product_id.toString() === product_id.toString());
      if (userCart) {
          const message = req.language === 'ar' ? 'المنتج موجود بالفعل في السلة!' : 'Product already in cart!';
          return res.status(400).send({message});
      }

      user.cart.push({ product_id, quantity: 1 });
      await user.save();

      const message = req.language === 'ar' ? 'تم إضافة المنتج إلى السلة بنجاح!' : 'Product added to cart successfully!';
      res.status(200).send({ message, cart: user.cart });
  } catch (e) {
      res.status(500).send(e.message);
  }
};

const viewCart = async (req, res) => {
    try {
        const user = req.user;
        if(!user){return res.status(400).send("please login or signup !!")}
        
        await user.populate('cart.product_id');
        
        const cartItems = user.cart.map(item => {
            if (!item.product_id) {
              
                const message = req.language === 'ar' ? 'المنتج غير موجود!' : 'Product not found!';
                return { error: message };
            }

            return {
                product_name: req.language === 'ar' ? item.product_id.arabic_name : item.product_id.english_name,
                price: item.product_id.price,
                quantity: item.quantity,
                total_price: item.product_id.price * item.quantity,
                product_id: item.product_id._id,
                photo: item.product_id.photo
            };
        });

        res.status(200).send(cartItems);
    } catch (e) {
        res.status(500).send(e.message);
    }
};


const updateCartQuantity = async (req, res) => {
  try {
      const user = req.user;
      if(!user){return res.status(400).send("please login or signup !!")}
      const product_id = req.params.product_id;
      const { quantity } = req.body;

      if (quantity < 1) {
          const message = req.language === 'ar' ? 'الكمية يجب أن تكون أكبر من صفر!' : 'Quantity must be greater than zero!';
          return res.status(400).send({message});
      }

      const cartItem = user.cart.find(item => item.product_id.toString() === product_id.toString());
      if (!cartItem) {
          const message = req.language === 'ar' ? 'المنتج غير موجود في السلة!' : 'Product not found in cart!';
          return res.status(404).send({message});
      }

      cartItem.quantity = quantity;
      await user.save();

      const message = req.language === 'ar' ? 'تم تحديث الكمية بنجاح!' : 'Quantity updated successfully!';
      res.status(200).send({ message, cart: user.cart });
  } catch (e) {
      res.status(500).send(e.message);
  }
};

const calculateTotal = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).send("Please login or signup!!");
    }

    await user.populate('cart.product_id');

    const total_price = user.cart.reduce((total, data) => {
      return total + (data.product_id.price * data.quantity);
    }, 0);

    const message = req.language === 'ar' ? 'المبلغ الكلى:' : 'Total price:';
    res.status(200).send({ message, total: total_price });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const delete_from_cart = async (req, res) => {
  try {
    const user = req.user;
     if(!user){return res.status(400).send("please login or signup !!")}
    const product_id = req.params.product_id;

    await User.findByIdAndUpdate(
      user._id,
      {
        $pull: {
          cart: { product_id: product_id }
        }
      },
      { new: true } 
    );

    const message = req.language === 'ar' ? 'تم المسح:' : 'Item deleted:';
    res.status(200).send({message});
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const add_email_for_connect = async (req, res) => {
  try {
    const user = req.user;
     if(!user){return res.status(400).send("please login or signup !!")}
   const data = req.body.email
  const new_email = new Emails({email:data})
    await new_email.save()

    const message = req.language === 'ar' ? 'شكرا جزيلا' : 'thanks';
    res.status(200).send({message});
  } catch (e) {
    res.status(500).send(e.message);
  }
};



const forgetPassword = async (req, res) => {
  try {
    const user = req.body;
    const dubUser = await User.findOne({ email: user.email });
    if (!dubUser) {
      return res
        .status(404)
        .send(" email is not exist , please write a correct email ");
    }
    const SEKRET = process.env.SECRET;
    const resettoken = crypto.randomBytes(32).toString("hex");
    dubUser.passwordResetToken = crypto
      .createHmac("sha256", SEKRET)
      .update(resettoken)
      .digest("hex");

    const token = dubUser.passwordResetToken;
    await dubUser.save();
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      service: process.env.SERVICE,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
    const Message = `${process.env.BASE_URL}/app/user/resetpassword/${token}`;

    async function main() {
      const info = await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: dubUser.email,
        subject: " RESET PASSWORD ",
        html: `<P>hello ${dubUser.email} go to link ${Message} for "RESET PASSWORD" </P> <P> expires after 1h !!</P>`,
      });

      console.log("Message sent");
    }

    main().catch(console.error);

    res.status(200).send(" check your email to reset password !");
  } catch (error) {
    res.status(500).send(error.message);
  }
};




const resetPassword =  async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.params.token;

    
    const user = await User.findOne({
      passwordResetToken: token,
    });

    if (!user) {
      return res.status(400).send('Token expired or invalid. Please try again.');
    }

    
    user.password = password
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    res.send(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Changed Successfully</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }

        .container {
          background-color: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 100%;
          max-width: 400px;
        }

        .success-icon {
          font-size: 48px;
          color: #28a745;
        }

        .message {
          font-size: 20px;
          color: #333;
          margin-top: 20px;
        }

        .message p {
          margin: 0;
        }

        .success-icon + .message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">
            &#10004; <!-- رمز علامة الصح -->
        </div>
        <div class="message">
          <p>Password has been successfully changed!</p>
        </div>
      </div>
    </body>
  </html>
`);

  } catch (e) {
    res.status(500).send('Server error.');
  }
}






module.exports = {
  user_Register,
  user_Login,
  user_get_product,
  user_get_all_products,

  save_product,
  delete_save_product,
  get_all_save_products,
  
  addToCart, 
  viewCart, 
  updateCartQuantity, 
  calculateTotal,
  delete_from_cart,

  add_email_for_connect,
  forgetPassword,
  resetPassword,
  
};
