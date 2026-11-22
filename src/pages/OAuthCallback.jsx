import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { exchangeOAuthCode } from "../services/api";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [error, setError] = useState(
    code ? "" : "Social sign-in could not be completed. Please try again.",
  );
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;
    if (!code) {
      return;
    }
    exchangeOAuthCode(code)
      .then((response) => {
        completeOAuth(response);
        navigate("/products", { replace: true });
      })
      .catch(() => setError("Social sign-in could not be completed. Please try again."));
  }, [code, completeOAuth, navigate]);

  return (
    <Box sx={{ minHeight: "calc(100vh - 68px)", display: "grid", placeItems: "center", p: 2 }}>
      <Box sx={{ textAlign: "center" }}>
        {error ? <Alert severity="error">{error}</Alert> : <CircularProgress />}
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {error || "Completing sign-in…"}
        </Typography>
      </Box>
    </Box>
  );
}
