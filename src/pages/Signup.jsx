import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    firstname: "",
    lastname: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationPath, setVerificationPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const isPasswordValid =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}$/.test(form.password);
  const passwordChecks = [
    /[A-Z]/.test(form.password),
    /[a-z]/.test(form.password),
    /[0-9]/.test(form.password),
    /[!@#$%^&]/.test(form.password),
    form.password.length >= 8,
  ];
  const passwordStrength = passwordChecks.filter(Boolean).length;

  const isSignupFormValid =
    /^[A-Za-z]{4,22}$/.test(form.username) &&
    /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(form.email) &&
    form.phone.trim() !== "" &&
    form.firstname.trim() !== "" &&
    form.lastname.trim() !== "" &&
    isPasswordValid &&
    form.password === form.confirmPassword;

  const handleChange = (key) => (event) => {
    const value = event.target.value;

    if (key === "firstname" || key === "lastname") {
      const cleaned = value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 50);
      setForm((current) => ({ ...current, [key]: cleaned }));
      return;
    }

    if (key === "phone") {
      const cleaned = value.replace(/[^\d+\s()-]/g, "").slice(0, 20);
      setForm((current) => ({ ...current, [key]: cleaned }));
      return;
    }

    const maxLength = key === "username" ? 22 : key === "email" ? 254 : 128;
    setForm((current) => ({ ...current, [key]: value.slice(0, maxLength) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setVerificationPath("");

    const firstName = form.firstname.trim();
    const lastName = form.lastname.trim();
    const password = form.password;

    if (!firstName || !lastName || !form.username || !password || !form.email || !form.phone) {
      setError("Full name, username, email, phone number, and password are required.");
      return;
    }

    if (!/^[A-Za-z]{4,22}$/.test(form.username)) {
      setError("Username must contain only letters and be 4 to 22 characters.");
      return;
    }

    if (!form.email.includes("@") || !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(form.email)) {
      setError("Please enter valid Gmail with @");
      return;
    }

    if (firstName && !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(firstName)) {
      setError(
        "First name can only contain letters, spaces, apostrophes, and hyphens.",
      );
      return;
    }

    if (lastName && !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(lastName)) {
      setError(
        "Last name can only contain letters, spaces, apostrophes, and hyphens.",
      );
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}$/.test(password)) {
      setError("Password must be 8+ characters with uppercase, lowercase, number, and special sign.");
      return;
    }

    if (password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^\+?[0-9()\-\s]{7,20}$/.test(form.phone.trim())) {
      setError("Please enter a valid phone number for international use.");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        username: form.username,
        password,
        email: form.email,
        phone: form.phone.trim(),
        name: {
          firstname: firstName,
          lastname: lastName,
        },
      });
      setSuccess(result.message || "Account created. Check your email to verify it before signing in.");
      if (result.developmentVerificationPath) {
        setVerificationPath(result.developmentVerificationPath);
      } else {
        setTimeout(() => navigate("/login"), 1800);
      }
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 68px)",
        background: "#F8FAFC",
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
          maxWidth: 520,
          p: { xs: 3, sm: 4.5 },
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
          border: "1px solid rgba(0,0,0,0.05)",
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
            Create your account
          </Typography>
          <Typography color="text.secondary" fontSize="0.9375rem">
            Join{" "}
            <Box component="span" fontWeight={700} color="primary.main">
              ShopEase
            </Box>{" "}
            and start shopping today
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2.5 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First name"
                value={form.firstname}
                onChange={handleChange("firstname")}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last name"
                value={form.lastname}
                onChange={handleChange("lastname")}
                required
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            slotProps={{ htmlInput: { maxLength: 254 } }}
            fullWidth
            required
          />
          <TextField
            label="Phone number"
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            fullWidth
            required
            placeholder="+1 234 567 8900"
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={handleChange("username")}
            slotProps={{ htmlInput: { maxLength: 22, autoComplete: "username" } }}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange("password")}
            fullWidth
            required
            slotProps={{
              htmlInput: { maxLength: 128, autoComplete: "new-password" },
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
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            slotProps={{ htmlInput: { maxLength: 128, autoComplete: "new-password" } }}
            fullWidth
            required
            error={Boolean(form.confirmPassword) && form.confirmPassword !== form.password}
            helperText={
              form.confirmPassword && form.confirmPassword !== form.password
                ? "Passwords do not match."
                : ""
            }
          />

          {(error || success) && (
            <Alert severity={error ? "error" : "success"}>
              {error || success}
            </Alert>
          )}
          {verificationPath && (
            <Button component={NavLink} to={verificationPath} variant="outlined">
              Verify email (local development)
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isSignupFormValid}
            fullWidth
            sx={{
              py: 1.6,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 3,
              opacity: loading || !isSignupFormValid ? 0.6 : 1,
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Already have an account?
          </Typography>
        </Divider>

        <Button
          component={NavLink}
          to="/login"
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
          Sign in instead
        </Button>
      </Card>
    </Box>
  );
}

export default Signup
