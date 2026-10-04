import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        name: current.name || user.displayName || "",
        email: current.email || user.email || "",
        phone: current.phone || user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (key) => (event) => {
    const value =
      key === "phone"
        ? event.target.value.replace(/[^\d+\s()-]/g, "").slice(0, 20)
        : event.target.value;

    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const phone = form.phone.trim();
    if (!form.name || !form.email || !phone || !form.address) {
      return;
    }

    const existingEntries = JSON.parse(
      localStorage.getItem("shopEaseAddedProducts") ?? "[]",
    );

    const normalizedExistingEntries = existingEntries.map((entry) => ({
      ...entry,
      userPhone:
        entry.userPhone || entry.customerPhone || entry.phone || "N/A",
      customerPhone:
        entry.customerPhone || entry.userPhone || entry.phone || "N/A",
      phone: entry.phone || entry.userPhone || entry.customerPhone || "N/A",
    }));

    const cartProductIds = new Set(cart.map((item) => item.id));
    const filteredExistingEntries = normalizedExistingEntries.filter(
      (entry) => !cartProductIds.has(entry.id),
    );

    const enrichedEntries = cart.map((item) => ({
      ...item,
      quantity: item.quantity,
      addedBy: user?.displayName || form.name,
      userPhone: user?.phone || phone,
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: phone,
      customerAddress: form.address,
      phone: user?.phone || phone,
      addedAt: new Date().toISOString(),
    }));

    const mergedEntries = [...filteredExistingEntries, ...enrichedEntries];
    localStorage.setItem(
      "shopEaseAddedProducts",
      JSON.stringify(mergedEntries),
    );

    setOrderPlaced(true);
    clearCart();
  };

  return (
    <Box sx={{ background: "#F1F5F9", minHeight: "100vh" }}>
      {/* Page header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          py: { xs: 5, md: 7 },
          px: 2,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              color: "#93C5FD",
              letterSpacing: "0.15em",
              fontSize: "0.75rem",
              mb: 1,
              display: "block",
            }}
          >
            CHECKOUT
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "1.875rem", md: "2.5rem" },
            }}
          >
            Complete your order
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem" }}
          >
            Enter your shipping details and review your items.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Empty cart */}
        {cart.length === 0 && !orderPlaced && (
          <Box
            sx={{
              textAlign: "center",
              py: 12,
              px: 3,
              background: "white",
              borderRadius: 4,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Your cart is empty
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Add items from the product catalog before checking out.
            </Typography>
            <Button variant="contained" href="/products" sx={{ px: 4 }}>
              Browse Products
            </Button>
          </Box>
        )}

        {/* Order confirmed */}
        {orderPlaced && (
          <Box
            sx={{
              maxWidth: 560,
              mx: "auto",
              textAlign: "center",
              background: "white",
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10B981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 12px 32px rgba(16,185,129,0.35)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Order Confirmed!
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.7, fontSize: "1.0625rem" }}
            >
              Thank you for your purchase. We have received your order and will
              process it shortly.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography color="text.secondary" fontWeight={500}>
                Order total
              </Typography>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ${subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              href="/products"
              sx={{ mt: 3, px: 5, py: 1.5, fontWeight: 700 }}
            >
              Continue Shopping
            </Button>
          </Box>
        )}

        {/* Checkout form */}
        {cart.length > 0 && !orderPlaced && (
          <Grid container spacing={4}>
            {/* Shipping form */}
            <Grid item xs={12} md={7}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  overflow: "visible",
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 16px rgba(37,99,235,0.3)",
                      }}
                    >
                      <LocalShippingIcon
                        sx={{ color: "white", fontSize: 20 }}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      Shipping Details
                    </Typography>
                  </Box>

                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "grid", gap: 2.5 }}
                  >
                    <TextField
                      label="Full name"
                      value={form.name}
                      onChange={handleChange("name")}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Email address"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Phone number"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      required
                      fullWidth
                      placeholder="+1 234 567 8900"
                    />
                    <TextField
                      label="Shipping address"
                      value={form.address}
                      onChange={handleChange("address")}
                      required
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Street address, City, State, ZIP"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      color="secondary"
                      sx={{
                        py: 1.75,
                        fontSize: "1.0625rem",
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Place Order — ${subtotal.toFixed(2)}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Order summary */}
            <Grid item xs={12} md={5}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  position: { md: "sticky" },
                  top: { md: 100 },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Order Summary
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5 }}
                  >
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </Typography>

                  <Stack spacing={0} divider={<Divider />}>
                    {cart.map((item) => (
                      <Box key={item.id} sx={{ py: 1.75 }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.title}
                            sx={{
                              width: 52,
                              height: 52,
                              objectFit: "contain",
                              borderRadius: 2,
                              background: "#F8FAFC",
                              border: "1px solid rgba(0,0,0,0.05)",
                              p: 0.5,
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.4,
                                mb: 0.5,
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.quantity} × ${item.price.toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ flexShrink: 0 }}
                          >
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ mt: 1, mb: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography color="text.secondary" fontWeight={500}>
                      Subtotal
                    </Typography>
                    <Typography fontWeight={600}>
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2.5,
                    }}
                  >
                    <Typography color="text.secondary" fontWeight={500}>
                      Shipping
                    </Typography>
                    <Typography fontWeight={600} color="success.main">
                      Free
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      background: "#F8FAFC",
                      borderRadius: 2.5,
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography fontWeight={700} fontSize="1.0625rem">
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Checkout;
