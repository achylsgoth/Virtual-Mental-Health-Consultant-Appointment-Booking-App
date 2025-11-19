

module.exports = {
    KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY,
    KHALTI_VERIFICATION_URL: 'https://a.khalti.com/api/v2/epayment/lookup/',
    KHALTI_INITIATE_URL:'https://a.khalti.com/api/v2/epayment/initiate/',
    KHALTI_RETURN_URL:'http://localhost:5173/paymentSuccess',
    KHALTI_WEBSITE_URL:'http://localhost:5173'
};