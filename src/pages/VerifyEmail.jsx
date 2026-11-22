import { useEffect, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Card, Typography } from "@mui/material";
import { verifyEmail } from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    token ? "" : "This verification link is invalid or expired.",
  );
  const [loading, setLoading] = useState(Boolean(token));
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    if (!token) {
      return;
    }
    verifyEmail(token)
      .then((result) => setMessage(result.message))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", p: 2, bgcolor: "#F8FAFC" }}>
      <Card sx={{ width: "100%", maxWidth: 460, p: { xs: 3, sm: 4.5 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Verify your email</Typography>
        {loading && <Typography color="text.secondary">Verifying your ShopEase account…</Typography>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {!loading && (
          <Button component={NavLink} to="/login" variant="contained" fullWidth>
            Continue to sign in
          </Button>
        )}
      </Card>
    </Box>
  );
}
