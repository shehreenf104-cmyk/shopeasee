import { useEffect, useState } from 'react'
import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../context/AuthContext";
import { getOAuthUrl } from "../services/api";

function Login() {
  const { signIn, isAuthenticated, isAdmin, error, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/products";
  const oauthError = new URLSearchParams(location.search).get("oauthError");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!identifier || !password) {
      setFormError("Username/email and password are required.");
      return;
    }
    setFormError("");
    try {
      await signIn({ identifier, password, rememberMe });
    } catch {
      // Error is handled by auth context
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 68px)",
        background: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4.5 },
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
          border: "1px solid var(--mui-palette-divider)",
          borderRadius: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3.5,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
              boxShadow: "0 10px 28px rgba(37,99,235,0.4)",
            }}
          >
            <StorefrontIcon sx={{ color: "white", fontSize: 30 }} />
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            letterSpacing="-0.02em"
            gutterBottom
          >
            Welcome back
          </Typography>
          <Typography color="text.secondary" fontSize="0.9375rem">
            Sign in to continue to{" "}
            <Box component="span" fontWeight={700} color="primary.main">
              ShopEase
            </Box>
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2.5 }}
        >
          <TextField
            label="Username or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value.slice(0, 254))}
            fullWidth
            autoFocus
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value.slice(0, 128))}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowPassword((value) => !value)}
                      sx={{
                        minWidth: 72,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: "none",
                        px: 1.25,
                        py: 0.6,
                        borderColor: "rgba(59,130,246,0.5)",
                        color: "primary.main",
                        backgroundColor: "rgba(37,99,235,0.04)",
                        "&:hover": {
                          backgroundColor: "rgba(37,99,235,0.08)",
                          borderColor: "primary.main",
                        },
                      }}
                      startIcon={
                        showPassword ? <VisibilityOff /> : <Visibility />
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              mt: -1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Button component={NavLink} to="/forgot-password" size="small">
              Forgot password?
            </Button>
          </Box>

          {(formError || error) && (
            <Alert severity="error">{formError || error}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
            sx={{ py: 1.6, fontSize: "1rem", fontWeight: 700, borderRadius: 3 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Or continue with
          </Typography>
        </Divider>

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={() => window.location.assign(getOAuthUrl("google"))}
            sx={{ py: 1.25, borderRadius: 3, textTransform: "none" }}
          >
            Continue with Google
          </Button>
        </Box>

        {oauthError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {oauthError === "state"
              ? "The sign-in request could not be verified. Please try again."
              : `Unable to sign in with ${oauthError === "facebook" ? "Facebook" : "Google"}.`}
          </Alert>
        )}

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            New to ShopEase?
          </Typography>
        </Divider>

        <Button
          component={NavLink}
          to="/signup"
          variant="outlined"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: "0.9375rem",
            borderWidth: "1.5px",
            "&:hover": { borderWidth: "1.5px" },
          }}
        >
          Create a free account
        </Button>
      </Card>
    </Box>
  );
}

export default Login
