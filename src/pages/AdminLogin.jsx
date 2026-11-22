import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, TextField, Typography } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { signIn, isAuthenticated, isAdmin, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate("/admin", { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signIn({ identifier, password });
    } catch {
      // The authentication context exposes the safe error message.
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", background: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 430, p: 4, borderRadius: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <ShieldIcon sx={{ fontSize: 48, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={800} mt={1}>ShopEase Admin</Typography>
          <Typography color="text.secondary">Authorized staff only</Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          <TextField label="Admin username or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to admin"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
