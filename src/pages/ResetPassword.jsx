import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { resetPassword } from "../services/api";

const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,128}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const passwordChecks = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&]/.test(password),
    password.length >= 8,
  ];
  const passwordStrength = passwordChecks.filter(Boolean).length;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("The password reset link is invalid or expired.");
      return;
    }
    if (!passwordPattern.test(password)) {
      setError("Password must be 8+ characters with uppercase, lowercase, number, and one of ! @ # $ % ^ &.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({ token, password });
      setSuccess(result.message);
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", p: 2, bgcolor: "#F8FAFC" }}>
      <Card sx={{ width: "100%", maxWidth: 460, p: { xs: 3, sm: 4.5 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Reset password</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Choose a new ShopEase password.</Typography>
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="New password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value.slice(0, 128))}
            slotProps={{
              htmlInput: { maxLength: 128, autoComplete: "new-password" },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      sx={{
                        minWidth: 72,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: "none",
                        px: 1.25,
                        py: 0.6,
                      }}
                      startIcon={showPassword ? <VisibilityOff /> : <Visibility />}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
            required
            fullWidth
          />
          <Box sx={{ mt: -1.5 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 0.5,
                mb: 0.75,
              }}
              aria-label={`Password strength ${passwordStrength} of 5`}
            >
              {passwordChecks.map((passed, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: passed ? "success.main" : "grey.300",
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Password strength: {passwordStrength === 5 ? "Strong" : passwordStrength >= 3 ? "Fair" : "Weak"}. Include uppercase, lowercase, number, special sign, and at least 8 characters.
            </Typography>
          </Box>
          <TextField
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value.slice(0, 128))}
            slotProps={{
              htmlInput: { maxLength: 128, autoComplete: "new-password" },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      sx={{
                        minWidth: 72,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: "none",
                        px: 1.25,
                        py: 0.6,
                      }}
                      startIcon={showPassword ? <VisibilityOff /> : <Visibility />}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
            required
            fullWidth
            error={Boolean(confirmPassword) && confirmPassword !== password}
            helperText={
              confirmPassword && confirmPassword !== password
                ? "Passwords do not match."
                : ""
            }
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
          <Button component={NavLink} to="/login">Back to sign in</Button>
        </Box>
      </Card>
    </Box>
  );
}
