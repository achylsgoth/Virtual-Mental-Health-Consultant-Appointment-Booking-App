const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Therapist',
        required:true
    },
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Client',
        required: true
    },
    amount:{
        type:Number,
        required: true
    },
    currency:{
        type:String,
        default:'NPR',
    },
    status:{
        type:String,
        required: true,
        enum:['pending', 'paid', 'failed', 'refunded'],
        default:'pending'
    },
    paymentMethod:{
        type: String,
        enum:['khalti', 'esewa'],
        required: true
    },
    transactionId: {
        type: String,
        unique: true
    },
    providerResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
},{
    timestamps:true
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;