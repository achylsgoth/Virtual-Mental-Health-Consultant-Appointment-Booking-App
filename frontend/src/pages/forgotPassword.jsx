import * as React from "react";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Container,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const { error, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation check for email
    if (!email.trim()) {
      setLocalError("Email is required.");
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {!isSubmitted ? (
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            px: 3,
            py: 4,
            backgroundColor: "white",
            borderRadius: 10,
            boxShadow: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Typography>

          {/* Error Alerts */}
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError(""); // Clear local error when user types
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: "#34495E",
              borderRadius: 5,
              ":hover": { backgroundColor: "#7756c6" },
            }}
          >
            Send Reset Email
          </Button>

          <Typography
            component="span"
            color="primary"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => navigate("/signin")}
          >
            <Divider sx={{ my: 2 }} />
            Back
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card
            sx={{
              width: 400,
              textAlign: "center",
              borderRadius: 5,
              boxShadow: 5,
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                Forgot Password?
              </Typography>
              <EmailIcon sx={{ fontSize: 60, color: "#555", mb: 2 }} />
              <Typography sx={{ mb: 4, color: "#555" }}>
                If an account exists for <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 50,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                onClick={() => navigate("/signin")}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
