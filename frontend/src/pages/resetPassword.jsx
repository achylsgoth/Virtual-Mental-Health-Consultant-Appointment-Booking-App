import * as React from "react";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
  Alert
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { resetPassword, error } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleToggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const validatePassword = (password) => {
    // Basic password validation - can be expanded as needed
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validate password inputs
    if (!validatePassword(newPassword)) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match. Please try again.");
      return;
    }

    try {
      await resetPassword(token, newPassword);
      toast.success("Password reset successfully.");
      navigate('/signin');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.05)",
            background: "white",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #64b5f6 0%, #81c784 50%, #ffb74d 100%)",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <LockResetIcon sx={{ color: "#5c6bc0", fontSize: 48 }} />
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#37474f" }}>
            Reset Your Password
          </Typography>

          <Typography variant="body2" color="#78909c" mb={3}>
            Please enter a new secure password for your account.
          </Typography>

          <Divider sx={{ my: 2, color: "#90a4ae", "&::before, &::after": { borderColor: "#cfd8dc" } }} />

          {(error || validationError) && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-icon": { color: "#e57373" },
              }}
            >
              {error || validationError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              variant="outlined"
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: "#78909c" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": {
                    borderColor: "#64b5f6",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#b0bec5",
                },
                "& .MuiInputLabel-root": {
                  color: "#78909c",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5c6bc0",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#5c6bc0",
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      sx={{ color: "#78909c" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": {
                    borderColor: "#64b5f6",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#b0bec5",
                },
                "& .MuiInputLabel-root": {
                  color: "#78909c",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5c6bc0",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#5c6bc0",
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{
                py: 1.5,
                backgroundColor: "#5c6bc0",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(92, 107, 192, 0.3)",
                textTransform: "none",
                fontSize: "1rem",
                ":hover": {
                  backgroundColor: "#3949ab",
                  boxShadow: "0 6px 14px rgba(92, 107, 192, 0.4)",
                },
              }}
            >
              Reset Password
            </Button>
          </Box>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Typography variant="caption" color="#78909c">
              Your mental health journey matters. We're here with you every step of the way.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}