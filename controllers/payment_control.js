const dns = require('dns');
const axios = require('axios');
const Imports = require('../models/imports'); 
const User = require('../models/user'); 
require('dotenv').config();


dns.setServers(['8.8.8.8', '8.8.4.4']);


const createPayment = async (req, res) => {
  try {
    const { payment_data, payment_method, delivery_fee } = req.body;
    const user = req.user;

  
    const user_data = await User.findById(user._id);
    if (!user_data) {
      return res.status(400).send('User not found');
    }

    const products = payment_data.products;
    let totalAmount = 0;
    const product_names = [];
    const product_ids = [];

 
    products.forEach(product => {
      totalAmount += product.price * product.quantity;
      product_names.push(product.product_name);
      product_ids.push(product.product_id);
    });

    totalAmount += delivery_fee;

    try {

      if (payment_method === 'paylink') {
        try {
        
          const paymentResponse = await axios.post('https://api.paylink.sa/v1/payments', {
            amount: totalAmount,
            currency: "SAR", 
            customer_name: `${user_data.firstname} ${user_data.lastname}`,
            customer_email: user_data.email,
            customer_phone: user_data.mobile,
            success_url: "https://yourwebsite.com/app/payment-success",
            cancel_url: "https://yourwebsite.com/app/payment-cancel",
            payment_methods: ["all"]
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.PAYLINK_API_KEY}`,
              'Content-Type': 'application/json',
              'X-API-ID': process.env.PAYLINK_API_ID 
            }
          });

          const payment_url = paymentResponse.data.payment_url;

          
          const newImport = new Imports({
            client_id: user._id,
            client_name: `${user_data.firstname} ${user_data.lastname}`,
            client_address: user_data.address,
            client_mobile: user_data.mobile,
            product_names: product_names,
            product_ids: product_ids,
            totalAmount: totalAmount,
            delivery_fee: delivery_fee,
            is_buy: false,
          });

          await newImport.save();
          return res.redirect(payment_url);

        } catch (paymentError) {
          console.error('Payment error:', paymentError.response ? paymentError.response.data : paymentError.message);
          return res.status(500).send('Payment error: ' + (paymentError.response ? paymentError.response.data : paymentError.message));
        }

      } else if (payment_method === 'cash') {
      
        const newImport = new Imports({
          client_id: user._id,
          client_name: `${user_data.firstname} ${user_data.lastname}`,
          client_address: user_data.address,
          client_mobile: user_data.mobile,
          product_names: product_names,
          product_ids: product_ids,
          totalAmount: totalAmount,
          delivery_fee: delivery_fee,
          is_buy: false,
        });

        await newImport.save();
        return res.status(200).send('Your request has been saved. We will contact you.');
      } else {
        return res.status(400).send('Payment method not accepted');
      }

    } catch (dnsError) {
      console.error('DNS resolution error:', dnsError);
      return res.status(500).send('DNS resolution error: ' + dnsError.message);
    }

  } catch (error) {
    console.error('Create payment error:', error.message);
    return res.status(500).send(error.message);
  }
};


const payment_success = async (req, res) => {
  try {
    const user = req.user;
    const user_data = await User.findById(user._id);

    if (!user_data) {
      return res.status(400).send('User not found');
    }

    const updateResult = await Imports.updateOne(
      { client_id: user_data._id, is_buy: false },
      { $set: { is_buy: true } }
    );

    if (updateResult.modifiedCount > 0) {
      return res.redirect('/success-message');
    } else {
      return res.status(404).send('No pending transaction found for this user.');
    }
  } catch (error) {
    console.error('Payment success error:', error.message);
    return res.status(500).send(error.message);
  }
};

module.exports = { createPayment, payment_success };
