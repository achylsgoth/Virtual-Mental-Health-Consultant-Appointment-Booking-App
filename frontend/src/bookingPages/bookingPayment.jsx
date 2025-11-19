import React, { useState } from "react";
import { Container, Typography, Card, CardContent, Button, Grid, TextField } from "@mui/material";

const PaymentPage = ({ appointmentDetails }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = () => {
    // Integrate with Stripe payment processing here
    console.log("Processing payment...");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Confirm Your Payment
      </Typography>
      
      <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Appointment Details</Typography>
          <Typography variant="body1"><strong>Therapist:</strong> {appointmentDetails?.therapistName || "Dr. John Doe"}</Typography>
          <Typography variant="body1"><strong>Date:</strong> {appointmentDetails?.date || "February 22, 2025"}</Typography>
          <Typography variant="body1"><strong>Time:</strong> {appointmentDetails?.time || "11:00 AM - 11:40 AM"}</Typography>
          
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            * Refund policy: Cancellations must be made at least 24 hours before the booked appointment to receive a full refund.
          </Typography>
        </CardContent>
      </Card>
      
      <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Card Number"
                fullWidth
                variant="outlined"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Expiry Date"
                fullWidth
                variant="outlined"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CVV"
                fullWidth
                variant="outlined"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                type="password"
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handlePayment}
          >
            Pay & Confirm Appointment
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentPage;
