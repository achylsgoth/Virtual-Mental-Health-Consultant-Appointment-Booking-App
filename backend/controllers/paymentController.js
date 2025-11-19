const axios = require('axios');
const khaltiConfig = require('../config/khaltiConfig');
const User = require('../models/User');
const Payment = require('../models/paymentModel');

const paymentController = {
    //initiate khalti payment
    initiatePayment: async (req, res) => {
        try{
            const {amount, purchase_order_id, purchase_order_name, customer_info, therapistId, clientId} = req.body;

            //validate required fields
            if(!amount|| !purchase_order_id || !purchase_order_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount, purchased order id, and name is required'
                });
            }
            const payload = {
                return_url: 'http://localhost:5173/paymentSuccess',
                website_url:'http://localhost:5173',
                amount: amount * 100,
                purchase_order_id,
                purchase_order_name,
                customer_info: customer_info || {}
            };

            const response = await axios.post(
                khaltiConfig.KHALTI_INITIATE_URL,
                payload,
                {
                    headers:{
                        'Authorization': `Key ${khaltiConfig.KHALTI_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            //save pending payment in db
        const payment =  new Payment({
                therapistId, 
                clientId,
                amount: amount,
                status:'pending',
                paymentMethod:'khalti',
                transactionId: response.data.pidx,
                providerResponse: response.data
            });

            await payment.save();

            res.json({
                success: true,
                data: response.data,
                message: 'Payment initiated successfully'
            });
        } catch (error){
            console.error('Error initiating payment: ', error);
            res.status(500).json({success: false, message:'Failed to initiate payment', erro: error.message || error.message});
        }
    },

    //Verify Khalti payment
    verifyPayment: async (req, res) => {
        try{
            const {pidx} = req.body;
            if(!pidx) return res.status(400).json({success: false, message:
                'pidx is required'
            }) ;

            const response = await axios.post(
                khaltiConfig.KHALTI_VERIFICATION_URL,
                {pidx},
                {
                    headers:{
                        'Authorization': `Key ${khaltiConfig.KHALTI_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const paymentDetails = response.data;
            //update payment status.
            const payment = await Payment.findOneAndUpdate(
                {
                    transactionId: pidx
                },
                {
                    status: paymentDetails.status === 'Completed' ? 'paid' : 'failed',
                    providerResponse: paymentDetails,
                },
                {new: true}
            );

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: paymentDetails
            });
        } catch(error){
            console.error('Error verifying payment:', error.response?.data || error.message);
            res.status(500).json({success: false, message:'Failed to verify payment'});
        }
    },
    // Payment success callback (for frontend redirect)
  paymentSuccess: (req, res) => {
    // This is where Khalti will redirect after successful payment
    // You can render a success page or redirect to your frontend
    res.json({
      success: true,
      message: 'Payment successful',
      data: req.query
    });
  },

  // Payment failure callback (for frontend redirect)
  paymentFailure: (req, res) => {
    // This is where Khalti will redirect after failed payment
    res.json({
      success: false,
      message: 'Payment failed',
      data: req.query
    });
  }
};

module.exports = paymentController;