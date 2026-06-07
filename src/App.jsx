import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import TopBar from "./components/TopBar";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB",
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FF6B35",
      light: "#FF8C5A",
      dark: "#E55A2B",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F1F5F9",
      paper: "#ffffff",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    error: { main: "#EF4444" },
    success: { main: "#10B981" },
  },
  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2 },
    h3: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: "0.01em" },
    overline: { fontWeight: 700, letterSpacing: "0.1em" },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    "0 2px 6px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
    "0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
    "0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
    "0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
    "0 12px 32px rgba(0,0,0,0.09), 0 4px 12px rgba(0,0,0,0.05)",
    "0 14px 36px rgba(0,0,0,0.10), 0 4px 14px rgba(0,0,0,0.06)",
    "0 16px 40px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)",
    "0 18px 44px rgba(0,0,0,0.11), 0 6px 18px rgba(0,0,0,0.06)",
    "0 20px 48px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.07)",
    "0 22px 52px rgba(0,0,0,0.12), 0 8px 22px rgba(0,0,0,0.07)",
    "0 24px 56px rgba(0,0,0,0.13), 0 8px 24px rgba(0,0,0,0.08)",
    "0 26px 60px rgba(0,0,0,0.13), 0 10px 26px rgba(0,0,0,0.08)",
    "0 28px 64px rgba(0,0,0,0.14), 0 10px 28px rgba(0,0,0,0.09)",
    "0 30px 68px rgba(0,0,0,0.14), 0 10px 30px rgba(0,0,0,0.09)",
    "0 32px 72px rgba(0,0,0,0.15), 0 12px 32px rgba(0,0,0,0.10)",
    "0 34px 76px rgba(0,0,0,0.15), 0 12px 34px rgba(0,0,0,0.10)",
    "0 36px 80px rgba(0,0,0,0.16), 0 12px 36px rgba(0,0,0,0.11)",
    "0 38px 84px rgba(0,0,0,0.16), 0 14px 38px rgba(0,0,0,0.11)",
    "0 40px 88px rgba(0,0,0,0.17), 0 14px 40px rgba(0,0,0,0.12)",
    "0 42px 92px rgba(0,0,0,0.17), 0 14px 42px rgba(0,0,0,0.12)",
    "0 44px 96px rgba(0,0,0,0.18), 0 16px 44px rgba(0,0,0,0.12)",
    "0 46px 100px rgba(0,0,0,0.18), 0 16px 46px rgba(0,0,0,0.13)",
    "0 48px 104px rgba(0,0,0,0.19), 0 16px 48px rgba(0,0,0,0.14)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          padding: "9px 22px",
          fontSize: "0.9375rem",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
            boxShadow: "0 6px 20px rgba(37,99,235,0.5)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)",
          boxShadow: "0 4px 14px rgba(255,107,53,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #E55A2B 0%, #CC4E24 100%)",
            boxShadow: "0 6px 20px rgba(255,107,53,0.5)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        outlinedPrimary: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            background: "rgba(37,99,235,0.04)",
          },
        },
        outlinedSecondary: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            background: "rgba(255,107,53,0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.25s ease, transform 0.25s ease",
          border: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation3: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.04)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            background: "#ffffff",
            transition: "box-shadow 0.2s ease",
            "& fieldset": { borderColor: "rgba(0,0,0,0.14)" },
            "&:hover fieldset": { borderColor: "#2563EB" },
            "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(37,99,235,0.12)" },
            "&.Mui-focused fieldset": {
              borderColor: "#2563EB",
              borderWidth: "1.5px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: "0.8125rem",
          transition: "all 0.15s ease",
        },
        filledPrimary: { background: "#2563EB", color: "#ffffff" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          boxShadow: "0 2px 24px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: "20px 0 0 20px",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: "rgba(0,0,0,0.06)" } },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { transition: "background 0.2s ease, transform 0.15s ease" },
      },
    },
  },
});

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: { xs: 4, md: 5 },
        px: 3,
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        color: "rgba(255,255,255,0.6)",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "white",
          fontWeight: 700,
          mb: 0.75,
          fontSize: "1.125rem",
          letterSpacing: "-0.01em",
        }}
      >
        ShopEase
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <TopBar />
              <CartDrawer />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <Products />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/:id"
                    element={
                      <ProtectedRoute>
                        <ProductDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
