import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { requestPasswordReset, resetPassword } from "../services/api";

const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,128}$/;

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState(location.state?.message || "");
  const [demoCode, setDemoCode] = useState(location.state?.demoCode || "");
  const [resending, setResending] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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
    setInfo("");
    if (!email.trim()) {
      setError("Enter the email address you requested the code for.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code from your email.");
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
      const result = await resetPassword({ email: email.trim(), code, password });
      setSuccess(result.message);
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setResending(true);
    try {
      const result = await requestPasswordReset(email.trim());
      setInfo(result.message);
      setDemoCode(result.demoCode || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", p: 2, bgcolor: "background.default" }}>
      <Card sx={{ width: "100%", maxWidth: 460, p: { xs: 3, sm: 4.5 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Reset password</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Enter the 6-digit code we emailed you and choose a new ShopEase password.
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
          {demoCode ? (
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" sx={{ whiteSpace: "nowrap" }} onClick={() => setCode(demoCode)}>
                  Use code
                </Button>
              }
              sx={{ alignItems: "center" }}
            >
              Your verification code: <strong style={{ letterSpacing: "0.2em" }}>{demoCode}</strong>
            </Alert>
          ) : (
            info && <Alert severity="info">{info}</Alert>
          )}
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value.slice(0, 254))}
            slotProps={{ htmlInput: { maxLength: 254, autoComplete: "email" } }}
            required
            fullWidth
          />
          <TextField
            label="Verification code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                autoComplete: "one-time-code",
                maxLength: 6,
                style: { letterSpacing: "0.4em", fontWeight: 700 },
              },
            }}
            required
            fullWidth
          />
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
                    bgcolor: passed ? "success.main" : "action.selected",
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
          <Button onClick={resendCode} disabled={resending}>
            {resending ? "Sending…" : "Resend code"}
          </Button>
          <Button component={NavLink} to="/login">Back to sign in</Button>
        </Box>
      </Card>
    </Box>
  );
}
