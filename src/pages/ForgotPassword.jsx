import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, TextField, Typography } from "@mui/material";
import { requestPasswordReset } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const result = await requestPasswordReset(normalizedEmail);
      navigate("/reset-password", { state: { email: normalizedEmail, message: result.message, demoCode: result.demoCode } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", p: 2, bgcolor: "background.default" }}>
      <Card sx={{ width: "100%", maxWidth: 460, p: { xs: 3, sm: 4.5 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Forgot password?</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Enter your email address and, if an account matches, we’ll email you a 6-digit verification code.
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value.slice(0, 254))}
            slotProps={{ htmlInput: { maxLength: 254, autoComplete: "email" } }}
            required
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Sending…" : "Send verification code"}
          </Button>
          <Button component={NavLink} to="/login">Back to sign in</Button>
        </Box>
      </Card>
    </Box>
  );
}
