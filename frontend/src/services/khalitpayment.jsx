import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Khalti SDK (make sure to include the Khalti SDK script in your index.html)
const KhaltiCheckout = window.KhaltiCheckout;

const KhaltiPaymentGateway = ({ 
  therapist, 
  selectedTime, 
  selectedEndTime, 
  onPaymentSuccess 
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration for Khalti payment
  const config = {
    publicKey: "test_public_key_YOUR_ACTUAL_PUBLIC_KEY", // Replace with your actual Khalti public key
    productIdentity: `therapy_session_${therapist.id}`,
    productName: `Therapy Session with ${therapist.fullname}`,
    productUrl: "http://localhost:3000/booking", // Your frontend URL
    eventHandler: {
      onSuccess: async (payload) => {
        setIsProcessing(true);
        try {
          // Verify payment with backend
          const verificationResponse = await axios.post('http://localhost:5555/payment/verify', {
            token: payload.token,
            amount: payload.amount,
            therapistId: therapist.id,
            scheduledTime: selectedTime
          });

          if (verificationResponse.data.success) {
            // Payment verified, proceed with booking
            onPaymentSuccess(payload);
            toast.success('Payment Successful! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            toast.error('Payment verification failed');
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed');
          setIsProcessing(false);
        }
      },
      onError: (error) => {
        console.error('Khalti Payment Error:', error);
        toast.error('Payment failed. Please try again.');
        setIsProcessing(false);
      }
    },
    paymentPreference: [
      "KHALTI",
      "EBANKING",
      "MOBILE_BANKING",
      "CONNECT_IPS",
      "SCT",
    ],
  };

  const handlePayment = () => {
    // Initialize Khalti Checkout
    const checkout = new KhaltiCheckout(config);
    
    // Trigger Khalti payment popup
    checkout.show({
      amount: therapist.sessionPrice * 100, // Amount in paisa
    });
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          textAlign: 'center',
          backgroundColor: 'white'
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
          Confirm Payment
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#34495e' }}>
            Session Details
          </Typography>
          <Typography variant="body1">
            Therapist: {therapist.fullname}
          </Typography>
          <Typography variant="body1">
            Date: {new Date(selectedTime).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            Time: {new Date(selectedTime).toLocaleTimeString()} - {new Date(selectedEndTime).toLocaleTimeString()}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: '#2c3e50' }}>
            Total Amount: NPR {therapist.sessionPrice}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handlePayment}
          disabled={isProcessing}
          sx={{ 
            backgroundColor: '#3498db', 
            py: 1.5,
            '&:hover': { backgroundColor: '#2980b9' },
            '&.Mui-disabled': {
              backgroundColor: '#bdc3c7',
              color: 'white'
            }
          }}
        >
          {isProcessing ? (
            <CircularProgress size={24} />
          ) : (
            'Pay with Khalti'
          )}
        </Button>
      </Paper>
    </Container>
  );
};

export default KhaltiPaymentGateway;