const router = require('express').Router()
const User = require("../models/user");

const {auth}=require('../middleware/auth')
const { setLanguage } = require('../middleware/setLanguage');     

const {user_Register,user_Login,user_get_product ,user_get_all_products,
    save_product , delete_save_product , get_all_save_products ,addToCart, 
    viewCart, updateCartQuantity, calculateTotal , delete_from_cart , add_email_for_connect,forgetPassword,resetPassword
}=require('../controllers/web_control')

router.post('/user_register',setLanguage,user_Register)
router.post('/user_login',setLanguage,user_Login)

router.post('/save_product/:product_id',auth,setLanguage,save_product)
router.delete('/delete_save_product/:product_id',auth,setLanguage,delete_save_product)



router.get('/get_product/:product_id', auth, setLanguage, user_get_product)
router.get('/get_all_products', setLanguage, user_get_all_products)
router.get('/get_all_save_products', auth, setLanguage, get_all_save_products)


router.post('/cart/add/:product_id', auth,setLanguage, addToCart)
router.get('/cart/view', auth,setLanguage, viewCart)
router.put('/cart/update_quantity/:product_id', auth,setLanguage, updateCartQuantity)
router.get('/cart/total', auth,setLanguage, calculateTotal)
router.delete('/remove_from_cart/:product_id',auth,setLanguage,delete_from_cart)

router.post('/add_email_for_connect', auth , setLanguage , add_email_for_connect)


router.post('/forgetpassword',forgetPassword)
router.get('/resetpassword/:token',  async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    passwordResetToken: token,
  });

  if (!user) {
    return res.status(400).send('Invalid token or token has expired.');
  }
res.send(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Password</title>
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

        h1 {
          color: #333;
        }

        label {
          display: block;
          margin: 20px 0 10px;
          font-size: 16px;
          color: #555;
        }

        input[type="password"] {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        button {
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 18px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #218838;
        }

        .info {
          margin-top: 10px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Reset your password</h1>
        <form action="/app/user/resetpassword/${token}" method="POST">
          <label for="password">New Password:</label>
          <input type="password" name="password" id="password" required />
          <button type="submit">Reset Password</button>
        </form>
        <div class="info">
          <p>Please enter your new password to continue.</p>
        </div>
      </div>
    </body>
  </html>
`);

})

router.post('/resetpassword/:token',resetPassword)


module.exports = router;
