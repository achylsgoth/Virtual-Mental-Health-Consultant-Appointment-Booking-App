import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Alert, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import EmailIcon from "@mui/icons-material/Email";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  // Create refs for input fields
  const inputRefs = useRef([]);
  const [code, setCode] = useState(Array(6).fill(""));
  const navigate = useNavigate();

  const { error, verifyEmail } = useAuthStore();

  // Handle clipboard paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // If pasted data looks like a verification code (digits only)
    if (/^\d+$/.test(pastedData)) {
      // Get only the first 6 digits if longer
      const digits = pastedData.slice(0, 6).split("");
      
      // Fill the array with the pasted digits and empty strings if needed
      const newCode = [...digits, ...Array(6 - digits.length).fill("")].slice(0, 6);
      setCode(newCode);
      
      // Focus the appropriate field based on paste length
      const focusIndex = Math.min(digits.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    if (/^\d?$/.test(value)) {
      const updatedCode = [...code];
      updatedCode[index] = value;
      setCode(updatedCode);
    }

    // Move focus to the next input if a digit is entered
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    try {
      const response = await verifyEmail(verificationCode);
      toast.success("Email verified successfully.");
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  // Handle direct code pasting in any field
  useEffect(() => {
    const handleWindowPaste = (e) => {
      if (document.activeElement && inputRefs.current.includes(document.activeElement)) {
        handlePaste(e);
      }
    };

    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, []);

  // Add another way to handle code entry using a hidden input for mobile
  const [hiddenInputValue, setHiddenInputValue] = useState("");
  const hiddenInputRef = useRef(null);
  
  const focusHiddenInput = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const handleHiddenInputChange = (e) => {
    const value = e.target.value;
    setHiddenInputValue(value);
    
    // Only process numeric input
    const digits = value.replace(/\D/g, "").slice(0, 6).split("");
    const newCode = [...digits, ...Array(6 - digits.length).fill("")].slice(0, 6);
    setCode(newCode);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
            <EmailIcon sx={{ color: "#5c6bc0", fontSize: 48 }} />
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#37474f" }}>
            Verify Your Email
          </Typography>
          
          <Typography variant="body2" color="#78909c" mb={4}>
            Please enter the 6-digit verification code we sent to your email address.
            You can enter the digits individually or paste the entire code.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-icon": { color: "#e57373" },
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={focusHiddenInput}
          >
            {/* Hidden input for easier pasting and mobile input */}
            <input
              type="tel"
              ref={hiddenInputRef}
              value={hiddenInputValue}
              onChange={handleHiddenInputChange}
              maxLength={6}
              style={{ 
                opacity: 0, 
                position: "absolute", 
                pointerEvents: "none",
                height: 0 
              }}
            />
            
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                mb: 4,
                gap: 1,
              }}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <TextField
                  key={index}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={code[index]}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  onClick={() => inputRefs.current[index].select()}
                  variant="outlined"
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: "center", fontSize: "1.5rem", padding: "8px 0" },
                  }}
                  sx={{
                    width: "48px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#64b5f6",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#b0bec5",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#5c6bc0",
                    },
                  }}
                />
              ))}
            </Box>

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
              Verify & Continue
            </Button>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#5c6bc0",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => toast.success("Verification code has been resent")}
              >
                Didn't receive a code? Resend
              </Typography>
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Typography variant="caption" color="#78909c">
                Your mental health journey matters. We're here with you every step of the way.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmail;