import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();

    const goDashboard = () => {
        navigate('/client-dashboard');
    }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your transaction has been completed successfully.
        </p>
        
        <div className="bg-gray-100 rounded p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-medium">TXN123456789</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium">$99.99</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors">
            View Receipt
          </button>
          <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded transition-colors" onClick={goDashboard}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;