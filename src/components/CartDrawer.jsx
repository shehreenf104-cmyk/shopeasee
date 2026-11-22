import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    drawerOpen,
    closeCart,
  } = useCart();

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeCart}
      sx={{
        "& .MuiDrawer-paper": {
          width: 380,
          maxWidth: "100vw",
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px 0 0 20px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <ShoppingCartOutlinedIcon
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: 22 }}
          />
          <Typography
            variant="h6"
            sx={{ color: "white", fontWeight: 700, fontSize: "1.0625rem" }}
          >
            Shopping Cart
          </Typography>
          {cart.length > 0 && (
            <Box
              sx={{
                px: 1.25,
                py: 0.2,
                borderRadius: 50,
                background: "rgba(37,99,235,0.3)",
                border: "1px solid rgba(37,99,235,0.5)",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#93C5FD", fontWeight: 700 }}
              >
                {cart.length}
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton
          onClick={closeCart}
          aria-label="Close cart drawer"
          sx={{
            color: "rgba(255,255,255,0.6)",
            "&:hover": { color: "white", background: "rgba(255,255,255,0.08)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Items */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 2.5,
          py: 2,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {cart.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              py: 10,
              px: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "background.default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
              }}
            >
              <ShoppingCartOutlinedIcon
                sx={{ fontSize: 32, color: "#94A3B8" }}
              />
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Your cart is empty
            </Typography>
            <Typography color="text.secondary" variant="body2" lineHeight={1.7}>
              Add products from the catalog to get started.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {cart.map((item) => (
              <Box
                key={item.id}
                sx={{
                  py: 2.5,
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                {/* Product image */}
                <Box
                  component="img"
                  src={item.image}
                  alt={item.title}
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: "contain",
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
                    border: "1px solid var(--mui-palette-divider)",
                    p: 1,
                    flexShrink: 0,
                  }}
                />

                {/* Info + controls */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      lineHeight: 1.5,
                      mb: 0.75,
                      fontSize: "0.8125rem",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={800}
                    sx={{
                      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      mb: 1.25,
                      fontSize: "0.9375rem",
                    }}
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Quantity controls */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid var(--mui-palette-divider)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 0,
                          "&:hover": { background: "rgba(37,99,235,0.08)" },
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          px: 1.5,
                          minWidth: 28,
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 0,
                          "&:hover": { background: "rgba(37,99,235,0.08)" },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {/* Delete */}
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      sx={{
                        color: "#94A3B8",
                        "&:hover": {
                          color: "#EF4444",
                          background: "rgba(239,68,68,0.08)",
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {cart.length > 0 && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2.5,
            py: 3,
            borderTop: "1px solid var(--mui-palette-divider)",
            background: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <Typography color="text.secondary" fontWeight={500}>
              Subtotal
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
            component={RouterLink}
            to="/checkout"
            variant="contained"
            color="secondary"
            fullWidth
            onClick={closeCart}
            sx={{ py: 1.6, fontSize: "1rem", fontWeight: 700, borderRadius: 3 }}
          >
            Proceed to Checkout
          </Button>
          <Button
            onClick={closeCart}
            fullWidth
            sx={{
              mt: 1,
              py: 1.2,
              color: "text.secondary",
              fontWeight: 500,
              "&:hover": { background: "action.hover" },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

export default CartDrawer;
