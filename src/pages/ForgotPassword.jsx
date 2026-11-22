import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Alert, Box, Button, Card, TextField, Typography } from "@mui/material";
import { requestPasswordReset } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetPath, setResetPath] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetPath("");
    setLoading(true);
    try {
      const result = await requestPasswordReset(email.trim());
      setMessage(result.message);
      setResetPath(result.developmentResetPath || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", p: 2, bgcolor: "#F8FAFC" }}>
      <Card sx={{ width: "100%", maxWidth: 460, p: { xs: 3, sm: 4.5 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Forgot password?</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Enter your email address and, if an account matches, we’ll email a secure reset link.
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
          {message && <Alert severity="success">{message}</Alert>}
          {resetPath && (
            <Button component={NavLink} to={resetPath} variant="outlined">
              Reset password (local development)
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <Button component={NavLink} to="/login">Back to sign in</Button>
        </Box>
      </Card>
    </Box>
  );
}
